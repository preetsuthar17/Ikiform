import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";

/**
 * Handles the POST request for uploading a file.
 *
 * This function processes a multipart form-data request to upload a file
 * associated with a specific form and field. It validates the input, ensures
 * the file size is within the allowed limit, and saves the file to a designated
 * directory. The response includes metadata about the uploaded file.
 *
 * @param {NextRequest} request - The incoming HTTP request object.
 * @returns {Promise<NextResponse>} A JSON response containing the uploaded file's
 * metadata or an error message with the appropriate HTTP status code.
 *
 * @throws {Error} If an unexpected error occurs during file upload.
 *
 * ### Request Body
 * - `file` (File): The file to be uploaded.
 * - `formId` (string): The ID of the form associated with the file.
 * - `fieldId` (string): The ID of the field associated with the file.
 *
 * ### Response
 * - On success (200):
 *   ```json
 *   {
 *     "id": "string",
 *     "name": "string",
 *     "size": number,
 *     "type": "string",
 *     "path": "string",
 *     "url": "string",
 *     "uploadedAt": "string"
 *   }
 *   ```
 * - On error (400 or 500):
 *   ```json
 *   {
 *     "error": "string"
 *   }
 *   ```
 *
 * ### Validation
 * - Ensures `file`, `formId`, and `fieldId` are provided.
 * - Validates that the file size does not exceed 10MB.
 *
 * ### File Storage
 * - Files are stored in the `uploads/{formId}/{fieldId}` directory.
 * - A unique filename is generated using a UUID and the original file extension.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const formId = formData.get("formId") as string;
    const fieldId = formData.get("fieldId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!formId || !fieldId) {
      return NextResponse.json(
        { error: "Form ID and Field ID are required" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB by default)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds limit" },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "uploads", formId, fieldId);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileId = randomUUID();
    const fileExtension = file.name.split(".").pop() || "";
    const fileName = `${fileId}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return file info
    const uploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      path: filePath,
      url: `/api/uploads/${formId}/${fieldId}/${fileName}`,
      uploadedAt: new Date().toISOString(),
    };

    return NextResponse.json(uploadedFile);
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

/**
 * Handles the DELETE request to delete a file based on the provided file path.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response indicating the success or failure of the file deletion operation.
 *
 * @remarks
 * - The file path must be provided as a query parameter (`path`) in the request URL.
 * - If the file path is missing, a 400 status response is returned with an error message.
 * - If an error occurs during the deletion process, a 500 status response is returned with an error message.
 * - The actual file deletion logic is not implemented and should be added based on the storage solution used.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      );
    }

    // Delete file (implementation depends on storage solution)
    // For now, just return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("File deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
