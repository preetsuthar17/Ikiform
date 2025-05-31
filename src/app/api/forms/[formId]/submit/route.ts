import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FormResponse } from "@/lib/types/forms";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const supabase = await createClient();
    const { formId } = await params;

    const submissionData = await request.json();
    const { responses, metadata = {} } = submissionData;

    // Get form details and verify it's published
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select(
        `
        *,
        form_fields(*)
      `
      )
      .eq("id", formId)
      .eq("is_published", true)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: "Form not found or not published" },
        { status: 404 }
      );
    }

    // Check password protection
    if (form.password_protected && form.password_hash) {
      const providedPassword = metadata.password;
      if (!providedPassword) {
        return NextResponse.json(
          { error: "Password required" },
          { status: 401 }
        );
      }

      // Simple password check (in production, use proper hashing)
      if (providedPassword !== form.password_hash) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        );
      }
    }

    // Validate required fields
    const requiredFields = form.form_fields.filter(
      (field: { required: any }) => field.required
    );
    const missingFields = requiredFields.filter(
      (field: { id: string | number }) =>
        !responses[field.id] || responses[field.id] === ""
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields: missingFields.map((f: { label: any }) => f.label),
        },
        { status: 400 }
      );
    }

    // Validate field values based on field types and validation rules
    const validationErrors: { [key: string]: string } = {};

    for (const field of form.form_fields) {
      const value = responses[field.id];
      if (!value && !field.required) continue;

      // Basic validation based on field type
      switch (field.field_type) {
        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value && !emailRegex.test(value)) {
            validationErrors[field.id] = "Invalid email format";
          }
          break;

        case "number":
          if (value && isNaN(Number(value))) {
            validationErrors[field.id] = "Must be a valid number";
          }
          break;

        case "url":
          try {
            if (value) new URL(value);
          } catch {
            validationErrors[field.id] = "Must be a valid URL";
          }
          break;

        case "phone":
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (value && !phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""))) {
            validationErrors[field.id] = "Invalid phone number format";
          }
          break;
      }

      // Custom validation rules
      if (field.validation_rules && value) {
        const rules = field.validation_rules;

        if (rules.minLength && value.length < rules.minLength) {
          validationErrors[field.id] =
            `Minimum ${rules.minLength} characters required`;
        }

        if (rules.maxLength && value.length > rules.maxLength) {
          validationErrors[field.id] =
            `Maximum ${rules.maxLength} characters allowed`;
        }

        if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
          validationErrors[field.id] = rules.patternError || "Invalid format";
        }

        if (rules.min && Number(value) < rules.min) {
          validationErrors[field.id] = `Minimum value is ${rules.min}`;
        }

        if (rules.max && Number(value) > rules.max) {
          validationErrors[field.id] = `Maximum value is ${rules.max}`;
        }
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          validationErrors,
        },
        { status: 400 }
      );
    }

    // Create form response
    const { data: newResponse, error: responseError } = await supabase
      .from("form_responses")
      .insert({
        form_id: formId,
        response_data: responses,
        ip_address:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
        completion_time: metadata.completion_time || 0,
      })
      .select()
      .single();

    if (responseError) {
      console.error("Error creating response:", responseError);
      return NextResponse.json(
        { error: "Failed to submit form" },
        { status: 500 }
      );
    }

    // Update form analytics
    const { data: analytics } = await supabase
      .from("form_analytics")
      .select("*")
      .eq("form_id", formId)
      .single();

    if (analytics) {
      const newSubmissions = analytics.submissions + 1;
      const totalTime =
        analytics.average_completion_time * analytics.submissions +
        (metadata.completion_time || 0);
      const newAverageTime = totalTime / newSubmissions;

      await supabase
        .from("form_analytics")
        .update({
          submissions: newSubmissions,
          average_completion_time: newAverageTime,
          conversion_rate: (newSubmissions / analytics.views) * 100,
        })
        .eq("form_id", formId);
    }

    return NextResponse.json({
      message: "Form submitted successfully",
      responseId: newResponse.id,
    });
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const supabase = await createClient();
    const { formId } = await params;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify form ownership
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("id")
      .eq("id", formId)
      .eq("user_id", user.id)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Get form responses
    const { data: responses, error: responsesError } = await supabase
      .from("form_responses")
      .select("*")
      .eq("form_id", formId)
      .order("submitted_at", { ascending: false });

    if (responsesError) {
      return NextResponse.json(
        { error: responsesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("Error fetching form responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
