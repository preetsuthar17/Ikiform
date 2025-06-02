import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FormField } from "@/lib/types/forms";
import { AnalyticsService } from "@/lib/services/analyticsService";
import { SupabaseStorageService } from "@/lib/services/supabaseStorageService";

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
  { params }: { params: Promise<{ formId: string }> },
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
      `,
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
      { status: 500 },
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
  { params }: { params: Promise<{ formId: string }> },
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
          }),
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
      { status: 500 },
    );
  }
}

/**
 * Handles the HTTP DELETE request to delete a form and all associated data.
 *
 * @param request - The incoming HTTP request object.
 * @param params - The route parameters containing the `formId`.
 *
 * @returns A JSON response indicating the success or failure of the operation.
 *
 * ### Behavior:
 * - Authenticates the user using Supabase.
 * - Verifies the ownership of the form by the authenticated user.
 * - Deletes all uploaded files from Supabase storage.
 * - Deletes all associated database records (file uploads, form responses, analytics).
 * - Finally deletes the form itself.
 *
 * ### Possible Responses:
 * - `401 Unauthorized`: If the user is not authenticated.
 * - `404 Not Found`: If the form is not found or user doesn't own it.
 * - `500 Internal Server Error`: If an error occurs during the deletion process.
 * - `200 OK`: If the form and all associated data are successfully deleted.
 *
 * ### Notes:
 * - The deletion process is comprehensive and removes all traces of the form.
 * - Files are deleted from storage before database records for data consistency.
 * - Errors during file deletion are logged but don't prevent form deletion.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> },
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

    // First, verify form ownership
    const { data: form, error: formCheckError } = await supabase
      .from("forms")
      .select("id")
      .eq("id", formId)
      .eq("user_id", user.id)
      .single();

    if (formCheckError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Get all file uploads associated with this form to delete from storage
    const { data: fileUploads, error: fileQueryError } = await supabase
      .from("file_uploads")
      .select("file_path, form_id, field_id, file_name")
      .eq("form_id", formId);

    if (fileQueryError) {
      console.error("Error querying file uploads:", fileQueryError);
      // Continue with form deletion even if file query fails
    }

    // Delete files from Supabase storage
    if (fileUploads && fileUploads.length > 0) {
      const storageService = new SupabaseStorageService();

      for (const fileUpload of fileUploads) {
        try {
          // Use the stored file_path which includes the full storage path
          if (fileUpload.file_path) {
            await storageService.deleteFile(fileUpload.file_path);
          } else {
            // Fallback to constructing path if file_path is not available
            const storagePath = `forms/${fileUpload.form_id}/fields/${fileUpload.field_id}/${fileUpload.file_name}`;
            await storageService.deleteFile(storagePath);
          }
        } catch (error) {
          console.error(
            `Failed to delete file from storage: ${fileUpload.file_name}`,
            error,
          );
          // Continue with other deletions even if one file fails
        }
      }
    }

    // Delete file upload records from database
    const { error: fileDeleteError } = await supabase
      .from("file_uploads")
      .delete()
      .eq("form_id", formId);

    if (fileDeleteError) {
      console.error("Error deleting file upload records:", fileDeleteError);
      // Continue with form deletion
    }

    // Delete form responses
    const { error: responsesDeleteError } = await supabase
      .from("form_responses")
      .delete()
      .eq("form_id", formId);

    if (responsesDeleteError) {
      console.error("Error deleting form responses:", responsesDeleteError);
      // Continue with form deletion
    }

    // Delete form analytics
    try {
      await AnalyticsService.deleteFormAnalytics(supabase, formId);
    } catch (error) {
      console.error("Error deleting form analytics:", error);
      // Continue with form deletion
    }

    // Delete form fields (cascade should handle this, but explicit deletion for safety)
    const { error: fieldsDeleteError } = await supabase
      .from("form_fields")
      .delete()
      .eq("form_id", formId);

    if (fieldsDeleteError) {
      console.error("Error deleting form fields:", fieldsDeleteError);
      // Continue with form deletion
    }

    // Finally, delete the form itself
    const { error: deleteError } = await supabase
      .from("forms")
      .delete()
      .eq("id", formId)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Form and all associated data deleted successfully",
      deletedFiles: fileUploads?.length || 0,
    });
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
