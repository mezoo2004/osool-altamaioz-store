import { setRequestLocale } from "next-intl/server";
import { OrderSuccessContent } from "@/components/commerce/order-content";
import { findOrderForSuccessPage } from "@/lib/commerce/order-access";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string; token?: string; email?: string }>;
}) {
  const { locale } = await params;
  const { order = "", token, email } = await searchParams;
  setRequestLocale(locale);

  const orderData = await findOrderForSuccessPage(order, { token, email });

  return <OrderSuccessContent orderNumber={order} order={orderData} locale={locale} />;
}
