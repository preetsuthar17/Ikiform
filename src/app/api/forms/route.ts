import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Form, FormField } from "@/lib/types/forms";

/**
 * Handles the GET request to fetch forms associated with the authenticated user.
 *
 * @param {NextRequest} request - The incoming HTTP request object.
 * @returns {Promise<NextResponse>} A JSON response containing the user's forms or an error message.
 *
 * @remarks
 * - This function uses Supabase to authenticate the user and fetch their forms.
 * - The forms are enriched with their associated fields (`form_fields`) for frontend compatibility.
 * - If the user is not authenticated, a 401 Unauthorized response is returned.
 * - If an error occurs while fetching forms, a 500 Internal Server Error response is returned.
 *
 * @throws {Error} If an unexpected error occurs during the process.
 *
 * @example
 * // Example response structure:
 * {
 *   "forms": [
 *     {
 *       "id": "form1",
 *       "name": "Sample Form",
 *       "fields": [
 *         { "id": "field1", "type": "text", "label": "Name" },
 *         { "id": "field2", "type": "email", "label": "Email" }
 *       ],
 *       "form_analytics": { ... }
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Enhanced debugging for production issues
    if (process.env.NODE_ENV === "production") {
      console.log("Auth debug info:", {
        hasUser: !!user,
        authError: authError?.message,
        userAgent: request.headers.get("user-agent"),
        origin: request.headers.get("origin"),
        referer: request.headers.get("referer"),
        cookieCount: request.cookies.getAll().length,
      });
    }

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } // Get user's forms
    const { data: forms, error: formsError } = await supabase
      .from("forms")
      .select(
        `
        *,
        form_fields(*),
        form_analytics(*)
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (formsError) {
      return NextResponse.json({ error: formsError.message }, { status: 500 });
    }

    // Map form_fields to fields for frontend compatibility
    const formsWithFields =
      forms?.map((form) => ({
        ...form,
        fields: form.form_fields || [],
      })) || [];

    return NextResponse.json({ forms: formsWithFields });
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Handles the POST request to create a new form along with its associated fields and analytics entry.
 *
 * @param {NextRequest} request - The incoming HTTP request object.
 * @returns {Promise<NextResponse>} A JSON response containing the created form or an error message.
 *
 * @throws {Error} Returns a 500 status code with an error message if an unexpected error occurs.
 *
 * The function performs the following steps:
 * 1. Authenticates the user using Supabase's `auth.getUser` method.
 *    - If the user is not authenticated, returns a 401 Unauthorized response.
 * 2. Parses the request body to extract the `form` and `fields` data.
 * 3. Creates a new form in the `forms` table with the provided data.
 *    - If an error occurs during form creation, returns a 500 response with the error message.
 * 4. Optionally creates form fields in the `form_fields` table if `fields` are provided.
 *    - Logs an error if field creation fails but continues execution.
 * 5. Creates an analytics entry in the `form_analytics` table for the newly created form.
 *    - Logs an error if analytics creation fails but continues execution.
 * 6. Returns the created form as a JSON response.
 *
 * Notes:
 * - The function ensures default values for form properties such as `title`, `description`, `settings`, etc.
 * - Errors during field or analytics creation are logged but do not interrupt the main form creation process.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { form, fields } = body;

    // Create new form
    const { data: newForm, error: formError } = await supabase
      .from("forms")
      .insert({
        user_id: user.id,
        title: form.title || "Untitled Form",
        description: form.description || "",
        settings: form.settings || {},
        is_published: form.is_published || false,
        password_protected: form.password_protected || false,
        password_hash: form.password_hash || null,
      })
      .select()
      .single();

    if (formError) {
      return NextResponse.json({ error: formError.message }, { status: 500 });
    }

    // Create form fields if any
    if (fields && fields.length > 0) {
      const fieldsToInsert = fields.map((field: FormField, index: number) => ({
        form_id: newForm.id,
        field_type: field.field_type,
        label: field.label,
        placeholder: field.placeholder || null,
        options: field.options || [],
        required: field.required || false,
        field_order: index,
        validation_rules: field.validation_rules || {},
        conditional_logic: field.conditional_logic || {},
      }));

      const { error: fieldsError } = await supabase
        .from("form_fields")
        .insert(fieldsToInsert);

      if (fieldsError) {
        console.error("Error creating form fields:", fieldsError);
        // Continue execution - form is created, fields failed
      }
    }

    // Create analytics entry
    const { error: analyticsError } = await supabase
      .from("form_analytics")
      .insert({
        form_id: newForm.id,
        views: 0,
        submissions: 0,
        average_completion_time: 0,
        bounce_rate: 0,
        conversion_rate: 0,
      });

    if (analyticsError) {
      console.error("Error creating analytics:", analyticsError);
      // Continue execution
    }

    return NextResponse.json({ form: newForm });
  } catch (error) {
    console.error("Error creating form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
