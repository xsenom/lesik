import fs from "fs/promises";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/workbookAccess";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("workbook_access")?.value;
  const email = verifyAuthToken(token);

  if (!email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const filePath = process.env.WORKBOOK_PDF_PATH || "private/workbook.pdf";

  let file: Buffer;

  try {
    file = await fs.readFile(filePath);
  } catch (error) {
    console.error("[WORKBOOK DOWNLOAD] PDF not found", {
      hasCustomPath: Boolean(process.env.WORKBOOK_PDF_PATH),
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return new NextResponse("PDF not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="workbook-ekaterina-lecik.pdf"',
    },
  });
}
