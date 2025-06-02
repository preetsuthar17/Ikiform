import {
  ImageCompression,
  CompressionOptions,
} from "@/lib/utils/imageCompression";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
}

export interface FileUploadOptions {
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  maxFiles?: number;
  compressImages?: boolean; // Enable image compression
  compressionOptions?: CompressionOptions; // Image compression settings
}

export class FileUploadService {
  /**
   * Upload a single file using local API
   */
  static async uploadFile(
    file: File,
    formId: string,
    fieldId: string,
    options?: FileUploadOptions
  ): Promise<UploadedFile> {
    let fileToUpload = file;

    // Apply image compression if enabled and file is an image
    if (options?.compressImages && ImageCompression.shouldCompress(file)) {
      try {
        const compressionResult = await ImageCompression.compressImage(
          file,
          options.compressionOptions || {
            quality: 0.9,
            maxWidth: 1920,
            maxHeight: 1080,
          }
        );
        fileToUpload = compressionResult.file;
        console.log(
          `Image compressed: ${file.name}, Original: ${(file.size / 1024).toFixed(1)}KB, Compressed: ${(compressionResult.compressedSize / 1024).toFixed(1)}KB (${compressionResult.compressionRatio.toFixed(1)}% reduction)`
        );
      } catch (error) {
        console.warn(
          "Image compression failed, uploading original file:",
          error
        );
        // Continue with original file if compression fails
      }
    }

    // Validate file size (using the potentially compressed file)
    if (options?.maxFileSize) {
      const maxSizeBytes = options.maxFileSize * 1024 * 1024;
      if (fileToUpload.size > maxSizeBytes) {
        throw new Error(
          `File size exceeds maximum allowed size of ${options.maxFileSize}MB`
        );
      }
    }

    // Validate file type
    if (options?.allowedTypes && options.allowedTypes.length > 0) {
      const fileExtension = fileToUpload.name.split(".").pop()?.toLowerCase();
      const mimeType = fileToUpload.type.toLowerCase();

      const isAllowed = options.allowedTypes.some(
        (type) =>
          type.toLowerCase() === `.${fileExtension}` ||
          type.toLowerCase() === fileExtension ||
          mimeType.startsWith(type.toLowerCase().replace("*", ""))
      );

      if (!isAllowed) {
        throw new Error(
          `File type not allowed. Supported types: ${options.allowedTypes.join(", ")}`
        );
      }
    }

    // Create form data for API upload
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("formId", formId);
    formData.append("fieldId", fieldId);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      return await response.json();
    } catch (error) {
      console.error("File upload error:", error);
      throw new Error("Failed to upload file. Please try again.");
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadFiles(
    files: File[],
    formId: string,
    fieldId: string,
    options?: FileUploadOptions
  ): Promise<UploadedFile[]> {
    // Validate number of files
    if (options?.maxFiles && files.length > options.maxFiles) {
      throw new Error(`Too many files. Maximum allowed: ${options.maxFiles}`);
    }

    const uploadPromises = files.map((file) =>
      this.uploadFile(file, formId, fieldId, options)
    );

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      // If any upload fails, we might want to clean up successful uploads
      // For now, we'll just throw the error
      throw error;
    }
  }
  /**
   * Delete a file from Supabase Storage via API
   */
  static async deleteFile(storagePath: string): Promise<void> {
    try {
      const response = await fetch(
        `/api/uploads?path=${encodeURIComponent(storagePath)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete file");
      }
    } catch (error) {
      console.error("File deletion error:", error);
      throw new Error("Failed to delete file");
    }
  }

  /**
   * Delete multiple files
   */
  static async deleteFiles(storagePaths: string[]): Promise<void> {
    try {
      const deletePromises = storagePaths.map((path) => this.deleteFile(path));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Files deletion error:", error);
      throw new Error("Failed to delete files");
    }
  }

  /**
   * Get file info from URL
   */
  static getFileInfoFromUrl(
    url: string
  ): { name: string; path: string } | null {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.split("/").slice(-4).join("/"); // Extract relative path
      const name = urlObj.pathname.split("/").pop() || "";
      return { name, path };
    } catch {
      return null;
    }
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Get file icon based on file type
   */
  static getFileIcon(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "ppt":
      case "pptx":
        return "📈";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return "🖼️";
      case "mp4":
      case "avi":
      case "mov":
        return "🎥";
      case "mp3":
      case "wav":
      case "aac":
        return "🎵";
      case "zip":
      case "rar":
      case "7z":
        return "🗜️";
      case "txt":
        return "📄";
      default:
        return "📎";
    }
  }
}
