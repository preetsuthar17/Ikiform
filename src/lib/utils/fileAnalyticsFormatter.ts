/**
 * Utility functions for formatting file data in analytics displays
 */

export interface FileDisplayInfo {
  fileName: string;
  fileSize: string;
  fileType: string;
  downloadUrl?: string;
  isImage: boolean;
  previewUrl?: string;
}

export class FileAnalyticsFormatter {
  /**
   * Format file data for analytics display
   */
  static formatFileValue(
    value: any,
    fieldId: string,
    formId: string,
  ): FileDisplayInfo[] {
    if (!value) return [];

    // Handle different file data formats
    let files: any[] = [];

    if (Array.isArray(value)) {
      files = value;
    } else if (typeof value === "object" && value.files) {
      files = value.files;
    } else if (typeof value === "object" && value.name) {
      files = [value];
    } else if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          files = parsed;
        } else if (parsed.files) {
          files = parsed.files;
        } else {
          files = [parsed];
        }
      } catch {
        // If parsing fails, treat as single file name
        files = [{ name: value }];
      }
    }

    return files.map((file) => this.formatSingleFile(file, fieldId, formId));
  }
  /**
   * Format a single file object
   */
  private static formatSingleFile(
    file: any,
    fieldId: string,
    formId: string,
  ): FileDisplayInfo {
    const fileName = file.name || file.fileName || "Unknown file";
    const fileSize = this.formatFileSize(file.size);
    const fileType = this.getFileType(file.type || file.mimeType || fileName);
    const isImage = this.isImageFile(fileType);

    // Generate download URL using the API endpoint
    // Use the actual stored filename from the path, not the original name
    let downloadUrl: string | undefined;
    if (file.path) {
      // Extract the actual filename from the storage path
      // Path format: forms/{formId}/fields/{fieldId}/{uuid}.{extension}
      const pathParts = file.path.split("/");
      const storedFileName = pathParts[pathParts.length - 1];
      downloadUrl = this.getFileDownloadUrl(formId, fieldId, storedFileName);
    } else if (file.id && fileName) {
      // Fallback: construct filename from UUID and extension
      const extension = fileName.split(".").pop() || "";
      const storedFileName = extension ? `${file.id}.${extension}` : file.id;
      downloadUrl = this.getFileDownloadUrl(formId, fieldId, storedFileName);
    }

    const previewUrl = isImage && downloadUrl ? downloadUrl : undefined;

    return {
      fileName,
      fileSize,
      fileType,
      downloadUrl,
      isImage,
      previewUrl,
    };
  }
  /**
   * Generate secure file download URL
   * @param formId The form ID
   * @param fieldId The field ID
   * @param storedFileName The actual filename stored in Supabase (UUID with extension)
   */
  private static getFileDownloadUrl(
    formId: string,
    fieldId: string,
    storedFileName: string,
  ): string {
    return `/api/uploads/${formId}/${fieldId}/${encodeURIComponent(storedFileName)}`;
  }

  /**
   * Format file size in human readable format
   */
  private static formatFileSize(sizeInBytes?: number): string {
    if (!sizeInBytes || sizeInBytes === 0) return "Unknown size";

    const units = ["B", "KB", "MB", "GB"];
    let size = sizeInBytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Get file type from mime type or file extension
   */
  private static getFileType(typeOrName: string): string {
    if (!typeOrName) return "Unknown";

    // If it's a mime type
    if (typeOrName.includes("/")) {
      const [category, subtype] = typeOrName.split("/");
      return subtype.toUpperCase();
    }

    // If it's a file name, extract extension
    const extension = typeOrName.split(".").pop()?.toLowerCase();
    return extension ? extension.toUpperCase() : "Unknown";
  }

  /**
   * Check if file is an image
   */
  private static isImageFile(fileType: string): boolean {
    const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
    return imageTypes.includes(fileType.toLowerCase());
  }

  /**
   * Generate a summary of file submissions for analytics
   */
  static generateFileSummary(files: FileDisplayInfo[]): string {
    if (files.length === 0) return "No files";
    if (files.length === 1) return `1 file: ${files[0].fileName}`;

    const imageCount = files.filter((f) => f.isImage).length;
    const documentCount = files.length - imageCount;

    let summary = `${files.length} files`;
    if (imageCount > 0 && documentCount > 0) {
      summary += ` (${imageCount} image${imageCount > 1 ? "s" : ""}, ${documentCount} document${documentCount > 1 ? "s" : ""})`;
    } else if (imageCount > 0) {
      summary += ` (${imageCount} image${imageCount > 1 ? "s" : ""})`;
    } else {
      summary += ` (${documentCount} document${documentCount > 1 ? "s" : ""})`;
    }

    return summary;
  }
}
