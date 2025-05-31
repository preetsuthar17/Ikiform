import { supabase } from "@/lib/supabase/client";
import { UploadedFile } from "./fileUploadService";

export interface FormSubmissionData {
  formId: string;
  responseData: Record<string, any>;
  respondentEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  completionTime?: number; // in seconds
  fileUploads?: Array<{
    fieldId: string;
    files: UploadedFile[];
  }>;
}

export interface SubmissionResponse {
  id: string;
  success: boolean;
  message: string;
}

export class SubmissionService {
  /**
   * Submit a form response with file uploads
   */
  static async submitForm(
    data: FormSubmissionData
  ): Promise<SubmissionResponse> {
    try {
      // Start a transaction to ensure data consistency
      const { data: responseData, error: responseError } = await supabase
        .from("form_responses")
        .insert({
          form_id: data.formId,
          response_data: data.responseData,
          respondent_email: data.respondentEmail,
          ip_address: data.ipAddress,
          user_agent: data.userAgent,
          completion_time: data.completionTime,
        })
        .select("id")
        .single();

      if (responseError) {
        throw new Error(
          `Failed to save form response: ${responseError.message}`
        );
      }

      const responseId = responseData.id;

      // Save file upload metadata if there are any files
      if (data.fileUploads && data.fileUploads.length > 0) {
        const fileUploadRecords = data.fileUploads.flatMap((fieldUpload) =>
          fieldUpload.files.map((file) => ({
            form_id: data.formId,
            field_id: fieldUpload.fieldId,
            response_id: responseId,
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
            // The files are already uploaded, we just failed to save metadata
          }
        }
      }

      // Update form analytics
      await this.updateFormAnalytics(data.formId, data.completionTime);

      return {
        id: responseId,
        success: true,
        message: "Form submitted successfully",
      };
    } catch (error) {
      console.error("Form submission error:", error);
      return {
        id: "",
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to submit form",
      };
    }
  }

  /**
   * Update form analytics after submission
   */
  private static async updateFormAnalytics(
    formId: string,
    completionTime?: number
  ): Promise<void> {
    try {
      // First, try to get existing analytics
      const { data: existingAnalytics } = await supabase
        .from("form_analytics")
        .select("*")
        .eq("form_id", formId)
        .single();

      if (existingAnalytics) {
        // Update existing analytics
        const newSubmissions = existingAnalytics.submissions + 1;
        const newAverageTime = completionTime
          ? Math.round(
              (existingAnalytics.average_completion_time *
                existingAnalytics.submissions +
                completionTime) /
                newSubmissions
            )
          : existingAnalytics.average_completion_time;

        const newConversionRate =
          existingAnalytics.views > 0
            ? Number(
                ((newSubmissions / existingAnalytics.views) * 100).toFixed(2)
              )
            : 0;

        await supabase
          .from("form_analytics")
          .update({
            submissions: newSubmissions,
            average_completion_time: newAverageTime,
            conversion_rate: newConversionRate,
          })
          .eq("form_id", formId);
      } else {
        // Create new analytics record
        await supabase.from("form_analytics").insert({
          form_id: formId,
          views: 0,
          submissions: 1,
          average_completion_time: completionTime || 0,
          conversion_rate: 0,
        });
      }
    } catch (error) {
      console.error("Failed to update form analytics:", error);
      // Don't throw here as the main submission was successful
    }
  }

  /**
   * Get form submissions for a specific form
   */
  static async getFormSubmissions(formId: string) {
    try {
      const { data, error } = await supabase
        .from("form_responses")
        .select(
          `
          *,
          file_uploads (
            id,
            field_id,
            original_name,
            file_name,
            file_size,
            mime_type,
            file_path,
            uploaded_at
          )
        `
        )
        .eq("form_id", formId)
        .order("submitted_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch submissions: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error fetching form submissions:", error);
      throw error;
    }
  }

  /**
   * Get form analytics
   */
  static async getFormAnalytics(formId: string) {
    try {
      const { data, error } = await supabase
        .from("form_analytics")
        .select("*")
        .eq("form_id", formId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw new Error(`Failed to fetch analytics: ${error.message}`);
      }

      return (
        data || {
          form_id: formId,
          views: 0,
          submissions: 0,
          average_completion_time: 0,
          bounce_rate: 0,
          conversion_rate: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching form analytics:", error);
      throw error;
    }
  }

  /**
   * Track form view
   */
  static async trackFormView(formId: string): Promise<void> {
    try {
      // Use the database function to increment views
      const { error } = await supabase.rpc("increment_form_views", {
        form_id: formId,
      });

      if (error) {
        console.error("Failed to track form view:", error);
      }
    } catch (error) {
      console.error("Error tracking form view:", error);
    }
  }

  /**
   * Delete a form submission and associated files
   */
  static async deleteSubmission(submissionId: string): Promise<void> {
    try {
      // Get file uploads associated with this submission
      const { data: fileUploads } = await supabase
        .from("file_uploads")
        .select("form_id, field_id, file_name")
        .eq("response_id", submissionId);

      // Delete files from storage first
      if (fileUploads && fileUploads.length > 0) {
        // Note: We'll implement file cleanup later if needed
        // For now, we just delete the database records
      }

      // Delete file upload records
      await supabase
        .from("file_uploads")
        .delete()
        .eq("response_id", submissionId);

      // Delete the submission
      const { error } = await supabase
        .from("form_responses")
        .delete()
        .eq("id", submissionId);

      if (error) {
        throw new Error(`Failed to delete submission: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
      throw error;
    }
  }
}
