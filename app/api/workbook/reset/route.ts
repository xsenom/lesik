import { NextRequest, NextResponse } from "next/server";
import {
  findUserByEmail,
  generatePassword,
  sendPasswordResetEmail,
  updateUserPassword,
} from "@/lib/workbookAccess";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    console.log("[WORKBOOK RESET] request", {
      email,
      hasEmail: Boolean(email),
    });

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Введите email." },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);

    // Не раскрываем наружу, есть ли email в базе.
    if (!user) {
      console.warn("[WORKBOOK RESET] user not found", { email });

      return NextResponse.json({
        ok: true,
        message: "Если такой email есть в базе, мы отправим новый пароль.",
      });
    }

    const password = generatePassword();
    const updatedUser = updateUserPassword(email, password);

    if (!updatedUser) {
      console.error("[WORKBOOK RESET] failed to update password", { email });

      return NextResponse.json(
        { ok: false, error: "Не удалось обновить пароль." },
        { status: 500 }
      );
    }

    await sendPasswordResetEmail({
      email: updatedUser.email,
      name: updatedUser.name,
      password,
    });

    console.log("[WORKBOOK RESET] password updated and email sent", {
      email: updatedUser.email,
    });

    return NextResponse.json({
      ok: true,
      message: "Если такой email есть в базе, мы отправим новый пароль.",
    });
  } catch (error) {
    console.error("[WORKBOOK RESET] error", error);

    return NextResponse.json(
      { ok: false, error: "Ошибка сброса пароля." },
      { status: 500 }
    );
  }
}
