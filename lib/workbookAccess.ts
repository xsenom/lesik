import fs from "fs";
import path from "path";
import crypto from "crypto";
import nodemailer from "nodemailer";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_PATH = path.join(DATA_DIR, "orders.json");
const USERS_PATH = path.join(DATA_DIR, "workbook-users.json");

export type Order = {
  invId: string;
  name: string;
  phone: string;
  email: string;
  outSum: string;
  status: "pending" | "paid";
  createdAt: string;
  paidAt?: string;
};

export type WorkbookUser = {
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
  orderInvId: string;
};

function ensureDataFiles() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(ORDERS_PATH)) {
    fs.writeFileSync(ORDERS_PATH, "[]", "utf-8");
  }

  if (!fs.existsSync(USERS_PATH)) {
    fs.writeFileSync(USERS_PATH, "[]", "utf-8");
  }
}

function readJson<T>(filePath: string): T[] {
  ensureDataFiles();

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T[];
  } catch {
    return [];
  }
}

function writeJson<T>(filePath: string, data: T[]) {
  ensureDataFiles();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function createPendingOrder(order: Order) {
  const orders = readJson<Order>(ORDERS_PATH);
  const withoutSame = orders.filter((item) => item.invId !== order.invId);
  withoutSame.push(order);
  writeJson(ORDERS_PATH, withoutSame);
}

export function getOrder(invId: string) {
  const orders = readJson<Order>(ORDERS_PATH);
  return orders.find((item) => item.invId === invId) || null;
}

export function markOrderPaid(invId: string) {
  const orders = readJson<Order>(ORDERS_PATH);

  const updated = orders.map((item) => {
    if (item.invId !== invId) return item;

    return {
      ...item,
      status: "paid" as const,
      paidAt: new Date().toISOString(),
    };
  });

  writeJson(ORDERS_PATH, updated);

  return updated.find((item) => item.invId === invId) || null;
}

export function generatePassword() {
  return crypto.randomBytes(9).toString("base64url");
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(":");
  if (!salt || !storedHash) return false;

  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(storedHash, "hex")
  );
}

export function upsertUserFromPaidOrder(order: Order, password: string) {
  const users = readJson<WorkbookUser>(USERS_PATH);
  const email = order.email.toLowerCase();

  const existing = users.find((item) => item.email.toLowerCase() === email);

  const nextUser: WorkbookUser = {
    email,
    name: order.name,
    phone: order.phone,
    passwordHash: hashPassword(password),
    createdAt: existing?.createdAt || new Date().toISOString(),
    orderInvId: order.invId,
  };

  const updated = users.filter((item) => item.email.toLowerCase() !== email);
  updated.push(nextUser);

  writeJson(USERS_PATH, updated);

  return nextUser;
}

export function findUserByEmail(email: string) {
  const users = readJson<WorkbookUser>(USERS_PATH);
  return users.find((item) => item.email.toLowerCase() === email.toLowerCase()) || null;
}

export function createAuthToken(email: string) {
  const secret = process.env.AUTH_COOKIE_SECRET;
  if (!secret) throw new Error("Missing env: AUTH_COOKIE_SECRET");

  const payload = `${email.toLowerCase()}:${Date.now()}`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  return `${payload}:${signature}`;
}

export function verifyAuthToken(token: string | undefined) {
  if (!token) return null;

  const secret = process.env.AUTH_COOKIE_SECRET;
  if (!secret) return null;

  const parts = token.split(":");
  if (parts.length !== 3) return null;

  const [email, timestamp, signature] = parts;
  const payload = `${email}:${timestamp}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  if (signature !== expected) return null;

  const age = Date.now() - Number(timestamp);
  const maxAge = 1000 * 60 * 60 * 24 * 30;

  if (!Number.isFinite(age) || age > maxAge) return null;

  return email;
}

export async function sendAccessEmail(params: {
  email: string;
  name: string;
  password: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "465");
  const secure = process.env.SMTP_SECURE !== "0";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    console.log("SMTP не настроен. Доступ для клиента:", params);
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  const loginUrl = "https://ekaterinaletsik.ru/workbook/login";

  await transporter.sendMail({
    from,
    to: params.email,
    subject: "Доступ к рабочей тетради Екатерины Лецик",
    text: `Здравствуйте, ${params.name}!

Спасибо за оплату рабочей тетради.

Доступ в личный кабинет:
${loginUrl}

Логин: ${params.email}
Пароль: ${params.password}

В личном кабинете вы сможете скачать PDF-файл рабочей тетради.

С уважением,
Екатерина Лецик`,
    html: `
      <div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#111">
        <p>Здравствуйте, ${params.name}!</p>
        <p>Спасибо за оплату рабочей тетради.</p>
        <p><b>Доступ в личный кабинет:</b><br/>
        <a href="${loginUrl}">${loginUrl}</a></p>
        <p><b>Логин:</b> ${params.email}<br/>
        <b>Пароль:</b> ${params.password}</p>
        <p>В личном кабинете вы сможете скачать PDF-файл рабочей тетради.</p>
        <p>С уважением,<br/>Екатерина Лецик</p>
      </div>
    `,
  });
}

export function updateUserPassword(email: string, password: string) {
  const users = readJson<WorkbookUser>(USERS_PATH);
  const normalizedEmail = email.toLowerCase();

  let found = false;

  const updated = users.map((item) => {
    if (item.email.toLowerCase() !== normalizedEmail) return item;

    found = true;

    return {
      ...item,
      passwordHash: hashPassword(password),
    };
  });

  if (!found) return null;

  writeJson(USERS_PATH, updated);

  return updated.find((item) => item.email.toLowerCase() === normalizedEmail) || null;
}

export async function sendPasswordResetEmail(params: {
  email: string;
  name: string;
  password: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "465");
  const secure = process.env.SMTP_SECURE !== "0";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    console.log("SMTP не настроен. Новый пароль для клиента:", params);
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  const loginUrl = "https://ekaterinaletsik.ru/workbook/login";

  await transporter.sendMail({
    from,
    to: params.email,
    subject: "Новый пароль от личного кабинета",
    text: `Здравствуйте, ${params.name}!

Мы сформировали новый пароль для входа в личный кабинет.

Вход:
${loginUrl}

Логин: ${params.email}
Новый пароль: ${params.password}

С уважением,
Екатерина Лецик`,
    html: `
      <div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#111">
        <p>Здравствуйте, ${params.name}!</p>
        <p>Мы сформировали новый пароль для входа в личный кабинет.</p>
        <p><b>Вход:</b><br/>
        <a href="${loginUrl}">${loginUrl}</a></p>
        <p><b>Логин:</b> ${params.email}<br/>
        <b>Новый пароль:</b> ${params.password}</p>
        <p>С уважением,<br/>Екатерина Лецик</p>
      </div>
    `,
  });
}


