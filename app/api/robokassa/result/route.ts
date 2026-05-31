import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  generatePassword,
  getOrder,
  markOrderPaid,
  sendAccessEmail,
  upsertUserFromPaidOrder,
} from "@/lib/workbookAccess";

export const dynamic = "force-dynamic";

function md5(value: string) {
  return crypto.createHash("md5").update(value).digest("hex").toUpperCase();
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

async function parseData(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await request.json();
  }

  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

export async function POST(request: NextRequest) {
  try {
    console.log("[ROBOKASSA RESULT] start");

    const data = await parseData(request);

    console.log("[ROBOKASSA RESULT] payload", {
      OutSum: data.OutSum,
      InvId: data.InvId,
      hasSignature: Boolean(data.SignatureValue),
      testMode: process.env.ROBOKASSA_TEST_MODE,
      hasLivePassword2: Boolean(process.env.ROBOKASSA_PASSWORD_2),
      hasTestPassword2: Boolean(process.env.ROBOKASSA_TEST_PASSWORD_2),
    });

    const outSum = String(data.OutSum || "");
    const invId = String(data.InvId || "");
    const signatureValue = String(data.SignatureValue || "").toUpperCase();

    const isTest = process.env.ROBOKASSA_TEST_MODE === "1";
    const password2 = isTest
      ? requiredEnv("ROBOKASSA_TEST_PASSWORD_2")
      : requiredEnv("ROBOKASSA_PASSWORD_2");

    const shpName = String(data.Shp_name || "");
    const shpPhone = String(data.Shp_phone || "");

    const expectedSignature = md5(
      `${outSum}:${invId}:${password2}:Shp_name=${shpName}:Shp_phone=${shpPhone}`
    );

    if (signatureValue !== expectedSignature) {
      console.error("Robokassa bad signature", {
        outSum,
        invId,
        signatureValue,
        expectedSignature,
      });

      return new NextResponse("bad sign", { status: 400 });
    }

    const order = getOrder(invId);

    if (!order) {
      console.error("Robokassa order not found", { invId, outSum });
      return new NextResponse("order not found", { status: 404 });
    }

    const paidOrder = markOrderPaid(invId) || order;
    const password = generatePassword();

    upsertUserFromPaidOrder(paidOrder, password);

    await sendAccessEmail({
      email: paidOrder.email,
      name: paidOrder.name,
      password,
    });

    console.log("ROBOKASSA PAYMENT SUCCESS AND ACCESS CREATED", {
      outSum,
      invId,
      email: paidOrder.email,
    });

    return new NextResponse(`OK${invId}`, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Robokassa result error:", error);
    return new NextResponse("error", { status: 500 });
  }
}
