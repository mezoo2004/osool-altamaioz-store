"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { generatePassportQrDataUrl } from "@/lib/passport/qr-generator";

type PassportQrModalProps = {
  open: boolean;
  onClose: () => void;
  url: string;
  productName: string;
};

export function PassportQrModal({ open, onClose, url, productName }: PassportQrModalProps) {
  const t = useTranslations("passport");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setQrDataUrl(null);
      return;
    }
    void generatePassportQrDataUrl(url).then(setQrDataUrl);
  }, [open, url]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("showQr")}
        className="fixed inset-x-4 top-1/2 z-[71] mx-auto max-w-sm -translate-y-1/2 rounded-2xl border border-border bg-white p-5 shadow-2xl md:inset-x-auto"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-brand-black-soft">{t("qrTitle")}</h3>
            <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">{productName}</p>
          </div>
          <button type="button" onClick={onClose} className="icon-btn-premium h-8 w-8" aria-label={t("close")}>
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
        <div className="mt-4 flex justify-center rounded-xl border border-border bg-white p-4">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="" className="h-56 w-56" />
          ) : (
            <div className="flex h-56 w-56 items-center justify-center">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-text-secondary">{t("qrHint")}</p>
        <p className="mt-2 break-all text-center text-[10px] text-meta">{url}</p>
      </div>
    </>
  );
}
