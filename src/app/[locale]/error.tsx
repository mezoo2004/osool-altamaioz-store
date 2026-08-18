"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="heading-section">{t("errorTitle")}</h1>
      <p className="mt-3 max-w-md text-meta">{t("errorBody")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-cta">{t("tryAgain")}</button>
        <Link href="/" className="btn-cta-secondary">{t("backHome")}</Link>
      </div>
    </div>
  );
}
