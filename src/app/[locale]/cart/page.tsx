import { setRequestLocale } from "next-intl/server";
import { CartPageContent } from "@/components/commerce/cart-page-content";

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CartPageContent locale={locale} />;
}
