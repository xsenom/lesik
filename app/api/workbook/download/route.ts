import fs from "fs";
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

  const filePath = process.env.WORKBOOK_PDF_PATH || "/opt/lesik/private/workbook.pdf";

  if (!fs.existsSync(filePath)) {
    return new NextResponse("PDF not found", { status: 404 });
  }

  const file = fs.readFileSync(filePath);

  return new NextResponse(file, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="workbook-ekaterina-lecik.pdf"',
    },
  });
}
