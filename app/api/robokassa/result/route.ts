import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  generatePassword,
  getOrder,
  markOrderPaid,
  sendAccessEmail,
  upsertUserFromPaidOrder,
} from "@/lib/workbookAccess";
import {
  getServiceOrder,
  markServiceOrderPaid,
  sendServicePaymentTelegram,
  upsertServiceAccessFromPaidOrder,
} from "@/lib/serviceAccess";

export const dynamic = "force-dynamic";

function md5(value: string) {
  return crypto.createHash("md5").update(value).digest("hex").toUpperCase();
}


function amountToCents(value: string) {
  const normalized = String(value || "").replace(",", ".").trim();
  const number = Number(normalized);

  if (!Number.isFinite(number)) {
    return NaN;
  }

  return Math.round(number * 100);
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
    const shpEmail = String(data.Shp_email || "").trim().toLowerCase();
    const shpProduct = String(data.Shp_product || "");

    const expectedSignature =
      shpProduct === "content_map_full"
        ? md5(
            `${outSum}:${invId}:${password2}:Shp_email=${shpEmail}:Shp_name=${shpName}:Shp_phone=${shpPhone}:Shp_product=${shpProduct}`
          )
        : md5(
            `${outSum}:${invId}:${password2}:Shp_name=${shpName}:Shp_phone=${shpPhone}`
          );

    if (signatureValue !== expectedSignature) {
      console.error("Robokassa bad signature", {
        outSum,
        invId,
        shpProduct,
        signatureValue,
        expectedSignature,
      });

      return new NextResponse("bad sign", { status: 400 });
    }

    if (shpProduct === "content_map_full") {
      const serviceOrder = getServiceOrder(invId);

      if (!serviceOrder) {
        console.error("Robokassa service order not found", { invId, outSum });
        return new NextResponse("service order not found", { status: 404 });
      }

      if (amountToCents(serviceOrder.outSum) !== amountToCents(outSum)) {
        console.error("Robokassa service bad sum", {
          invId,
          expected: serviceOrder.outSum,
          received: outSum,
          expectedCents: amountToCents(serviceOrder.outSum),
          receivedCents: amountToCents(outSum),
        });
        return new NextResponse("bad sum", { status: 400 });
      }

      const paidServiceOrder = markServiceOrderPaid(invId) || serviceOrder;
      upsertServiceAccessFromPaidOrder(paidServiceOrder);
      await sendServicePaymentTelegram(paidServiceOrder);

      console.log("ROBOKASSA SERVICE PAYMENT SUCCESS", {
        outSum,
        invId,
        email: paidServiceOrder.email,
      });

      return new NextResponse(`OK${invId}`, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    const order = getOrder(invId);

    if (!order) {
      console.error("Robokassa order not found", { invId, outSum });
      return new NextResponse("order not found", { status: 404 });
    }

    if (amountToCents(order.outSum) !== amountToCents(outSum)) {
      console.error("Robokassa workbook bad sum", {
        invId,
        expected: order.outSum,
        received: outSum,
        expectedCents: amountToCents(order.outSum),
        receivedCents: amountToCents(outSum),
      });
      return new NextResponse("bad sum", { status: 400 });
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
