import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FormField } from "@/lib/types/forms";

/**
 * Handles the GET request for retrieving a specific form field.
 *
 * @param request - The incoming Next.js request object.
 * @param params - The route parameters containing `formId` and `fieldId`.
 *
 * @returns A JSON response containing the requested form field data if the user is authorized
 *          and the field exists, or an error response with the appropriate status code.
 *
 * @throws Returns a 401 status if the user is unauthorized.
 * @throws Returns a 404 status if the field is not found or the user does not own the form.
 * @throws Returns a 500 status if an internal server error occurs.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string; fieldId: string }> }
) {
  try {
    const supabase = await createClient();
    const { formId, fieldId } = await params;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify form ownership and get field
    const { data: field, error: fieldError } = await supabase
      .from("form_fields")
      .select(
        `
        *,
        forms!inner(user_id)
      `
      )
      .eq("id", fieldId)
      .eq("form_id", formId)
      .eq("forms.user_id", user.id)
      .single();

    if (fieldError || !field) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    return NextResponse.json({ field });
  } catch (error) {
    console.error("Error fetching form field:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handles the HTTP PUT request to update a specific form field.
 *
 * @param request - The incoming HTTP request object.
 * @param params - The route parameters containing `formId` and `fieldId`.
 * @returns A JSON response indicating the success or failure of the operation.
 *
 * @throws Returns a 401 response if the user is unauthorized.
 * @throws Returns a 500 response if there is an error updating the field or an internal server error occurs.
 *
 * The function performs the following steps:
 * 1. Creates a Supabase client instance.
 * 2. Retrieves the current authenticated user.
 * 3. Parses the request body to extract the field data.
 * 4. Verifies the ownership of the form and updates the field in the database.
 * 5. Returns the updated field data in the response if successful.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string; fieldId: string }> }
) {
  try {
    const supabase = await createClient();
    const { formId, fieldId } = await params;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fieldData: Partial<FormField> = await request.json();

    // Verify form ownership and update field
    const { data: updatedField, error: updateError } = await supabase
      .from("form_fields")
      .update({
        field_type: fieldData.field_type,
        label: fieldData.label,
        placeholder: fieldData.placeholder,
        options: fieldData.options,
        required: fieldData.required,
        field_order: fieldData.field_order,
        validation_rules: fieldData.validation_rules,
        conditional_logic: fieldData.conditional_logic,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fieldId)
      .eq("form_id", formId)
      .eq("forms.user_id", user.id)
      .select(
        `
        *,
        forms!inner(user_id)
      `
      )
      .single();

    if (updateError || !updatedField) {
      return NextResponse.json(
        { error: "Failed to update field" },
        { status: 500 }
      );
    }

    return NextResponse.json({ field: updatedField });
  } catch (error) {
    console.error("Error updating form field:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handles the DELETE request to remove a specific field from a form.
 *
 * @param request - The incoming Next.js request object.
 * @param params - An object containing route parameters, including:
 *   - `formId`: The ID of the form to which the field belongs.
 *   - `fieldId`: The ID of the field to be deleted.
 *
 * @returns A `NextResponse` object with the result of the operation:
 *   - 401 Unauthorized if the user is not authenticated.
 *   - 500 Internal Server Error if an error occurs during deletion or reordering.
 *   - 200 OK with a success message if the field is deleted successfully.
 *
 * @throws Will log an error to the console if an unexpected error occurs.
 *
 * @remarks
 * This function performs the following steps:
 * 1. Authenticates the user using Supabase.
 * 2. Deletes the specified field from the `form_fields` table.
 * 3. Reorders the remaining fields in the form to maintain sequential order.
 * 4. Returns an appropriate response based on the outcome of the operation.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string; fieldId: string }> }
) {
  try {
    const supabase = await createClient();
    const { formId, fieldId } = await params;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify form ownership and delete field
    const { error: deleteError } = await supabase
      .from("form_fields")
      .delete()
      .eq("id", fieldId)
      .eq("form_id", formId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Re-order remaining fields
    const { data: remainingFields } = await supabase
      .from("form_fields")
      .select("id, field_order")
      .eq("form_id", formId)
      .order("field_order", { ascending: true });

    if (remainingFields && remainingFields.length > 0) {
      const updates = remainingFields.map((field, index) =>
        supabase
          .from("form_fields")
          .update({ field_order: index })
          .eq("id", field.id)
      );

      await Promise.all(updates);
    }

    return NextResponse.json({ message: "Field deleted successfully" });
  } catch (error) {
    console.error("Error deleting form field:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
