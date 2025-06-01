import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * Handles the GET request to serve a file from the server's file system.
 *
 * @param request - The incoming Next.js request object.
 * @param context - An object containing route parameters.
 * @param context.params - The route parameters extracted from the URL.
 * @param context.params.formId - The ID of the form associated with the file.
 * @param context.params.fieldId - The ID of the field associated with the file.
 * @param context.params.fileName - The name of the file to be served.
 *
 * @returns A `NextResponse` object containing the file data if found, or an error response if the file is not found or an error occurs.
 *
 * @throws Will return a 404 response if the file does not exist.
 * @throws Will return a 500 response if an error occurs while serving the file.
 */
export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ formId: string; fieldId: string; fileName: string }> },
) {
  try {
    const { formId, fieldId, fileName } = await params;

    const filePath = join(process.cwd(), "uploads", formId, fieldId, fileName);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);

    // Determine content type based on file extension
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    const contentTypes: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      txt: "text/plain",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      csv: "text/csv",
    };

    const contentType = contentTypes[extension] || "application/octet-stream";

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("File serving error:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 },
    );
  }
}
