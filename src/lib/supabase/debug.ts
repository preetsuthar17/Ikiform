// Debug helper functions for troubleshooting authentication issues
// Temporary file - remove after debugging

import { createClient } from "./client";
import { User } from "@supabase/supabase-js";

export const debugAuth = async (user: User | null) => {
  const supabase = createClient();

  console.log("=== DEBUG AUTH INFO ===");
  console.log("User object:", user);

  try {
    // Check current session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    console.log("Session data:", sessionData);
    console.log("Session error:", sessionError);

    // Check current user from auth
    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log("Auth user data:", userData);
    console.log("Auth user error:", userError);

    // Check if we can access the user_profiles table at all
    const { data: profileTest, error: profileTestError } = await supabase
      .from("user_profiles")
      .select("count")
      .limit(1);

    console.log("Profile table access test:", profileTest);
    console.log("Profile table access error:", profileTestError);

    if (user) {
      // Try to fetch the specific user profile
      const { data: userProfile, error: userProfileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log("User profile data:", userProfile);
      console.log("User profile error:", userProfileError);
    }
  } catch (error) {
    console.error("Debug error:", error);
  }

  console.log("=== END DEBUG ===");
};

export const testUpsert = async (user: User) => {
  const supabase = createClient();

  const testData = {
    id: user.id,
    email: user.email!,
    provider: user.app_metadata?.provider || "email",
    email_verified: !!user.email_confirmed_at,
    first_name: "Test",
    full_name: "Test User",
  };

  console.log("Testing upsert with data:", testData);

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(testData, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    console.log("Upsert result:", { data, error });
    return { data, error };
  } catch (error) {
    console.error("Upsert caught error:", error);
    return { data: null, error };
  }
};
