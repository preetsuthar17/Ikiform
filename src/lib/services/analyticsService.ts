import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/types";

export interface FormAnalytics {
  formId: string;
  views: number;
  submissions: number;
  averageCompletionTime: number;
  bounceRate: number;
  conversionRate: number;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  respondentEmail?: string;
  responseData: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  completionTime?: number;
  submittedAt: string;
  fileUploads?: Array<{
    id: string;
    fieldId: string;
    originalName: string;
    fileName: string;
    fileSize: number;
    mimeType?: string;
    filePath: string;
    uploadedAt: string;
  }>;
}

export interface AnalyticsOverview {
  totalForms: number;
  totalSubmissions: number;
  totalViews: number;
  averageConversionRate: number;
  popularForms: Array<{
    id: string;
    title: string;
    submissions: number;
    views: number;
    conversionRate: number;
  }>;
}

export class AnalyticsService {
  /**
   * Get analytics for a specific form
   */
  static async getFormAnalytics(
    supabase: SupabaseClient<Database>,
    formId: string
  ): Promise<FormAnalytics | null> {
    try {
      const { data, error } = await supabase
        .from("form_analytics")
        .select("*")
        .eq("form_id", formId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw new Error(`Failed to fetch analytics: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      return {
        formId: data.form_id,
        views: data.views,
        submissions: data.submissions,
        averageCompletionTime: data.average_completion_time,
        bounceRate: data.bounce_rate,
        conversionRate: data.conversion_rate,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error("Error fetching form analytics:", error);
      throw error;
    }
  }
  /**
   * Get all submissions for a form
   */
  static async getFormSubmissions(
    supabase: SupabaseClient<Database>,
    formId: string,
    limit?: number,
    offset?: number
  ): Promise<FormSubmission[]> {
    try {
      let query = supabase
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

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch submissions: ${error.message}`);
      }

      return (data || []).map((submission: any) => ({
        id: submission.id,
        formId: submission.form_id,
        respondentEmail: submission.respondent_email,
        responseData: submission.response_data,
        ipAddress: submission.ip_address,
        userAgent: submission.user_agent,
        completionTime: submission.completion_time,
        submittedAt: submission.submitted_at,
        fileUploads: submission.file_uploads || [],
      }));
    } catch (error) {
      console.error("Error fetching form submissions:", error);
      throw error;
    }
  }
  /**
   * Get analytics overview for all user's forms
   */
  static async getAnalyticsOverview(
    supabase: SupabaseClient<Database>,
    userId: string
  ): Promise<AnalyticsOverview> {
    try {
      // Get user's forms with analytics
      const { data: formsData, error: formsError } = await supabase
        .from("forms")
        .select(
          `
          id,
          title,
          form_analytics (
            views,
            submissions,
            conversion_rate
          )
        `
        )
        .eq("user_id", userId);

      if (formsError) {
        throw new Error(`Failed to fetch forms: ${formsError.message}`);
      }

      const forms = formsData || [];

      // Calculate totals
      const totalForms = forms.length;
      let totalSubmissions = 0;
      let totalViews = 0;
      let totalConversionRate = 0;
      let formsWithAnalytics = 0;      const popularForms = forms
        .map((form: any) => {
          const analytics = form.form_analytics?.[0];
          const views = analytics?.views || 0;
          const submissions = analytics?.submissions || 0;
          const conversionRate = analytics?.conversion_rate || 0;

          totalViews += views;
          totalSubmissions += submissions;

          if (analytics) {
            totalConversionRate += conversionRate;
            formsWithAnalytics++;
          }

          return {
            id: form.id,
            title: form.title,
            submissions,
            views,
            conversionRate,
          };
        })
        .sort((a: any, b: any) => b.submissions - a.submissions)
        .slice(0, 10); // Top 10 forms

      const averageConversionRate =
        formsWithAnalytics > 0 ? totalConversionRate / formsWithAnalytics : 0;

      return {
        totalForms,
        totalSubmissions,
        totalViews,
        averageConversionRate: Number(averageConversionRate.toFixed(2)),
        popularForms,
      };
    } catch (error) {
      console.error("Error fetching analytics overview:", error);
      throw error;
    }
  }
  /**
   * Export form submissions as CSV
   */
  static async exportSubmissionsAsCSV(
    supabase: SupabaseClient<Database>,
    formId: string
  ): Promise<string> {
    try {
      const submissions = await this.getFormSubmissions(supabase, formId);

      if (submissions.length === 0) {
        return "No submissions to export";
      }

      // Get all unique field keys from all submissions
      const allFields = new Set<string>();
      submissions.forEach((submission: any) => {
        Object.keys(submission.responseData).forEach((field) => {
          allFields.add(field);
        });
      });

      const fieldNames = Array.from(allFields);

      // Create CSV header
      const headers = [
        "Submission ID",
        "Submitted At",
        "Respondent Email",
        "Completion Time (seconds)",
        "IP Address",
        ...fieldNames,
        "File Uploads",
      ];

      // Create CSV rows
      const rows = submissions.map((submission) => {
        const fileUploadsText =
          submission.fileUploads
            ?.map((file) => `${file.originalName} (${file.fileSize} bytes)`)
            .join("; ") || "";

        return [
          submission.id,
          submission.submittedAt,
          submission.respondentEmail || "",
          submission.completionTime || "",
          submission.ipAddress || "",
          ...fieldNames.map((field) => {
            const value = submission.responseData[field];
            if (Array.isArray(value)) {
              return value
                .map((v) => (typeof v === "object" ? JSON.stringify(v) : v))
                .join("; ");
            }
            return typeof value === "object"
              ? JSON.stringify(value)
              : value || "";
          }),
          fileUploadsText,
        ];
      });

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

      return csvContent;
    } catch (error) {
      console.error("Error exporting submissions:", error);
      throw error;
    }
  }
  /**
   * Get form submission statistics by date range
   */
  static async getSubmissionStats(
    supabase: SupabaseClient<Database>,
    formId: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{ date: string; count: number }>> {
    try {
      const { data, error } = await supabase
        .from("form_responses")
        .select("submitted_at")
        .eq("form_id", formId)
        .gte("submitted_at", startDate)
        .lte("submitted_at", endDate)
        .order("submitted_at", { ascending: true });      if (error) {
        throw new Error(`Failed to fetch submission stats: ${error.message}`);
      }

      // Group submissions by date
      const statsByDate: { [date: string]: number } = {};
      (data || []).forEach((submission: any) => {
        const date = submission.submitted_at.split("T")[0]; // Get date part only
        statsByDate[date] = (statsByDate[date] || 0) + 1;
      });

      // Convert to array format
      return Object.entries(statsByDate).map(([date, count]) => ({
        date,
        count: count as number,
      }));
    } catch (error) {
      console.error("Error fetching submission stats:", error);
      throw error;
    }
  }
  /**
   * Delete form analytics and related data
   */
  static async deleteFormAnalytics(
    supabase: SupabaseClient<Database>,
    formId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("form_analytics")
        .delete()
        .eq("form_id", formId);

      if (error) {
        throw new Error(`Failed to delete analytics: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting form analytics:", error);
      throw error;
    }
  }
}
