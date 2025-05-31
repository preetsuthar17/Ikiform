import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsService } from "@/lib/services/analyticsService";

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
    } // Get analytics overview for the user
    const overview = await AnalyticsService.getAnalyticsOverview(
      supabase,
      user.id
    );

    return NextResponse.json({ overview });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard analytics" },
      { status: 500 }
    );
  }
}
