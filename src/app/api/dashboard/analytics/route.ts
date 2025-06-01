import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the GET request for fetching dashboard analytics.
 *
 * @param {NextRequest} request - The incoming HTTP request object.
 * @returns {Promise<NextResponse>} A JSON response containing the analytics overview
 * for the authenticated user or an error message with the appropriate status code.
 *
 * @throws {Error} If there is an issue with fetching the analytics overview or
 * if the user is not authenticated.
 *
 * - If the user is not authenticated, returns a 401 Unauthorized response.
 * - If an error occurs during processing, returns a 500 Internal Server Error response.
 */
export async function GET(request: NextRequest) {
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

    // Get user's forms directly from database (same approach as /api/forms)
    const { data: forms, error: formsError } = await supabase
      .from("forms")
      .select(
        `
        *,
        form_fields(*),
        form_analytics(*)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (formsError) {
      console.error("Dashboard analytics forms error:", formsError);
      return NextResponse.json({ error: formsError.message }, { status: 500 });
    }

    // Calculate dashboard analytics from actual submission data
    let totalForms = forms?.length || 0;
    let totalViews = 0;
    let totalSubmissions = 0;

    const popularForms = []; // Use the form_analytics data directly since it exists
    for (const form of forms || []) {
      // Get analytics data from the joined form_analytics table
      // Note: form_analytics can be either an object or array depending on the query
      const analytics = Array.isArray(form.form_analytics)
        ? form.form_analytics?.[0]
        : form.form_analytics;
      if (analytics) {
        // Use the data from form_analytics table
        const views = analytics.views || 0;
        const submissions = analytics.submissions || 0;
        const conversionRate = analytics.conversion_rate || 0;

        totalViews += views;
        totalSubmissions += submissions;

        popularForms.push({
          id: form.id,
          title: form.title,
          submissions,
          views,
          conversionRate: Number(conversionRate.toFixed(2)),
        });
      } else {
        // Fallback: if no analytics record exists, get actual counts
        const { data: submissionData } = await supabase
          .from("form_responses")
          .select("id")
          .eq("form_id", form.id);

        const submissionCount = submissionData?.length || 0;
        totalSubmissions += submissionCount;

        popularForms.push({
          id: form.id,
          title: form.title,
          submissions: submissionCount,
          views: 0,
          conversionRate: 0,
        });
      }
    } // Sort forms by submissions (most popular first) and take top 10
    popularForms.sort((a, b) => b.submissions - a.submissions);
    popularForms.splice(10); // Keep only top 10

    // Calculate average conversion rate from forms that have views
    const formsWithViews = popularForms.filter((form) => form.views > 0);
    const averageConversionRate =
      formsWithViews.length > 0
        ? formsWithViews.reduce((sum, form) => sum + form.conversionRate, 0) /
          formsWithViews.length
        : 0;

    const overview = {
      totalForms,
      totalSubmissions,
      totalViews,
      averageConversionRate: Number(averageConversionRate.toFixed(2)),
      popularForms,
    };

    return NextResponse.json({ overview });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard analytics" },
      { status: 500 }
    );
  }
}
