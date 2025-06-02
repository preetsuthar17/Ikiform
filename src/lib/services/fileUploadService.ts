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
    options?: FileUploadOptions,
  ): Promise<UploadedFile> {
    // Pre-validation before any processing
    this.validateFileBeforeProcessing(file, options);

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
          },
        );
        fileToUpload = compressionResult.file;
        console.log(
          `Image compressed: ${file.name}, Original: ${(file.size / 1024).toFixed(1)}KB, Compressed: ${(compressionResult.compressedSize / 1024).toFixed(1)}KB (${compressionResult.compressionRatio.toFixed(1)}% reduction)`,
        );
      } catch (error) {
        console.warn(
          "Image compression failed, uploading original file:",
          error,
        );
        // Continue with original file if compression fails
      }
    }

    // Final validation after compression
    this.validateFileAfterProcessing(fileToUpload, options);

    // Create form data for API upload
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("formId", formId);
    formData.append("fieldId", fieldId);

    // Add max file size to form data for server-side validation
    if (options?.maxFileSize) {
      formData.append("maxFileSize", options.maxFileSize.toString());
    }

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
        // Add timeout for large files
        signal: AbortSignal.timeout(60000), // 60 second timeout
      });

      if (!response.ok) {
        let errorMessage = "Upload failed";

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || "Upload failed";
        } catch (parseError) {
          // If we can't parse the error response, use the status to determine the message
          switch (response.status) {
            case 400:
              errorMessage = "Invalid file or request";
              break;
            case 413:
              errorMessage = "File too large for server";
              break;
            case 429:
              errorMessage = "Too many requests. Please try again later";
              break;
            case 500:
              errorMessage = "Server error. Please try again";
              break;
            case 502:
            case 503:
            case 504:
              errorMessage = "Server temporarily unavailable";
              break;
            default:
              errorMessage = `Upload failed with status ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error("File upload error:", error);

      // Handle specific error types with user-friendly messages
      if (error instanceof Error) {
        if (error.name === "AbortError" || error.message.includes("timeout")) {
          throw new Error(
            "Upload timed out. The file might be too large or your connection is slow. Please try again.",
          );
        }
        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          throw new Error(
            "Network error. Please check your internet connection and try again.",
          );
        }
        if (error.message.includes("File too large")) {
          throw new Error(
            `File "${file.name}" is too large. Maximum size allowed is ${options?.maxFileSize || 10}MB.`,
          );
        }
        // Re-throw the error with the existing message if it's already user-friendly
        throw error;
      }

      throw new Error(
        "Upload failed due to an unexpected error. Please try again.",
      );
    }
  }

  /**
   * Validate file before any processing (compression, etc.)
   */
  private static validateFileBeforeProcessing(
    file: File,
    options?: FileUploadOptions,
  ): void {
    // Check if file exists and has content
    if (!file || file.size === 0) {
      throw new Error("Selected file is empty or invalid.");
    }

    // Validate file extension matches MIME type
    if (!this.validateFileExtension(file)) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "unknown";
      throw new Error(
        `File "${file.name}" appears to be corrupted or has an incorrect extension. The file content doesn't match the .${extension} extension.`,
      );
    }

    // Validate file type first (before compression)
    if (options?.allowedTypes && options.allowedTypes.length > 0) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const mimeType = file.type.toLowerCase();

      const isAllowed = options.allowedTypes.some(
        (type) =>
          type.toLowerCase() === `.${fileExtension}` ||
          type.toLowerCase() === fileExtension ||
          mimeType.startsWith(type.toLowerCase().replace("*", "")),
      );

      if (!isAllowed) {
        throw new Error(
          `File type "${fileExtension || "unknown"}" is not allowed. Supported types: ${options.allowedTypes.join(", ")}`,
        );
      }
    }

    // Check original file size (before compression)
    // Don't reject large images that might be compressible
    if (options?.maxFileSize) {
      const maxSizeBytes = options.maxFileSize * 1024 * 1024;
      const isCompressibleImage = this.isCompressibleImage(file);
      const compressionEnabled = options.compressImages;

      if (isCompressibleImage && compressionEnabled) {
        // For compressible images, check estimated compressed size
        const estimatedCompressedSize = this.getEstimatedCompressedSize(file);
        if (
          estimatedCompressedSize > maxSizeBytes &&
          file.size > maxSizeBytes * 3
        ) {
          throw new Error(
            `Image "${file.name}" is too large (${this.formatFileSize(file.size)}). Even with compression, it likely exceeds the maximum size of ${options.maxFileSize}MB. Please use a smaller image.`,
          );
        }
      } else {
        // For non-compressible files, enforce strict size limit
        if (file.size > maxSizeBytes) {
          throw new Error(
            `File "${file.name}" is too large (${this.formatFileSize(file.size)}). Maximum size allowed is ${options.maxFileSize}MB.`,
          );
        }
      }
    }
  }

  /**
   * Validate file after processing (compression)
   */
  private static validateFileAfterProcessing(
    file: File,
    options?: FileUploadOptions,
  ): void {
    // Final size check after compression
    if (options?.maxFileSize) {
      const maxSizeBytes = options.maxFileSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        throw new Error(
          `File "${file.name}" is still too large after compression (${this.formatFileSize(file.size)}). Maximum size allowed is ${options.maxFileSize}MB.`,
        );
      }
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadFiles(
    files: File[],
    formId: string,
    fieldId: string,
    options?: FileUploadOptions,
  ): Promise<UploadedFile[]> {
    // Validate number of files
    if (options?.maxFiles && files.length > options.maxFiles) {
      throw new Error(
        `Too many files selected. Maximum allowed: ${options.maxFiles}`,
      );
    }

    // Validate all files before starting any uploads
    for (const file of files) {
      this.validateFileBeforeProcessing(file, options);
    }

    const uploadPromises = files.map(async (file, index) => {
      try {
        return await this.uploadFile(file, formId, fieldId, options);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        throw new Error(`File "${file.name}": ${errorMessage}`);
      }
    });

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      // If any upload fails, provide detailed information
      const errorMessage =
        error instanceof Error
          ? error.message
          : "One or more files failed to upload";
      throw new Error(errorMessage);
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
        },
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
    url: string,
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

  /**
   * Check if a file type is compressible (image)
   */
  static isCompressibleImage(file: File): boolean {
    return file.type.startsWith("image/") && !file.type.includes("svg");
  }

  /**
   * Get estimated compressed size for an image
   */
  static getEstimatedCompressedSize(file: File): number {
    if (!this.isCompressibleImage(file)) {
      return file.size;
    }

    // Rough estimation: JPEG compression typically reduces size by 60-80%
    // PNG compression varies more widely
    if (file.type.includes("jpeg") || file.type.includes("jpg")) {
      return Math.round(file.size * 0.3); // Assume 70% reduction
    } else if (file.type.includes("png")) {
      return Math.round(file.size * 0.5); // Assume 50% reduction
    } else {
      return Math.round(file.size * 0.4); // General estimate
    }
  }

  /**
   * Validate file extension against filename
   */
  static validateFileExtension(file: File): boolean {
    const fileName = file.name.toLowerCase();
    const mimeType = file.type.toLowerCase();

    // Common extension to MIME type mappings
    const extensionMimeMap: Record<string, string[]> = {
      jpg: ["image/jpeg"],
      jpeg: ["image/jpeg"],
      png: ["image/png"],
      gif: ["image/gif"],
      pdf: ["application/pdf"],
      doc: ["application/msword"],
      docx: [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      txt: ["text/plain"],
      csv: ["text/csv"],
      zip: ["application/zip"],
    };

    const extension = fileName.split(".").pop();
    if (!extension) return false;

    const expectedMimes = extensionMimeMap[extension];
    if (!expectedMimes) return true; // Unknown extension, allow it

    return expectedMimes.some((mime) => mimeType.startsWith(mime));
  }
}
