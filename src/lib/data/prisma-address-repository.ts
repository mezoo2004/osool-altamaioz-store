import type { Address, AddressInput } from "@/lib/commerce/types";
import type { AddressRepository } from "@/lib/data/user-repository";
import { prisma } from "@/lib/prisma";

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function toAddress(row: {
  id: string;
  customerId: string;
  label: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
}): Address {
  return {
    id: row.id,
    customerId: row.customerId,
    label: row.label ?? undefined,
    fullName: [row.firstName, row.lastName].filter(Boolean).join(" "),
    phone: row.phone,
    country: row.country,
    city: row.city,
    district: row.region ?? undefined,
    street: row.line1,
    buildingNumber: undefined,
    postalCode: row.postalCode ?? undefined,
    additionalDetails: row.line2 ?? undefined,
    isDefault: row.isDefault,
  };
}

export class PrismaAddressRepository implements AddressRepository {
  async list(customerId: string): Promise<Address[]> {
    const rows = await prisma.address.findMany({
      where: { customerId },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    });
    return rows.map(toAddress);
  }

  async create(customerId: string, input: AddressInput): Promise<Address> {
    const { firstName, lastName } = splitFullName(input.fullName);
    const existing = await prisma.address.count({ where: { customerId } });

    const row = await prisma.address.create({
      data: {
        customerId,
        label: input.label ?? null,
        firstName,
        lastName,
        phone: input.phone,
        line1: [input.street, input.buildingNumber].filter(Boolean).join(" "),
        line2: input.additionalDetails ?? null,
        city: input.city,
        region: input.district ?? null,
        postalCode: input.postalCode ?? null,
        country: input.country || "SA",
        isDefault: existing === 0,
      },
    });

    return toAddress(row);
  }

  async delete(customerId: string, addressId: string): Promise<void> {
    const deleted = await prisma.address.deleteMany({
      where: { id: addressId, customerId },
    });
    if (deleted.count === 0) throw new Error("address_not_found");
  }
}
