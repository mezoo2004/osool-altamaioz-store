"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("errors");

  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <p className="eyebrow">404</p>
      <h1 className="heading-section mt-4">{t("notFoundTitle")}</h1>
      <p className="mt-3 max-w-md text-meta">{t("notFoundBody")}</p>
      <Link href="/" className="btn-cta mt-8">{t("backHome")}</Link>
    </div>
  );
}
