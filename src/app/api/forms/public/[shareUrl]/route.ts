import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the GET request for fetching a public form by its share URL.
 *
 * @param request - The incoming Next.js request object.
 * @param params - The route parameters containing the `shareUrl`.
 * @returns A JSON response containing the public form data or an error message.
 *
 * @remarks
 * - Fetches the form data from the `forms` table using the provided `shareUrl`.
 * - Ensures the form is published (`is_published` is true).
 * - Updates the view count in the `form_analytics` table.
 * - Removes sensitive data before returning the form for public access.
 * - Sorts the form fields by their `field_order` property.
 *
 * @throws Returns a 404 response if the form is not found or unpublished.
 * @throws Returns a 500 response in case of an internal server error.
 *
 * @example
 * // Example route usage:
 * GET /api/forms/public/{shareUrl}
 *
 * // Example response:
 * {
 *   "form": {
 *     "id": "123",
 *     "title": "Sample Form",
 *     "description": "This is a sample form.",
 *     "settings": { ... },
 *     "password_protected": false,
 *     "form_fields": [
 *       { "id": "1", "field_order": 1, ... },
 *       { "id": "2", "field_order": 2, ... }
 *     ]
 *   }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareUrl: string }> }
) {
  try {
    const supabase = await createClient();
    const { shareUrl } = await params;

    // Get form by share URL
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select(
        `
        id,
        title,
        description,
        settings,
        is_published,
        password_protected,
        form_fields(*),
        form_analytics(views)
      `
      )
      .eq("share_url", shareUrl)
      .eq("is_published", true)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Update view count
    const currentViews = form.form_analytics?.[0]?.views || 0;
    await supabase
      .from("form_analytics")
      .update({ views: currentViews + 1 })
      .eq("form_id", form.id);

    // Remove sensitive data for public access
    const publicForm = {
      id: form.id,
      title: form.title,
      description: form.description,
      settings: form.settings,
      password_protected: form.password_protected,
      form_fields: form.form_fields.sort(
        (a, b) => a.field_order - b.field_order
      ),
    };

    return NextResponse.json({ form: publicForm });
  } catch (error) {
    console.error("Error fetching public form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handles the submission of a public form via a POST request.
 *
 * @param request - The incoming HTTP request object.
 * @param params - The route parameters, including the `shareUrl` of the form.
 *
 * @returns A JSON response indicating the result of the form submission.
 *
 * ### Behavior:
 * - Retrieves the form details from the database using the provided `shareUrl`.
 * - Validates the form's password protection, if applicable.
 * - Ensures all required fields are present in the submission.
 * - Saves the form response to the database.
 * - Updates form analytics, including submission count and average completion time.
 *
 * ### Possible Responses:
 * - `200 OK`: Form submitted successfully, returns the response ID.
 * - `400 Bad Request`: Missing required fields, returns the list of missing fields.
 * - `401 Unauthorized`: Invalid or missing password for password-protected forms.
 * - `404 Not Found`: Form not found or not published.
 * - `500 Internal Server Error`: An error occurred during form submission.
 *
 * ### Metadata:
 * - Includes additional metadata such as IP address, user agent, completion time, and submission method.
 *
 * ### Errors:
 * - Logs errors to the console for debugging purposes.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareUrl: string }> }
) {
  try {
    const supabase = await createClient();
    const { shareUrl } = await params;

    const submissionData = await request.json();
    const { responses, metadata = {} } = submissionData;

    // Get form details
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select(
        `
        *,
        form_fields(*)
      `
      )
      .eq("share_url", shareUrl)
      .eq("is_published", true)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Check password protection
    if (form.password_protected && form.password_hash) {
      const providedPassword = metadata.password;
      if (!providedPassword || providedPassword !== form.password_hash) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        );
      }
    }

    // Validate required fields
    const requiredFields = form.form_fields.filter(
      (field: any) => field.required
    );
    const missingFields = requiredFields.filter((field: any) => {
      const value = responses[field.id];

      if (field.field_type === "file") {
        // File fields need special handling - check if files array is empty
        return !value || !Array.isArray(value) || value.length === 0;
      } else {
        // Regular fields
        return !value || value === "";
      }
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields: missingFields.map((f: any) => f.label),
        },
        { status: 400 }
      );
    }

    // Create form response
    const { data: newResponse, error: responseError } = await supabase
      .from("form_responses")
      .insert({
        form_id: form.id,
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

    // Save file upload metadata if there are any files
    if (metadata.fileUploads && metadata.fileUploads.length > 0) {
      const fileUploadRecords = metadata.fileUploads.flatMap(
        (fieldUpload: any) =>
          fieldUpload.files.map((file: any) => ({
            form_id: form.id,
            field_id: fieldUpload.fieldId,
            response_id: newResponse.id,
            original_name: file.name,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            file_path: file.path,
          }))
      );

      if (fileUploadRecords.length > 0) {
        const { error: fileError } = await supabase
          .from("file_uploads")
          .insert(fileUploadRecords);

        if (fileError) {
          console.error("Failed to save file upload metadata:", fileError);
          // Note: We don't throw here as the form submission was successful
        }
      }
    }

    // Update form analytics
    const { data: analytics } = await supabase
      .from("form_analytics")
      .select("*")
      .eq("form_id", form.id)
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
          conversion_rate:
            analytics.views > 0 ? (newSubmissions / analytics.views) * 100 : 0,
        })
        .eq("form_id", form.id);
    }

    return NextResponse.json({
      message: "Form submitted successfully",
      responseId: newResponse.id,
    });
  } catch (error) {
    console.error("Error submitting public form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
