import { setRequestLocale } from "next-intl/server";
import { OrderSuccessContent } from "@/components/commerce/order-content";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  const { order = "" } = await searchParams;
  setRequestLocale(locale);
  return <OrderSuccessContent orderNumber={order} locale={locale} />;
}
