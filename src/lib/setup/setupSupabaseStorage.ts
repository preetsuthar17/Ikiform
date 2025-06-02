import { supabaseStorageService } from "@/lib/services/supabaseStorageService";

/**
 * Setup script to initialize Supabase Storage for file uploads
 * This should be run during deployment or application startup
 */
export async function setupSupabaseStorage() {
  try {
    console.log("Setting up Supabase Storage...");

    // Ensure the storage bucket exists
    await supabaseStorageService.ensureBucketExists();

    console.log("✅ Supabase Storage setup completed successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to setup Supabase Storage:", error);
    return { success: false, error };
  }
}

// If this file is run directly (for manual setup)
if (require.main === module) {
  setupSupabaseStorage()
    .then((result) => {
      if (result.success) {
        console.log("Setup completed successfully");
        process.exit(0);
      } else {
        console.error("Setup failed:", result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("Setup failed:", error);
      process.exit(1);
    });
}
