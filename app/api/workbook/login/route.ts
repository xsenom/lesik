import { NextRequest, NextResponse } from "next/server";
import {
  createAuthToken,
  findUserByEmail,
  verifyPassword,
} from "@/lib/workbookAccess";

export const dynamic = "force-dynamic";

function maskEmail(email: string) {
  const [name = "", domain = ""] = email.split("@");
  if (!domain) return "***";
  return `${name.slice(0, 2)}***@${domain}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    console.log("[WORKBOOK LOGIN] request", {
      email: maskEmail(email),
      hasPassword: Boolean(password),
    });

    const user = findUserByEmail(email);

    console.log("[WORKBOOK LOGIN] user lookup", {
      email: maskEmail(email),
      found: Boolean(user),
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Неверный логин или пароль." },
        { status: 401 }
      );
    }

    const passwordOk = verifyPassword(password, user.passwordHash);

    console.log("[WORKBOOK LOGIN] password check", {
      email: maskEmail(email),
      passwordOk,
    });

    if (!passwordOk) {
      return NextResponse.json(
        { ok: false, error: "Неверный логин или пароль." },
        { status: 401 }
      );
    }

    const token = createAuthToken(email);

    const response = NextResponse.json({ ok: true });

    response.cookies.set("workbook_access", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("[WORKBOOK LOGIN] error", error);

    return NextResponse.json(
      { ok: false, error: "Ошибка входа." },
      { status: 500 }
    );
  }
}
