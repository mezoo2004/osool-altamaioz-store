import { z } from "zod";

export const saudiPhoneSchema = z
  .string()
  .min(9)
  .max(15)
  .regex(/^(\+966|966|0)?5\d{8}$/, "invalid_saudi_phone");

export const emailSchema = z.string().email("invalid_email");

export const addressSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(2, "required"),
  phone: saudiPhoneSchema,
  country: z.string().min(2, "required"),
  city: z.string().min(2, "required"),
  district: z.string().optional(),
  street: z.string().min(2, "required"),
  buildingNumber: z.string().optional(),
  postalCode: z.string().optional(),
  additionalDetails: z.string().optional(),
});

export const checkoutSchema = z.object({
  email: emailSchema,
  phone: saudiPhoneSchema,
  fullName: z.string().min(2, "required"),
  address: addressSchema,
  shippingMethodId: z.enum(["local-dev", "saudi-dev", "gcc-dev", "international-dev"]),
  paymentMethodId: z.enum([
    "card-placeholder",
    "mada-placeholder",
    "apple-pay-placeholder",
    "tabby-placeholder",
    "tamara-placeholder",
    "development-test",
  ]),
  customerNotes: z.string().optional(),
  acceptTerms: z.literal(true, { message: "terms_required" }),
  cartLines: z
    .array(
      z.object({
        productId: z.string(),
        productSlug: z.string(),
        variantId: z.string(),
        variantSku: z.string(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "cart_empty"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "password_min"),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(8, "password_min"),
    confirmPassword: z.string(),
    firstName: z.string().min(1, "required"),
    lastName: z.string().min(1, "required"),
    phone: saudiPhoneSchema.optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "password_mismatch",
    path: ["confirmPassword"],
  });

export const guestTrackSchema = z.object({
  orderNumber: z.string().min(5),
  email: emailSchema,
});

export function normalizeSaudiPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("966")) return `+${digits}`;
  if (digits.startsWith("0")) return `+966${digits.slice(1)}`;
  if (digits.startsWith("5")) return `+966${digits}`;
  return phone;
}
