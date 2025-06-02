/**
 * Image compression utility that maintains quality while reducing file size
 * Uses canvas-based compression with optimized settings
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0, default 0.9 for high quality
  format?: "jpeg" | "png" | "webp";
  maintainAspectRatio?: boolean;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export class ImageCompression {
  /**
   * Compress an image file while maintaining high quality
   */
  static async compressImage(
    file: File,
    options: CompressionOptions = {},
  ): Promise<CompressionResult> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.9, // High quality default
      format = "jpeg",
      maintainAspectRatio = true,
    } = options;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      throw new Error("File is not an image");
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight,
            maintainAspectRatio,
          );

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Enable high-quality image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Draw the image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with specified quality
          const mimeType = this.getMimeType(format);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image"));
                return;
              }

              // Create new file
              const compressedFile = new File([blob], file.name, {
                type: mimeType,
                lastModified: Date.now(),
              });

              const compressionRatio = (1 - blob.size / file.size) * 100;

              resolve({
                file: compressedFile,
                originalSize: file.size,
                compressedSize: blob.size,
                compressionRatio,
              });
            },
            mimeType,
            quality,
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      // Load the image
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate optimal dimensions while maintaining aspect ratio
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    maintainAspectRatio: boolean,
  ): { width: number; height: number } {
    if (!maintainAspectRatio) {
      return {
        width: Math.min(originalWidth, maxWidth),
        height: Math.min(originalHeight, maxHeight),
      };
    }

    // If image is already smaller than max dimensions, keep original size
    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    // Calculate aspect ratio
    const aspectRatio = originalWidth / originalHeight;

    let width = maxWidth;
    let height = maxWidth / aspectRatio;

    // If height exceeds max, recalculate based on height
    if (height > maxHeight) {
      height = maxHeight;
      width = maxHeight * aspectRatio;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Get MIME type for specified format
   */
  private static getMimeType(format: string): string {
    switch (format) {
      case "png":
        return "image/png";
      case "webp":
        return "image/webp";
      case "jpeg":
      default:
        return "image/jpeg";
    }
  }

  /**
   * Check if a file should be compressed
   */
  static shouldCompress(
    file: File,
    minSizeThreshold: number = 100 * 1024,
  ): boolean {
    return file.type.startsWith("image/") && file.size > minSizeThreshold;
  }

  /**
   * Compress multiple images
   */
  static async compressImages(
    files: File[],
    options: CompressionOptions = {},
  ): Promise<CompressionResult[]> {
    const compressionPromises = files.map((file) => {
      if (this.shouldCompress(file)) {
        return this.compressImage(file, options);
      } else {
        // Return original file if compression not needed
        return Promise.resolve({
          file,
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatio: 0,
        });
      }
    });

    return Promise.all(compressionPromises);
  }
}
