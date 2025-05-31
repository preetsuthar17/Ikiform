import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API endpoint to check and setup database tables
 * This can be used to verify if the user_profiles table exists
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user_profiles table exists by trying to query it
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id")
      .limit(1);

    if (error) {
      // If error contains "relation does not exist", the table doesn't exist
      if (
        error.message.includes("relation") &&
        error.message.includes("does not exist")
      ) {
        return NextResponse.json(
          {
            success: false,
            tableExists: false,
            error: "user_profiles table does not exist",
            message:
              "Please run the SQL setup script in your Supabase SQL editor",
            sqlScript: `
-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  provider TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  premium BOOLEAN DEFAULT FALSE,
  premium_plan TEXT DEFAULT 'free',
  premium_expires_at TIMESTAMPTZ,
  subscription_id TEXT,
  subscription_status TEXT,
  subscription_period_start TIMESTAMPTZ,
  subscription_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
          `,
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tableExists: true,
      message: "user_profiles table exists and is accessible",
      recordCount: data?.length || 0,
    });
  } catch (error) {
    console.error("Database check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check database",
        details: error,
      },
      { status: 500 }
    );
  }
}
