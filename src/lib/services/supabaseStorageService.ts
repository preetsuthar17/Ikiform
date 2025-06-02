import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  url: string;
  uploadedAt: string;
}

export class SupabaseStorageService {
  private readonly bucketName = "ikiform-uploads";

  /**
   * Uploads a file to Supabase Storage
   */
  async uploadFile(
    file: File,
    formId: string,
    fieldId: string
  ): Promise<UploadedFile> {
    const supabase = await createClient();

    // Generate unique filename
    const fileId = randomUUID();
    const fileExtension = file.name.split(".").pop() || "";
    const fileName = `${fileId}.${fileExtension}`;

    // Create the storage path: forms/{formId}/fields/{fieldId}/{fileName}
    const storagePath = `forms/${formId}/fields/${fieldId}/${fileName}`;

    // Convert File to ArrayBuffer then to Uint8Array for Supabase
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(storagePath);

    return {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      path: storagePath,
      url: urlData.publicUrl,
      uploadedAt: new Date().toISOString(),
    };
  }

  /**
   * Deletes a file from Supabase Storage
   */
  async deleteFile(storagePath: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from(this.bucketName)
      .remove([storagePath]);

    if (error) {
      console.error("Supabase storage deletion error:", error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Gets a signed URL for accessing a private file
   */
  async getSignedUrl(
    storagePath: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      console.error("Supabase storage signed URL error:", error);
      throw new Error(`Failed to get signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Downloads file data from Supabase Storage
   */
  async downloadFile(storagePath: string): Promise<Blob> {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .download(storagePath);

    if (error) {
      console.error("Supabase storage download error:", error);
      throw new Error(`Failed to download file: ${error.message}`);
    }

    return data;
  }

  /**
   * Lists files in a specific path
   */
  async listFiles(path: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .list(path);

    if (error) {
      console.error("Supabase storage list error:", error);
      throw new Error(`Failed to list files: ${error.message}`);
    }

    return data;
  }

  /**
   * Ensures the storage bucket exists (should be run during setup)
   */
  async ensureBucketExists(): Promise<void> {
    const supabase = await createClient();

    // Check if bucket exists
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const bucketExists = buckets.some(
      (bucket) => bucket.name === this.bucketName
    );

    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket(
        this.bucketName,
        {
          public: false, // Keep files private for security
          allowedMimeTypes: [
            "image/*",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain",
            "text/csv",
          ],
          fileSizeLimit: 10485760, // 10MB limit
        }
      );

      if (createError) {
        throw new Error(`Failed to create bucket: ${createError.message}`);
      }
    }
  }
}

export const supabaseStorageService = new SupabaseStorageService();
