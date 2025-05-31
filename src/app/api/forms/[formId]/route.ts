import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FormField } from "@/lib/types/forms";

/**
 * Handles the GET request for fetching a specific form along with its fields and analytics.
 *
 * @param request - The incoming Next.js request object.
 * @param params - The route parameters containing the `formId`.
 * @returns A JSON response containing the form data or an error message with the appropriate HTTP status code.
 *
 * @throws Returns a 401 status if the user is unauthorized.
 * @throws Returns a 404 status if the form is not found.
 * @throws Returns a 500 status for any other server-side errors.
 *
 * The function performs the following steps:
 * 1. Creates a Supabase client instance.
 * 2. Retrieves the current authenticated user.
 * 3. Fetches the form data from the "forms" table, including its associated fields and analytics.
 * 4. Maps the `form_fields` to a `fields` property for frontend compatibility.
 * 5. Returns the form data in a JSON response.
 */
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
    } // Get form with fields and analytics
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select(
        `
        *,
        form_fields(*),
        form_analytics(*)
      `
      )
      .eq("id", formId)
      .eq("user_id", user.id)
      .single();

    if (formError) {
      if (formError.code === "PGRST116") {
        return NextResponse.json({ error: "Form not found" }, { status: 404 });
      }
      return NextResponse.json({ error: formError.message }, { status: 500 });
    }

    // Map form_fields to fields for frontend compatibility
    const formWithFields = {
      ...form,
      fields: form.form_fields || [],
    };

    return NextResponse.json({ form: formWithFields });
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handles the HTTP PUT request to update a form and its associated fields.
 *
 * @param request - The incoming HTTP request object.
 * @param params - The route parameters containing the `formId`.
 *
 * @returns A JSON response indicating the success or failure of the operation.
 *
 * ### Behavior:
 * - Authenticates the user using Supabase.
 * - Verifies the ownership of the form by the authenticated user.
 * - Updates the form details such as title, description, settings, and publication status.
 * - If the form is being published for the first time and no `share_url` exists, generates a unique share URL.
 * - Updates the form fields if provided, replacing the existing fields with the new ones.
 *
 * ### Possible Responses:
 * - `401 Unauthorized`: If the user is not authenticated.
 * - `404 Not Found`: If the form does not exist or the user does not own the form.
 * - `500 Internal Server Error`: If an error occurs during the update process.
 * - `200 OK`: If the form and fields are successfully updated, returns the updated form data.
 *
 * ### Example Request Body:
 * ```json
 * {
 *   "form": {
 *     "title": "New Form Title",
 *     "description": "Updated description",
 *     "settings": { "theme": "dark" },
 *     "is_published": true,
 *     "password_protected": false,
 *     "password_hash": null
 *   },
 *   "fields": [
 *     {
 *       "field_type": "text",
 *       "label": "Name",
 *       "placeholder": "Enter your name",
 *       "options": [],
 *       "required": true,
 *       "validation_rules": { "maxLength": 50 },
 *       "conditional_logic": {}
 *     }
 *   ]
 * }
 * ```
 *
 * ### Notes:
 * - The `formId` parameter is extracted from the route parameters.
 * - The `fields` array is optional but, if provided, replaces all existing fields for the form.
 * - Errors during field deletion or insertion are logged but do not interrupt the main update process.
 */
export async function PUT(
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

    const body = await request.json();
    const { form, fields } = body; // Verify form ownership and get current share_url
    const { data: existingForm, error: checkError } = await supabase
      .from("forms")
      .select("id, share_url")
      .eq("id", formId)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    } // Update form
    const updateData: any = {
      title: form.title,
      description: form.description,
      settings: form.settings,
      is_published: form.is_published,
      password_protected: form.password_protected,
      password_hash: form.password_hash,
      updated_at: new Date().toISOString(),
    };

    // If publishing for the first time and no share_url exists, generate one
    if (form.is_published && !existingForm.share_url) {
      // Generate a unique share URL
      let shareUrl: string;
      let isUnique = false;

      while (!isUnique) {
        shareUrl =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        const { data: existingUrl } = await supabase
          .from("forms")
          .select("id")
          .eq("share_url", shareUrl)
          .single();

        if (!existingUrl) {
          isUnique = true;
          updateData.share_url = shareUrl;
        }
      }
    }

    const { data: updatedForm, error: formError } = await supabase
      .from("forms")
      .update(updateData)
      .eq("id", formId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (formError) {
      return NextResponse.json({ error: formError.message }, { status: 500 });
    }

    // Update form fields if provided
    if (fields && Array.isArray(fields)) {
      // Delete existing fields
      const { error: deleteError } = await supabase
        .from("form_fields")
        .delete()
        .eq("form_id", formId);

      if (deleteError) {
        console.error("Error deleting existing fields:", deleteError);
      }

      // Insert new fields
      if (fields.length > 0) {
        const fieldsToInsert = fields.map(
          (field: FormField, index: number) => ({
            form_id: formId,
            field_type: field.field_type,
            label: field.label,
            placeholder: field.placeholder || null,
            options: field.options || [],
            required: field.required || false,
            field_order: index,
            validation_rules: field.validation_rules || {},
            conditional_logic: field.conditional_logic || {},
          })
        );

        const { error: fieldsError } = await supabase
          .from("form_fields")
          .insert(fieldsToInsert);

        if (fieldsError) {
          console.error("Error creating updated fields:", fieldsError);
        }
      }
    }

    return NextResponse.json({ form: updatedForm });
  } catch (error) {
    console.error("Error updating form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handles the HTTP DELETE request to delete a form.
 *
 * @param request - The incoming HTTP request object.
 * @param params - The route parameters containing the `formId`.
 *
 * @returns A JSON response indicating the success or failure of the operation.
 *
 * ### Behavior:
 * - Authenticates the user using Supabase.
 * - Verifies the ownership of the form by the authenticated user.
 * - Deletes the form from the database if the user owns it.
 *
 * ### Possible Responses:
 * - `401 Unauthorized`: If the user is not authenticated.
 * - `500 Internal Server Error`: If an error occurs during the deletion process.
 * - `200 OK`: If the form is successfully deleted, returns a success message.
 *
 * ### Notes:
 * - The `formId` parameter is extracted from the route parameters.
 * - Errors during the deletion process are logged and returned as a response.
 */
export async function DELETE(
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

    // Verify form ownership and delete
    const { error: deleteError } = await supabase
      .from("forms")
      .delete()
      .eq("id", formId)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Form deleted successfully" });
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
