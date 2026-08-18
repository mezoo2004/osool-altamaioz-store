import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Address, AddressInput, Customer, SessionUser } from "@/lib/commerce/types";
import { emailSchema, loginSchema, registerSchema } from "@/lib/commerce/validation";
import { requiresDatabaseStorage } from "@/lib/data/database-config";
import { PrismaUserRepository } from "@/lib/data/prisma-user-repository";
import { PrismaAddressRepository } from "@/lib/data/prisma-address-repository";

const STORE_DIR = path.join(process.cwd(), "data", "store");
const USERS_FILE = path.join(STORE_DIR, "users.json");
const ADDRESSES_FILE = path.join(STORE_DIR, "addresses.json");
const SESSION_COOKIE = "osool_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-only-change-in-production-osool-altamaioz",
);

type StoredUser = Customer;
type StoredAddress = Address;

function ensureStore() {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
  if (!fs.existsSync(ADDRESSES_FILE)) fs.writeFileSync(ADDRESSES_FILE, "[]");
}

function readUsers(): StoredUser[] {
  ensureStore();
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8")) as StoredUser[];
}

function writeUsers(users: StoredUser[]) {
  ensureStore();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readAddresses(): StoredAddress[] {
  ensureStore();
  return JSON.parse(fs.readFileSync(ADDRESSES_FILE, "utf8")) as StoredAddress[];
}

function writeAddresses(addresses: StoredAddress[]) {
  ensureStore();
  fs.writeFileSync(ADDRESSES_FILE, JSON.stringify(addresses, null, 2));
}

export interface UserRepository {
  register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<SessionUser>;
  login(email: string, password: string): Promise<SessionUser>;
  findById(id: string): Promise<SessionUser | null>;
}

export interface AddressRepository {
  list(customerId: string): Promise<Address[]>;
  create(customerId: string, input: AddressInput): Promise<Address>;
  delete(customerId: string, addressId: string): Promise<void>;
}

export class FileUserRepository implements UserRepository {
  async register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<SessionUser> {
    const parsed = registerSchema.safeParse({
      ...input,
      confirmPassword: input.password,
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "validation_failed");

    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("email_exists");
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      email: input.email.toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, 12),
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone ?? null,
      locale: "ar",
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    writeUsers(users);
    return toSessionUser(user);
  }

  async login(email: string, password: string): Promise<SessionUser> {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) throw new Error("invalid_credentials");

    const user = readUsers().find((u) => u.email === email.toLowerCase());
    if (!user) throw new Error("invalid_credentials");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error("invalid_credentials");
    return toSessionUser(user);
  }

  async findById(id: string): Promise<SessionUser | null> {
    const user = readUsers().find((u) => u.id === id);
    return user ? toSessionUser(user) : null;
  }
}

export class FileAddressRepository implements AddressRepository {
  async list(customerId: string): Promise<Address[]> {
    return readAddresses().filter((a) => a.customerId === customerId);
  }

  async create(customerId: string, input: AddressInput): Promise<Address> {
    const addresses = readAddresses();
    const address: Address = {
      ...input,
      id: crypto.randomUUID(),
      customerId,
      isDefault: addresses.filter((a) => a.customerId === customerId).length === 0,
    };
    addresses.push(address);
    writeAddresses(addresses);
    return address;
  }

  async delete(customerId: string, addressId: string): Promise<void> {
    writeAddresses(
      readAddresses().filter((a) => !(a.customerId === customerId && a.id === addressId)),
    );
  }
}

function toSessionUser(user: StoredUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  };
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ sub: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.sub;
    if (!userId) return null;
    return getUserRepository().findById(userId);
  } catch {
    return null;
  }
}

let userRepository: UserRepository | null = null;
let addressRepository: AddressRepository | null = null;
let prismaUserRepository: PrismaUserRepository | null = null;
let prismaAddressRepository: PrismaAddressRepository | null = null;

export function getUserRepository(): UserRepository {
  if (requiresDatabaseStorage()) {
    if (!prismaUserRepository) prismaUserRepository = new PrismaUserRepository();
    return prismaUserRepository;
  }
  if (!userRepository) userRepository = new FileUserRepository();
  return userRepository;
}

export function getAddressRepository(): AddressRepository {
  if (requiresDatabaseStorage()) {
    if (!prismaAddressRepository) prismaAddressRepository = new PrismaAddressRepository();
    return prismaAddressRepository;
  }
  if (!addressRepository) addressRepository = new FileAddressRepository();
  return addressRepository;
}

export { emailSchema };
