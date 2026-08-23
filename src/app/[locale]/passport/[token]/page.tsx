import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { PassportPageContent } from "@/components/passport/passport-page-content";
import { verifyPassportToken } from "@/lib/passport/passport-token";
import { resolvePassport } from "@/lib/passport/passport-resolver";

export default async function PassportPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale: rawLocale, token } = await params;
  const locale = rawLocale === "en" ? "en" : "ar";
  setRequestLocale(locale);

  const payload = await verifyPassportToken(decodeURIComponent(token));
  if (!payload) notFound();

  const data = await resolvePassport(payload, locale);
  if (!data) notFound();

  return <PassportPageContent data={data} token={decodeURIComponent(token)} />;
}
