import { supabase } from "./client";
import { Database } from "./types";

export type WaitlistEntry = Database["public"]["Tables"]["waitlist"]["Row"];
export type WaitlistInsert = Database["public"]["Tables"]["waitlist"]["Insert"];

export const waitlistService = {
  // Add a new email to the waitlist
  async addToWaitlist(
    email: string
  ): Promise<{ success: boolean; message: string; data?: WaitlistEntry }> {
    try {
      const { data: existingEmail, error: checkError } = await supabase
        .from("waitlist")
        .select("email")
        .eq("email", email)
        .single();

      // Ignore "not found" error (PGRST116), treat others as actual errors
      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingEmail) {
        return {
          success: false,
          message: "You have already joined the waitlist.",
        };
      }

      const { data, error } = await supabase
        .from("waitlist")
        .insert([{ email }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: "Thanks for joining the waitlist! We'll keep you updated.",
        data,
      };
    } catch (error) {
      console.error("Error adding to waitlist:", error);
      return {
        success: false,
        message: "Failed to add to waitlist. Please try again.",
      };
    }
  },

  // Get the total number of waitlist entries
  async getWaitlistCount(): Promise<{ count: number; error?: string }> {
    try {
      const { count, error } = await supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true });

      if (error) {
        throw error;
      }

      return { count: count || 0 };
    } catch (error) {
      console.error("Error getting waitlist count:", error);
      return { count: 0, error: "Failed to load count" };
    }
  },
};
