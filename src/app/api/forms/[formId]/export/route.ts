import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: {
    formId: string;
  };
}

/**
 * Handles the GET request to export form data in either JSON or CSV format.
 *
 * @param request - The incoming Next.js request object.
 * @param params - The route parameters containing the `formId`.
 * @returns A `NextResponse` containing the exported form data in the requested format
 *          (JSON or CSV) or an error response if the operation fails.
 *
 * ### Behavior:
 * - Authenticates the user using Supabase.
 * - Verifies the ownership of the form and retrieves the form details along with its fields.
 * - Fetches the form responses from the database.
 * - Exports the form data in the requested format:
 *   - **JSON**: Includes form details, fields, responses, and export timestamp.
 *   - **CSV**: Includes headers and rows with response data, metadata, and completion time.
 * - Returns the exported data as a downloadable file with appropriate headers.
 *
 * ### Error Handling:
 * - Returns a 401 response if the user is unauthorized.
 * - Returns a 404 response if the form is not found or the user does not own the form.
 * - Returns a 500 response for any internal server errors or database issues.
 *
 * ### Query Parameters:
 * - `format` (optional): Specifies the export format. Defaults to `"csv"` if not provided.
 *
 * ### Example Usage:
 * - Export form data as JSON:
 *   `/api/forms/{formId}/export?format=json`
 * - Export form data as CSV:
 *   `/api/forms/{formId}/export?format=csv`
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { formId } = params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify form ownership and get form with fields
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select(
        `
        *,
        form_fields(*)
      `
      )
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
      .order("submitted_at", { ascending: true });

    if (responsesError) {
      return NextResponse.json(
        { error: responsesError.message },
        { status: 500 }
      );
    }

    if (format === "json") {
      // Return JSON format
      const exportData = {
        form: {
          id: form.id,
          title: form.title,
          description: form.description,
          created_at: form.created_at,
        },
        fields: form.form_fields.sort(
          (a: { field_order: number }, b: { field_order: number }) =>
            a.field_order - b.field_order
        ),
        responses: responses,
        exported_at: new Date().toISOString(),
      };

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${form.title}_responses.json"`,
        },
      });
    } else {
      // Return CSV format
      const fields = form.form_fields.sort(
        (a: { field_order: number }, b: { field_order: number }) =>
          a.field_order - b.field_order
      );

      // Create CSV headers
      const headers = [
        "Response ID",
        "Submitted At",
        ...fields.map((f: { label: any }) => f.label),
        "IP Address",
        "User Agent",
        "Completion Time (seconds)",
      ];

      // Create CSV rows
      const rows = responses.map((response) => [
        response.id,
        response.submitted_at,
        ...fields.map((field: { id: string | number }) => {
          const value = response.response_data[field.id];
          if (Array.isArray(value)) {
            return value.join("; ");
          }
          return value || "";
        }),
        response.metadata?.ip_address || "",
        response.metadata?.user_agent || "",
        response.metadata?.completion_time || "",
      ]);

      // Convert to CSV string
      const csvContent = [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => {
              // Escape quotes and wrap in quotes if necessary
              const cellStr = String(cell);
              if (
                cellStr.includes(",") ||
                cellStr.includes('"') ||
                cellStr.includes("\n")
              ) {
                return `"${cellStr.replace(/"/g, '""')}"`;
              }
              return cellStr;
            })
            .join(",")
        )
        .join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${form.title}_responses.csv"`,
        },
      });
    }
  } catch (error) {
    console.error("Error exporting form data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handles the POST request to export form responses based on the provided filters and format.
 *
 * @param request - The incoming HTTP request object.
 * @param params - The route parameters containing the `formId`.
 * @returns A JSON response indicating the status of the export operation.
 *
 * @remarks
 * - This function verifies the user's authentication and form ownership before proceeding.
 * - Filters such as `startDate` and `endDate` can be applied to narrow down the responses.
 * - The export process is initiated, and a unique `exportId` is generated for tracking.
 * - In a real-world scenario, the export job might involve asynchronous processing and cloud storage.
 *
 * @throws Returns a 401 status if the user is unauthorized.
 * @throws Returns a 404 status if the form is not found or the user does not own the form.
 * @throws Returns a 500 status if there is an error during the export process.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { formId } = params;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { format, filters = {} } = await request.json();

    // Verify form ownership
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("id, title")
      .eq("id", formId)
      .eq("user_id", user.id)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Build query with filters
    let query = supabase
      .from("form_responses")
      .select("*")
      .eq("form_id", formId);

    if (filters.startDate) {
      query = query.gte("submitted_at", filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte("submitted_at", filters.endDate);
    }

    const { data: responses, error: responsesError } = await query.order(
      "submitted_at",
      { ascending: true }
    );

    if (responsesError) {
      return NextResponse.json(
        { error: responsesError.message },
        { status: 500 }
      );
    }

    // Generate download URL or return data based on format
    const exportId = `export_${formId}_${Date.now()}`;

    // In a real application, you might want to:
    // 1. Store the export job in a queue
    // 2. Generate the file asynchronously
    // 3. Store the file in cloud storage
    // 4. Send email notification when ready

    return NextResponse.json({
      message: "Export initiated",
      exportId,
      totalRecords: responses.length,
      format,
    });
  } catch (error) {
    console.error("Error initiating export:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
