import { NextRequest, NextResponse } from "next/server";
import { supabaseStorageService } from "@/lib/services/supabaseStorageService";

/**
 * Handles the GET request to serve a file from Supabase Storage.
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
  }: { params: Promise<{ formId: string; fieldId: string; fileName: string }> }
) {
  try {
    const { formId, fieldId, fileName } = await params;

    // Construct the storage path
    const storagePath = `forms/${formId}/fields/${fieldId}/${fileName}`;

    // Download file from Supabase Storage
    const fileBlob = await supabaseStorageService.downloadFile(storagePath);

    // Convert blob to array buffer
    const arrayBuffer = await fileBlob.arrayBuffer();

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

    return new NextResponse(new Uint8Array(arrayBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("File serving error:", error);

    // Check if it's a not found error
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}
