import { setRequestLocale } from "next-intl/server";
import { TrackOrderContent } from "@/components/commerce/order-content";

export default async function TrackOrderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TrackOrderContent locale={locale} />;
}
