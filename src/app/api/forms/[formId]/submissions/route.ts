import { NextRequest, NextResponse } from "next/server";
import {
  SubmissionService,
  FormSubmissionData,
} from "@/lib/services/submissionService";
import { createClient } from "@/lib/supabase/server";
import { getClientIP, getUserAgent } from "@/lib/utils/ip";

/**
 * Handles the POST request for submitting a form.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const body = await request.json();
    const { formId } = await params;

    // Get client IP and user agent using improved detection
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    const submissionData: FormSubmissionData = {
      formId,
      responseData: body.responseData || {},
      respondentEmail: body.respondentEmail,
      ipAddress,
      userAgent,
      completionTime: body.completionTime,
      fileUploads: body.fileUploads || [],
    };

    const result = await SubmissionService.submitForm(submissionData);

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
  } catch (error) {
    console.error("Form submission API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handles the GET request to fetch submissions for a specific form.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const supabase = await createClient();
    const { formId } = await params;

    console.log("🔍 Fetching submissions for formId:", formId);

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("❌ Authentication failed:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ User authenticated:", user.id);

    // Verify form ownership
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("id, title")
      .eq("id", formId)
      .eq("user_id", user.id)
      .single();

    if (formError || !form) {
      console.log("❌ Form not found or access denied:", formError);
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    console.log("✅ Form found:", form.title);

    // Try direct query to bypass any potential issues
    console.log(
      "🔍 Direct query: Fetching submissions from form_responses table"
    );

    const { data: directSubmissions, error: submissionsError } = await supabase
      .from("form_responses")
      .select("*")
      .eq("form_id", formId)
      .order("submitted_at", { ascending: false });

    if (submissionsError) {
      console.error("❌ Direct query error:", submissionsError);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    console.log("📊 Direct query result:", directSubmissions);
    console.log("📋 Direct query count:", directSubmissions?.length || 0);

    // Add detailed debugging for each submission
    if (directSubmissions && directSubmissions.length > 0) {
      directSubmissions.forEach((submission, index) => {
        console.log(`📝 Submission ${index + 1}:`, {
          id: submission.id,
          form_id: submission.form_id,
          submitted_at: submission.submitted_at,
          respondent_email: submission.respondent_email,
        });
      });
    }

    // Return as 'responses' to match the expected format in formService
    return NextResponse.json({ responses: directSubmissions });
  } catch (error) {
    console.error("❌ Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
