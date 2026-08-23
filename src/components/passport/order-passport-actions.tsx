"use client";

import { ExternalLink, QrCode } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { PassportQrModal } from "@/components/passport/passport-qr-modal";
import { buildPassportAbsoluteUrl } from "@/lib/passport/passport-url";
import { trackEvent } from "@/lib/analytics";
import type { OrderItemSnapshot } from "@/lib/commerce/types";

type OrderPassportActionsProps = {
  orderNumber: string;
  item: OrderItemSnapshot;
  locale: "ar" | "en";
};

export function OrderPassportActions({ orderNumber, item, locale }: OrderPassportActionsProps) {
  const t = useTranslations("passport");
  const [qrOpen, setQrOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const productName = locale === "ar" ? item.nameAr : item.nameEn;

  const ensureToken = async (): Promise<string | null> => {
    if (token) return token;
    setLoading(true);
    try {
      const res = await fetch("/api/passport/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "purchase",
          orderNumber,
          orderItemId: item.id,
          locale,
        }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { token: string };
      setToken(data.token);
      return data.token;
    } finally {
      setLoading(false);
    }
  };

  const openPassport = async () => {
    const tkn = await ensureToken();
    if (tkn) {
      window.location.href = `/${locale}/passport/${encodeURIComponent(tkn)}`;
    }
  };

  const showQr = async () => {
    const tkn = await ensureToken();
    if (tkn) {
      trackEvent("passport_qr_open", { product_slug: item.productSlug, source: "order" });
      setQrOpen(true);
    }
  };

  const passportUrl = token ? buildPassportAbsoluteUrl(locale, token) : "";

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void openPassport()}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] font-medium transition-colors hover:border-brand-orange/40 hover:text-brand-orange disabled:opacity-50"
      >
        <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
        {t("openPassport")}
      </button>
      <button
        type="button"
        onClick={() => void showQr()}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] font-medium transition-colors hover:border-brand-orange/40 hover:text-brand-orange disabled:opacity-50"
      >
        <QrCode className="h-3 w-3" strokeWidth={1.5} />
        {t("showQr")}
      </button>
      {item.productSlug && (
        <Link
          href={`/products/${item.productSlug}`}
          className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] font-medium transition-colors hover:border-brand-orange/40"
        >
          {t("viewProduct")}
        </Link>
      )}
      <PassportQrModal
        open={qrOpen && Boolean(token)}
        onClose={() => setQrOpen(false)}
        url={passportUrl}
        productName={productName}
      />
    </div>
  );
}
