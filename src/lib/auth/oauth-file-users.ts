import fs from "node:fs";
import path from "node:path";
import type { Customer, SessionUser } from "@/lib/commerce/types";

const STORE_DIR = path.join(process.cwd(), "data", "store");
const USERS_FILE = path.join(STORE_DIR, "users.json");

function ensureStore() {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
}

function readUsers(): Customer[] {
  ensureStore();
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8")) as Customer[];
}

function writeUsers(users: Customer[]) {
  ensureStore();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function findFileUserByEmail(email: string): Customer | null {
  return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function createOAuthFileUser(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<SessionUser> {
  const users = readUsers();
  const user: Customer = {
    id: crypto.randomUUID(),
    email: input.email.toLowerCase(),
    passwordHash: "",
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone ?? null,
    locale: "ar",
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  };
}
