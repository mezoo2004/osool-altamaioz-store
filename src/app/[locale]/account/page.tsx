import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AccountOverview } from "@/components/commerce/account-content";
import { getSessionUser } from "@/lib/data/user-repository";

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login`);
  return <AccountOverview userName={`${user.firstName} ${user.lastName}`} locale={locale} />;
}
