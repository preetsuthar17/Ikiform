import { NextRequest, NextResponse } from "next/server";
import {
  SubmissionService,
  FormSubmissionData,
} from "@/lib/services/submissionService";

/**
 * Handles the POST request for submitting a form.
 *
 * @param request - The incoming HTTP request object.
 * @param context - An object containing route parameters.
 * @param context.params - The route parameters.
 * @param context.params.formId - The ID of the form being submitted.
 *
 * @returns A JSON response indicating the success or failure of the form submission.
 *
 * The function performs the following steps:
 * 1. Parses the request body to extract submission data.
 * 2. Retrieves the client's IP address and user agent from the request headers.
 * 3. Constructs a `FormSubmissionData` object with the extracted data.
 * 4. Calls the `SubmissionService.submitForm` method to process the submission.
 * 5. Returns a 201 status code with the result if the submission is successful.
 * 6. Returns a 400 status code with an error message if the submission fails.
 * 7. Returns a 500 status code with a generic error message in case of an exception.
 *
 * @throws Will log an error and return a 500 status code if an unexpected error occurs.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const body = await request.json();
    const { formId } = params;

    // Get client IP and user agent
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0] || realIp || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

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
 *
 * @param request - The incoming Next.js request object.
 * @param context - An object containing route parameters.
 * @param context.params - The route parameters.
 * @param context.params.formId - The ID of the form whose submissions are to be fetched.
 *
 * @returns A JSON response containing the submissions for the specified form.
 *          If an error occurs, returns a JSON response with an error message and a 500 status code.
 *
 * @throws Logs an error to the console if fetching submissions fails.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const { formId } = params;
    const submissions = await SubmissionService.getFormSubmissions(formId);

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
