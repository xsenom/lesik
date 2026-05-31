import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(
    new URL("/workbook/login", process.env.NEXT_PUBLIC_SITE_URL || "https://ekaterinaletsik.ru")
  );

  response.cookies.set("workbook_access", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
