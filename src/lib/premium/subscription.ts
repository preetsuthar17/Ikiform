// Premium subscription management utilities
import { createClient } from "@/lib/supabase/client";
import { PremiumPlan } from "./index";

export interface SubscriptionData {
  userId: string;
  plan: PremiumPlan;
  subscriptionId?: string;
  trialDays?: number;
}

// Start a trial for a user
export const startTrial = async (
  userId: string,
  trialDays: number = 14
): Promise<{ success: boolean; error?: string }> => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc("start_user_trial", {
      user_id: userId,
      trial_days: trialDays,
    });

    if (error) {
      console.error("Error starting trial:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error starting trial:", error);
    return { success: false, error: "Failed to start trial" };
  }
};

// Upgrade user to premium
export const upgradeToPremium = async (
  subscriptionData: SubscriptionData
): Promise<{ success: boolean; error?: string }> => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc("upgrade_user_to_premium", {
      user_id: subscriptionData.userId,
      plan_type: subscriptionData.plan,
      subscription_id_param: subscriptionData.subscriptionId,
    });

    if (error) {
      console.error("Error upgrading to premium:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error upgrading to premium:", error);
    return { success: false, error: "Failed to upgrade to premium" };
  }
};

// Cancel premium subscription
export const cancelPremium = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc("cancel_user_premium", {
      user_id: userId,
    });

    if (error) {
      console.error("Error cancelling premium:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error cancelling premium:", error);
    return { success: false, error: "Failed to cancel premium" };
  }
};

// Check if user can access a specific feature
export const checkFeatureAccess = async (
  userId: string,
  featureName: string,
  requiredPlan: PremiumPlan = "pro"
): Promise<boolean> => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc("can_user_access_feature", {
      user_id: userId,
      feature_name: featureName,
      required_plan: requiredPlan,
    });

    if (error) {
      console.error("Error checking feature access:", error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error("Error checking feature access:", error);
    return false;
  }
};

// Get current usage counts for a user (to be implemented based on your needs)
export const getUserUsage = async (userId: string) => {
  const supabase = createClient();

  try {
    // Get form count
    const { count: formCount, error: formError } = await supabase
      .from("forms")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (formError) {
      console.error("Error getting form count:", formError);
      return null;
    }

    // Get total submission count across all forms
    const { count: submissionCount, error: submissionError } = await supabase
      .from("form_responses")
      .select("form_id", { count: "exact", head: true })
      .in(
        "form_id",
        (
          await supabase.from("forms").select("id").eq("user_id", userId)
        ).data?.map((f) => f.id) || []
      );

    if (submissionError) {
      console.error("Error getting submission count:", submissionError);
    }

    return {
      forms: formCount || 0,
      submissions: submissionCount || 0,
      // Add more usage metrics as needed
    };
  } catch (error) {
    console.error("Error getting user usage:", error);
    return null;
  }
};
