import { setRequestLocale } from "next-intl/server";
import { TrackOrderContent } from "@/components/commerce/order-content";

export default async function TrackOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string; email?: string }>;
}) {
  const { locale } = await params;
  const { order = "", email = "" } = await searchParams;
  setRequestLocale(locale);
  return <TrackOrderContent locale={locale} initialOrderNumber={order} initialEmail={email} />;
}
