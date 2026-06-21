import fs from "fs";
import path from "path";

export type ServiceOrder = {
  invId: string;
  name: string;
  phone: string;
  email: string;
  outSum: string;
  status: "pending" | "paid";
  createdAt: string;
  paidAt?: string;
  accessUntil?: string;
};

type ServiceAccess = {
  email: string;
  paid: true;
  product: "content_map_full";
  paidAt: string;
  accessUntil?: string;
  invId: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "service_orders.json");
const ACCESS_FILE = path.join(DATA_DIR, "service_access.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(file: string, fallback: T): T {
  ensureDataDir();

  if (!fs.existsSync(file)) {
    return fallback;
  }

  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(file: string, value: T) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(value, null, 2), "utf-8");
}

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase();
}

function getAccessDays() {
  const raw = Number(process.env.SERVICE_ACCESS_DAYS || "30");
  return Number.isFinite(raw) && raw > 0 ? raw : 30;
}

export function formatAccessDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

export function createServicePendingOrder(order: ServiceOrder) {
  const orders = readJson<Record<string, ServiceOrder>>(ORDERS_FILE, {});
  orders[order.invId] = {
    ...order,
    email: normalizeEmail(order.email),
  };
  writeJson(ORDERS_FILE, orders);
}

export function getServiceOrder(invId: string) {
  const orders = readJson<Record<string, ServiceOrder>>(ORDERS_FILE, {});
  return orders[String(invId)] || null;
}

export function markServiceOrderPaid(invId: string) {
  const orders = readJson<Record<string, ServiceOrder>>(ORDERS_FILE, {});
  const order = orders[String(invId)];

  if (!order) return null;

  const paidAt = new Date();
  const accessUntil = new Date(paidAt);
  accessUntil.setDate(accessUntil.getDate() + getAccessDays());

  const paidOrder: ServiceOrder = {
    ...order,
    status: "paid",
    paidAt: paidAt.toISOString(),
    accessUntil: accessUntil.toISOString(),
  };

  orders[String(invId)] = paidOrder;
  writeJson(ORDERS_FILE, orders);

  return paidOrder;
}

export function upsertServiceAccessFromPaidOrder(order: ServiceOrder) {
  const access = readJson<Record<string, ServiceAccess>>(ACCESS_FILE, {});
  const email = normalizeEmail(order.email);

  access[email] = {
    email,
    paid: true,
    product: "content_map_full",
    paidAt: order.paidAt || new Date().toISOString(),
    accessUntil: order.accessUntil,
    invId: order.invId,
  };

  writeJson(ACCESS_FILE, access);
}

export function getServiceAccess(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const access = readJson<Record<string, ServiceAccess>>(ACCESS_FILE, {});
  const row = access[normalized];

  if (!row || row.paid !== true || row.product !== "content_map_full") {
    return null;
  }

  if (row.accessUntil) {
    const until = new Date(row.accessUntil);
    if (!Number.isNaN(until.getTime()) && until.getTime() < Date.now()) {
      return {
        ...row,
        paid: false,
      };
    }
  }

  return row;
}

export function hasServiceAccess(email: string) {
  const row = getServiceAccess(email);
  return row?.paid === true;
}

export async function sendServicePaymentTelegram(order: ServiceOrder) {
  const token =
    process.env.SERVICE_PAYMENT_TG_BOT_TOKEN ||
    process.env.TELEGRAM_BOT_TOKEN ||
    "";

  const chatId =
    process.env.SERVICE_PAYMENT_TG_CHAT_ID ||
    process.env.TELEGRAM_ADMIN_CHAT_ID ||
    "";

  if (!token || !chatId) {
    console.warn("[SERVICE PAYMENT TG] skipped: missing token or chat id");
    return;
  }

  const accessUntilText = formatAccessDate(order.accessUntil);

  const text = [
    "✅ Оплата сервиса ЛЕСik",
    "",
    `Продукт: Полная карта контента`,
    `Сумма: ${order.outSum} ₽`,
    `Имя: ${order.name}`,
    `Телефон: ${order.phone}`,
    `Email: ${order.email}`,
    `Доступ до: ${accessUntilText || "не указан"}`,
    `InvId: ${order.invId}`,
  ].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[SERVICE PAYMENT TG] send failed", response.status, body);
  }
}
