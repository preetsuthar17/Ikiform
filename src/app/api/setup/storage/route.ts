import { NextRequest, NextResponse } from "next/server";
import { setupSupabaseStorage } from "@/lib/setup/setupSupabaseStorage";

/**
 * Setup endpoint to initialize Supabase Storage
 * This can be called during deployment or manually to ensure storage is properly configured
 */
export async function POST(request: NextRequest) {
  try {
    const result = await setupSupabaseStorage();

    if (result.success) {
      return NextResponse.json({
        message: "Supabase Storage setup completed successfully",
        success: true,
      });
    } else {
      return NextResponse.json(
        {
          error: "Failed to setup Supabase Storage",
          details: result.error,
          success: false,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Setup endpoint error:", error);
    return NextResponse.json(
      { error: "Setup failed", success: false },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Supabase Storage Setup Endpoint",
    usage: "Send a POST request to this endpoint to initialize storage bucket",
  });
}
