import { NextRequest, NextResponse } from "next/server";
import { formatAccessDate, getServiceAccess } from "@/lib/serviceAccess";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const email = String(request.nextUrl.searchParams.get("email") || "")
    .trim()
    .toLowerCase();

  const access = email ? getServiceAccess(email) : null;

  return NextResponse.json({
    ok: true,
    paid: access?.paid === true,
    accessUntil: access?.accessUntil || null,
    accessUntilText: access?.accessUntil ? formatAccessDate(access.accessUntil) : "",
  });
}
