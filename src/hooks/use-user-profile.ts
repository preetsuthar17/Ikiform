"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  upsertUserProfile,
  getUserProfile,
  UserProfile,
} from "@/lib/supabase/profiles";
import { debugAuth, testUpsert } from "@/lib/supabase/debug";

export const useUserProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const initializeProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Debug authentication state
        await debugAuth(user);

        // Test if we can do a simple upsert
        if (user) {
          console.log("Testing upsert operation...");
          const testResult = await testUpsert(user);
          console.log("Test upsert result:", testResult);
        }

        // First, try to upsert the user profile (create or update)
        const { data: upsertData, error: upsertError } =
          await upsertUserProfile(user);

        if (upsertError) {
          console.error("Error upserting profile:", upsertError);

          // If upsert fails, try to fetch existing profile
          const { data: fetchData, error: fetchError } = await getUserProfile(
            user.id,
          );

          if (fetchError) {
            setError("Failed to load user profile");
            console.error("Error fetching profile:", fetchError);
          } else {
            setProfile(fetchData);
          }
        } else {
          setProfile(upsertData);
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Profile initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeProfile();
  }, [user]);

  const refreshProfile = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getUserProfile(user.id);

      if (fetchError) {
        setError("Failed to refresh profile");
        console.error("Error refreshing profile:", fetchError);
      } else {
        setProfile(data);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Profile refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    refreshProfile,
  };
};
