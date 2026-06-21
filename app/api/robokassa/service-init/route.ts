import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServicePendingOrder } from "@/lib/serviceAccess";

export const dynamic = "force-dynamic";

function md5(value: string) {
  return crypto.createHash("md5").update(value).digest("hex");
}


function normalizeRuKzPhone(value: string) {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) return "";

  if (digits.length === 11 && digits.startsWith("8")) {
    return `+7${digits.slice(1)}`;
  }

  if (digits.length === 11 && digits.startsWith("7")) {
    return `+${digits}`;
  }

  if (digits.length === 10 && digits.startsWith("9")) {
    return `+7${digits}`;
  }

  if (digits.length === 10 && digits.startsWith("7")) {
    return `+7${digits}`;
  }

  return value.startsWith("+") ? value : `+${digits}`;
}

function isValidRuKzPhone(value: string) {
  return /^\+7\d{10}$/.test(normalizeRuKzPhone(value));
}

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    console.error("[ROBOKASSA SERVICE INIT] Missing env:", name);
    throw new Error(`Missing env: ${name}`);
  }

  return value;
}

export async function POST(request: NextRequest) {
  const requestId = Date.now().toString();

  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const phoneRaw = String(body.phone || "").trim();
    const phone = normalizeRuKzPhone(phoneRaw);
    const email = String(body.email || "").trim().toLowerCase();

    if (!name || !phone || !email) {
      return NextResponse.json(
        { ok: false, error: "Заполните имя, телефон и email." },
        { status: 400 }
      );
    }

    if (!isValidRuKzPhone(phone)) {
      return NextResponse.json(
        { ok: false, error: "Введите корректный номер РФ или Казахстана в формате +7XXXXXXXXXX." },
        { status: 400 }
      );
    }

    const isTest = process.env.ROBOKASSA_TEST_MODE === "1";
    const merchantLogin = requiredEnv("ROBOKASSA_MERCHANT_LOGIN");

    const password1 = isTest
      ? requiredEnv("ROBOKASSA_TEST_PASSWORD_1")
      : requiredEnv("ROBOKASSA_PASSWORD_1");

    const outSum = "2900.00";
    const invId = Date.now().toString();
    const description = "Полная карта контента LESik";
    const shpProduct = "content_map_full";

    createServicePendingOrder({
      invId,
      name,
      phone,
      email,
      outSum,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    const signatureValue = md5(
      `${merchantLogin}:${outSum}:${invId}:${password1}:Shp_email=${email}:Shp_name=${name}:Shp_phone=${phone}:Shp_product=${shpProduct}`
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
      Shp_email: email,
      Shp_name: name,
      Shp_phone: phone,
      Shp_product: shpProduct,
    });

    if (isTest) {
      params.set("IsTest", "1");
    }

    const paymentUrl = `https://auth.robokassa.ru/Merchant/Index.aspx?${params.toString()}`;

    console.log("[ROBOKASSA SERVICE INIT] payment url created", {
      requestId,
      invId,
      email,
      outSum,
      isTest,
    });

    return NextResponse.json({
      ok: true,
      paymentUrl,
      invId,
    });
  } catch (error) {
    console.error(`[ROBOKASSA SERVICE INIT ${requestId}] error`, error);

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        ok: false,
        error: "Не удалось создать ссылку на оплату.",
        debug: message,
      },
      { status: 500 }
    );
  }
}
