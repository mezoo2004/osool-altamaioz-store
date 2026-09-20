import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { OrderInvoiceContent } from "@/components/commerce/order-invoice-content";
import { findOrderForGuestAccess } from "@/lib/commerce/order-access";

export default async function OrderInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; orderNumber: string }>;
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { locale, orderNumber } = await params;
  const { email = "", token } = await searchParams;
  setRequestLocale(locale);

  const order = await findOrderForGuestAccess(orderNumber, email, token);
  if (!order) notFound();

  return <OrderInvoiceContent order={order} locale={locale} />;
}
