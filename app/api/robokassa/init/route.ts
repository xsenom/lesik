import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createPendingOrder } from "@/lib/workbookAccess";

export const dynamic = "force-dynamic";

function md5(value: string) {
  return crypto.createHash("md5").update(value).digest("hex");
}

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    console.error("[ROBOKASSA INIT] Missing env:", name);
    throw new Error(`Missing env: ${name}`);
  }

  return value;
}

export async function POST(request: NextRequest) {
  const requestId = Date.now().toString();

  try {
    console.log(`[ROBOKASSA INIT ${requestId}] start`);

    const body = await request.json();

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim().toLowerCase();

    console.log(`[ROBOKASSA INIT ${requestId}] input`, {
      hasName: Boolean(name),
      hasPhone: Boolean(phone),
      email,
    });

    if (!name || !phone || !email) {
      console.warn(`[ROBOKASSA INIT ${requestId}] validation failed`);
      return NextResponse.json(
        { ok: false, error: "Заполните имя, телефон и email." },
        { status: 400 }
      );
    }

    const isTest = process.env.ROBOKASSA_TEST_MODE === "1";

    console.log(`[ROBOKASSA INIT ${requestId}] mode`, {
      ROBOKASSA_TEST_MODE: process.env.ROBOKASSA_TEST_MODE,
      isTest,
      hasMerchantLogin: Boolean(process.env.ROBOKASSA_MERCHANT_LOGIN),
      hasLivePassword1: Boolean(process.env.ROBOKASSA_PASSWORD_1),
      hasTestPassword1: Boolean(process.env.ROBOKASSA_TEST_PASSWORD_1),
    });

    const merchantLogin = requiredEnv("ROBOKASSA_MERCHANT_LOGIN");

    const password1 = isTest
      ? requiredEnv("ROBOKASSA_TEST_PASSWORD_1")
      : requiredEnv("ROBOKASSA_PASSWORD_1");

    const outSum = "2100.00";
    const invId = Date.now().toString();
    const description = "Рабочая тетрадь 5 шагов к стабильным заявкам";

    console.log(`[ROBOKASSA INIT ${requestId}] create order`, {
      invId,
      email,
      outSum,
    });

    createPendingOrder({
      invId,
      name,
      phone,
      email,
      outSum,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    console.log(`[ROBOKASSA INIT ${requestId}] order saved`);

    const shpName = name;
    const shpPhone = phone;

    const signatureValue = md5(
      `${merchantLogin}:${outSum}:${invId}:${password1}:Shp_name=${shpName}:Shp_phone=${shpPhone}`
    );

    const params = new URLSearchParams({
      MerchantLogin: merchantLogin,
      OutSum: outSum,
      InvId: invId,
      Description: description,
      SignatureValue: signatureValue,
      Culture: "ru",
      Encoding: "utf-8",
      Email: email,
      Shp_name: shpName,
      Shp_phone: shpPhone,
    });

    if (isTest) {
      params.set("IsTest", "1");
    }

    const paymentUrl = `https://auth.robokassa.ru/Merchant/Index.aspx?${params.toString()}`;

    console.log(`[ROBOKASSA INIT ${requestId}] payment url created`, {
      invId,
      isTest,
      paymentHost: "auth.robokassa.ru",
    });

    return NextResponse.json({
      ok: true,
      paymentUrl,
      invId,
    });
  } catch (error) {
    console.error(`[ROBOKASSA INIT ${requestId}] error`, error);

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        ok: false,
        error: "Не удалось создать ссылку на оплату." +
          (process.env.NODE_ENV === "development" ? ` ${message}` : ""),
      },
      { status: 500 }
    );
  }
}
