import { createClient } from "./client";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  provider: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Extract user data from different OAuth providers
export const extractUserData = (user: User) => {
  const metadata = user.user_metadata || {};
  const appMetadata = user.app_metadata || {};
  const provider = appMetadata.provider || "email";

  let userData: Partial<UserProfile> = {
    id: user.id,
    email: user.email!,
    provider,
    email_verified: !!user.email_confirmed_at,
  }; // For GitHub OAuth
  if (provider === "github") {
    userData = {
      ...userData,
      full_name: metadata.full_name || metadata.name || metadata.user_name,
      first_name:
        metadata.full_name?.split(" ")[0] ||
        metadata.name?.split(" ")[0] ||
        metadata.user_name,
      last_name:
        metadata.full_name?.split(" ").slice(1).join(" ") ||
        metadata.name?.split(" ").slice(1).join(" ") ||
        "",
    };
  }
  // For Google OAuth
  else if (provider === "google") {
    userData = {
      ...userData,
      full_name: metadata.full_name || metadata.name,
      first_name:
        metadata.given_name ||
        metadata.full_name?.split(" ")[0] ||
        metadata.name?.split(" ")[0],
      last_name:
        metadata.family_name ||
        metadata.full_name?.split(" ").slice(1).join(" ") ||
        metadata.name?.split(" ").slice(1).join(" ") ||
        "",
    };
  }
  // For email signup
  else {
    userData = {
      ...userData,
      full_name: metadata.full_name || metadata.name,
      first_name:
        metadata.full_name?.split(" ")[0] || metadata.name?.split(" ")[0],
      last_name:
        metadata.full_name?.split(" ").slice(1).join(" ") ||
        metadata.name?.split(" ").slice(1).join(" ") ||
        "",
    };
  }

  // Clean up undefined values and ensure we have at least a first name
  if (!userData.first_name) {
    userData.first_name = userData.email?.split("@")[0] || "User";
  }

  if (!userData.full_name) {
    userData.full_name =
      `${userData.first_name} ${userData.last_name || ""}`.trim();
  }

  return userData;
};

// Create or update user profile
export const upsertUserProfile = async (
  user: User,
): Promise<{ data: UserProfile | null; error: any }> => {
  const supabase = createClient();
  const userData = extractUserData(user);

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(userData, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error upserting user profile:", error);
    return { data: null, error };
  }
};

// Get user profile by ID
export const getUserProfile = async (
  userId: string,
): Promise<{ data: UserProfile | null; error: any }> => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { data: null, error };
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>,
): Promise<{ data: UserProfile | null; error: any }> => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { data: null, error };
  }
};

// Delete user profile
export const deleteUserProfile = async (
  userId: string,
): Promise<{ error: any }> => {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", userId);

    return { error };
  } catch (error) {
    console.error("Error deleting user profile:", error);
    return { error };
  }
};
