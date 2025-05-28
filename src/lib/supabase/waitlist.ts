import { supabase } from "./client";
import { Database } from "./types";

export type WaitlistEntry = Database["public"]["Tables"]["waitlist"]["Row"];
export type WaitlistInsert = Database["public"]["Tables"]["waitlist"]["Insert"];

export const waitlistService = {
  async addToWaitlist(
    email: string
  ): Promise<{ success: boolean; message: string; data?: WaitlistEntry }> {
    try {
      // Check if email already exists
      const { data: existingEmail, error: checkError } = await supabase
        .from("waitlist")
        .select("email")
        .eq("email", email)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is expected when email doesn't exist
        throw checkError;
      }

      if (existingEmail) {
        return {
          success: false,
          message: "You have already joined the waitlist.",
        };
      }

      // Add email to waitlist
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
};
