import { setRequestLocale } from "next-intl/server";
import { WishlistPageContent } from "@/components/commerce/account-content";

export default async function WishlistPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WishlistPageContent locale={locale} />;
}
