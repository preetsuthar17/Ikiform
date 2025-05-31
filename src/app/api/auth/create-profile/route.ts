import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { upsertUserProfile } from "@/lib/supabase/profiles";

/**
 * API endpoint to create/update user profile after OAuth login
 * This handles the case where the user profile doesn't exist yet
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Create/update the user profile
    const { data: profile, error: profileError } =
      await upsertUserProfile(user);

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      return NextResponse.json(
        { error: "Failed to create user profile", details: profileError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
      message: "User profile created successfully",
    });
  } catch (error) {
    console.error("Create profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
