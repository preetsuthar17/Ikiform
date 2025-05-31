import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FormField } from "@/lib/types/forms";

interface RouteParams {
  formId: string;
}

/**
 * Handles GET requests to fetch form fields for a specific form.
 *
 * @param request - The incoming Next.js request object.
 * @param params - The route parameters containing the `formId`.
 * @returns A JSON response containing the form fields or an error message.
 *
 * - Returns `401 Unauthorized` if the user is not authenticated.
 * - Returns `404 Not Found` if the form does not exist or the user does not own the form.
 * - Returns `500 Internal Server Error` if there is an issue fetching the form fields.
 */

/**
 * Handles POST requests to create a new form field for a specific form.
 *
 * @param request - The incoming Next.js request object containing the field data in the body.
 * @param params - The route parameters containing the `formId`.
 * @returns A JSON response containing the newly created form field or an error message.
 *
 * - Returns `401 Unauthorized` if the user is not authenticated.
 * - Returns `404 Not Found` if the form does not exist or the user does not own the form.
 * - Returns `500 Internal Server Error` if there is an issue creating the form field.
 */

/**
 * Handles PUT requests to update all form fields for a specific form.
 *
 * @param request - The incoming Next.js request object containing the updated fields in the body.
 * @param params - The route parameters containing the `formId`.
 * @returns A JSON response containing the updated form fields or an error message.
 *
 * - Returns `401 Unauthorized` if the user is not authenticated.
 * - Returns `404 Not Found` if the form does not exist or the user does not own the form.
 * - Returns `500 Internal Server Error` if there is an issue updating the form fields.
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;

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

    // Get form fields
    const { data: fields, error: fieldsError } = await supabase
      .from("form_fields")
      .select("*")
      .eq("form_id", formId)
      .order("field_order", { ascending: true });

    if (fieldsError) {
      return NextResponse.json({ error: fieldsError.message }, { status: 500 });
    }

    return NextResponse.json({ fields });
  } catch (error) {
    console.error("Error fetching form fields:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;

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

    const field: FormField = await request.json();

    // Get current max field_order
    const { data: maxOrderField } = await supabase
      .from("form_fields")
      .select("field_order")
      .eq("form_id", formId)
      .order("field_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderField?.field_order || -1) + 1;

    // Create new field
    const { data: newField, error: createError } = await supabase
      .from("form_fields")
      .insert({
        form_id: formId,
        field_type: field.field_type,
        label: field.label,
        placeholder: field.placeholder || null,
        options: field.options || [],
        required: field.required || false,
        field_order: nextOrder,
        validation_rules: field.validation_rules || {},
        conditional_logic: field.conditional_logic || {},
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({ field: newField });
  } catch (error) {
    console.error("Error creating form field:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;

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

    const fields: FormField[] = await request.json();

    // Delete existing fields
    const { error: deleteError } = await supabase
      .from("form_fields")
      .delete()
      .eq("form_id", formId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Insert updated fields
    if (fields.length > 0) {
      const fieldsToInsert = fields.map((field: FormField, index: number) => ({
        form_id: formId,
        field_type: field.field_type,
        label: field.label,
        placeholder: field.placeholder || null,
        options: field.options || [],
        required: field.required || false,
        field_order: index,
        validation_rules: field.validation_rules || {},
        conditional_logic: field.conditional_logic || {},
      }));

      const { data: newFields, error: createError } = await supabase
        .from("form_fields")
        .insert(fieldsToInsert)
        .select();

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ fields: newFields });
    }

    return NextResponse.json({ fields: [] });
  } catch (error) {
    console.error("Error updating form fields:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
