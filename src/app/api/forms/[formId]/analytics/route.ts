import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: {
    formId: string;
  };
}

/**
 * Handles the GET request to fetch analytics data for a specific form.
 *
 * @param request - The incoming Next.js request object.
 * @param params - The route parameters containing the `formId`.
 * @returns A JSON response containing the analytics data or an error message.
 *
 * ### Workflow:
 * 1. **Authenticate User**: Verifies the current user using Supabase authentication.
 * 2. **Verify Form Ownership**: Ensures the authenticated user owns the form specified by `formId`.
 * 3. **Fetch Analytics Data**: Retrieves analytics data for the form from the `form_analytics` table.
 * 4. **Fetch Response Data**: Retrieves form response data for additional insights from the `form_responses` table.
 * 5. **Calculate Metrics**:
 *    - Recent submissions (last 7 days).
 *    - Monthly submissions (last 30 days).
 *    - Submissions grouped by date for chart data.
 *    - Completion time statistics (average, min, max).
 * 6. **Construct Analytics Response**: Combines all metrics and insights into a structured response object.
 *
 * ### Response Structure:
 * - **Basic Metrics**:
 *   - `views`: Total views of the form.
 *   - `submissions`: Total submissions of the form.
 *   - `conversion_rate`: Conversion rate of the form.
 *   - `average_completion_time`: Average time taken to complete the form.
 *   - `bounce_rate`: Bounce rate of the form.
 * - **Recent Activity**:
 *   - `recent_submissions`: Number of submissions in the last 7 days.
 *   - `monthly_submissions`: Number of submissions in the last 30 days.
 * - **Time Series Data**:
 *   - `submissions_per_day`: Submissions grouped by date.
 * - **Performance Metrics**:
 *   - `completion_time_stats`: Statistics for form completion times (average, min, max).
 * - **Last Updated**:
 *   - `last_updated`: Timestamp of the last analytics update.
 *
 * ### Error Handling:
 * - Returns a `401 Unauthorized` response if the user is not authenticated.
 * - Returns a `404 Not Found` response if the form does not exist or is not owned by the user.
 * - Returns a `500 Internal Server Error` response for any unexpected errors.
 */
export async function GET(
  request: NextRequest,
  context: { params: { formId: string } }
) {
  try {
    const supabase = await createClient();
    const { formId } = context.params;

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
      .select("id, title")
      .eq("id", formId)
      .eq("user_id", user.id)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Get analytics data
    const { data: analytics, error: analyticsError } = await supabase
      .from("form_analytics")
      .select("*")
      .eq("form_id", formId)
      .single();

    if (analyticsError && analyticsError.code !== "PGRST116") {
      // Ensure "PGRST116" is valid or replace with a known constant
      return NextResponse.json(
        { error: analyticsError.message },
        { status: 500 }
      );
    }

    // Get response data for additional insights
    const { data: responses, error: responsesError } = await supabase
      .from("form_responses")
      .select("submitted_at, metadata")
      .eq("form_id", formId);

    if (responsesError) {
      console.error("Error fetching responses for analytics:", responsesError);
    }

    // Calculate additional metrics
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentResponses =
      responses?.filter((r) => new Date(r.submitted_at) > sevenDaysAgo) || [];

    const monthlyResponses =
      responses?.filter((r) => new Date(r.submitted_at) > thirtyDaysAgo) || [];

    // Group responses by date for chart data
    const responsesPerDay: { [key: string]: number } = {};
    responses?.forEach((response) => {
      const date = new Date(response.submitted_at).toISOString().split("T")[0];
      responsesPerDay[date] = (responsesPerDay[date] || 0) + 1;
    });

    // Calculate completion time stats
    const completionTimes =
      responses?.map((r) => r.metadata?.completion_time).filter(Boolean) || [];
    const avgCompletionTime =
      completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;

    const analyticsData = {
      // Basic metrics
      views: analytics?.views || 0,
      submissions: analytics?.submissions || 0,
      conversion_rate: analytics?.conversion_rate || 0,
      average_completion_time:
        analytics?.average_completion_time || avgCompletionTime,
      bounce_rate: analytics?.bounce_rate || 0,

      // Recent activity
      recent_submissions: recentResponses.length,
      monthly_submissions: monthlyResponses.length,

      // Time series data
      submissions_per_day: responsesPerDay,

      // Performance metrics
      completion_time_stats: {
        average: avgCompletionTime,
        min: completionTimes.length > 0 ? Math.min(...completionTimes) : 0,
        max: completionTimes.length > 0 ? Math.max(...completionTimes) : 0,
      },

      // Last updated
      last_updated: analytics?.updated_at || new Date().toISOString(),
    };

    return NextResponse.json({ analytics: analyticsData });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const { event_type } = await request.json();

    // Handle different analytics events
    switch (event_type) {
      case "view":
        // Increment view count
        const { error: viewError } = await supabase.rpc(
          "increment_form_views",
          {
            form_id: formId,
          }
        );

        if (viewError) {
          console.error("Error incrementing views:", viewError);
        }
        break;

      case "start":
        // Track form start (could be used for bounce rate calculation)
        break;

      case "field_focus":
        // Track field interactions for analytics
        break;

      case "abandon":
        // Track form abandonment
        break;

      default:
        return NextResponse.json(
          { error: "Invalid event type" },
          { status: 400 }
        );
    }

    return NextResponse.json({ message: "Event tracked successfully" });
  } catch (error) {
    console.error("Error tracking analytics event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
