import bcrypt from "bcryptjs";
import type { SessionUser } from "@/lib/commerce/types";
import { registerSchema, loginSchema } from "@/lib/commerce/validation";
import type { UserRepository } from "@/lib/data/user-repository";
import { prisma } from "@/lib/prisma";

function toSessionUser(row: {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}): SessionUser {
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName ?? "",
    lastName: row.lastName ?? "",
    phone: row.phone,
  };
}

export class PrismaUserRepository implements UserRepository {
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

    const email = input.email.toLowerCase();
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) throw new Error("email_exists");

    const user = await prisma.customer.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(input.password, 12),
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone ?? null,
        locale: "ar",
      },
    });

    return toSessionUser(user);
  }

  async login(email: string, password: string): Promise<SessionUser> {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) throw new Error("invalid_credentials");

    const user = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user?.passwordHash) throw new Error("invalid_credentials");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error("invalid_credentials");
    return toSessionUser(user);
  }

  async findById(id: string): Promise<SessionUser | null> {
    const user = await prisma.customer.findUnique({ where: { id } });
    return user ? toSessionUser(user) : null;
  }
}
