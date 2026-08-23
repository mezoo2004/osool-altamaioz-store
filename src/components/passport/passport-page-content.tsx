"use client";

import {
  ExternalLink,
  MessageCircle,
  Package,
  QrCode,
  RefreshCw,
  Shield,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ProductImagePlaceholder } from "@/components/ui/product-image-placeholder";
import { PassportQrModal } from "@/components/passport/passport-qr-modal";
import { trackEvent } from "@/lib/analytics";
import {
  buildAssistantContextFromPassport,
  openAssistantWithPassport,
} from "@/lib/passport/passport-assistant-bridge";
import { buildPassportAbsoluteUrl } from "@/lib/passport/passport-url";
import type { PassportData, PassportProductCard } from "@/lib/passport/types";

const actionBtnClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3.5 text-sm font-medium text-brand-black-soft transition-all hover:border-brand-orange/40 hover:bg-brand-orange/5 active:scale-[0.99] motion-reduce:active:scale-100";
const actionBtnAccentClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-orange/30 bg-brand-orange/5 px-4 py-3.5 text-sm font-medium text-brand-orange transition-all hover:bg-brand-orange/10 active:scale-[0.99] motion-reduce:active:scale-100";

type PassportPageContentProps = {
  data: PassportData;
  token: string;
};

export function PassportPageContent({ data, token }: PassportPageContentProps) {
  const t = useTranslations("passport");
  const locale = useLocale() as "ar" | "en";
  const [qrOpen, setQrOpen] = useState(false);
  const name = locale === "ar" ? data.nameAr : data.nameEn;
  const variantLabel = locale === "ar" ? data.variantLabelAr : data.variantLabelEn;
  const warrantyText = locale === "ar" ? data.warrantyTextAr : data.warrantyTextEn;
  const installText =
    locale === "ar" ? data.installationInstructionsAr : data.installationInstructionsEn;
  const passportUrl = buildPassportAbsoluteUrl(locale, token);

  useEffect(() => {
    trackEvent("passport_view", {
      passport_kind: data.kind,
      product_slug: data.slug,
    });
  }, [data.kind, data.slug]);

  const handleAskAi = () => {
    trackEvent("passport_ai_click", { product_slug: data.slug });
    openAssistantWithPassport(buildAssistantContextFromPassport(data));
  };

  return (
    <div className="container-page max-w-lg py-6 pb-24 md:py-10 md:pb-12">
      <header className="mb-6 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-orange">
          {t("eyebrow")}
        </p>
        <h1 className="mt-1 text-lg font-semibold text-brand-black-soft">{t("title")}</h1>
      </header>

      <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
        <div className="relative aspect-[4/3] bg-surface-muted">
          {data.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.imageUrl} alt="" className="h-full w-full object-contain p-4" />
          ) : (
            <ProductImagePlaceholder locale={locale} className="h-full w-full" />
          )}
        </div>
        <div className="space-y-2 p-5">
          <h2 className="text-xl font-semibold leading-snug text-brand-black-soft">{name}</h2>
          {variantLabel && <p className="text-sm text-text-secondary">{variantLabel}</p>}
          {data.sku && (
            <p className="text-xs text-meta">
              {t("sku")}: {data.sku}
            </p>
          )}
        </div>
      </section>

      {data.purchase && (
        <section className="mt-4 rounded-2xl border border-border bg-white p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-black-soft">
            <Package className="h-4 w-4 text-brand-orange" strokeWidth={1.5} />
            {t("purchaseContext")}
          </h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">{t("orderNumber")}</dt>
              <dd className="font-medium tabular-nums">{data.purchase.orderNumber}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">{t("purchaseDate")}</dt>
              <dd>
                {new Date(data.purchase.purchaseDate).toLocaleDateString(
                  locale === "ar" ? "ar-SA" : "en-SA",
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">{t("quantity")}</dt>
              <dd className="tabular-nums">{data.purchase.quantity}</dd>
            </div>
          </dl>
        </section>
      )}

      {data.specs.length > 0 && (
        <section className="mt-4 rounded-2xl border border-border bg-white p-5">
          <h3 className="text-sm font-semibold text-brand-black-soft">{t("specs")}</h3>
          <dl className="mt-3 divide-y divide-border">
            {data.specs.map((row) => (
              <div key={row.keyEn} className="flex justify-between gap-4 py-2.5 text-sm">
                <dt className="text-text-secondary">{locale === "ar" ? row.keyAr : row.keyEn}</dt>
                <dd className="text-end font-medium">{locale === "ar" ? row.valueAr : row.valueEn}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-4 rounded-2xl border border-border bg-white p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-black-soft">
          <Wrench className="h-4 w-4 text-brand-orange" strokeWidth={1.5} />
          {t("installation")}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          {installText ?? t("installationFallback")}
        </p>
        <p className="mt-2 text-xs text-meta">{t("installationSafety")}</p>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-white p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-black-soft">
          <Shield className="h-4 w-4 text-brand-orange" strokeWidth={1.5} />
          {t("warranty")}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          {warrantyText?.trim() ? warrantyText : t("warrantyFallback")}
        </p>
      </section>

      <section className="mt-6 space-y-2">
        <h3 className="text-sm font-semibold text-brand-black-soft">{t("smartActions")}</h3>
        <ActionButton icon={<Sparkles className="h-4 w-4" />} onClick={handleAskAi}>
          {t("askAi")}
        </ActionButton>
        {data.replacements.length > 0 && (
          <Link
            href={`/search?q=${encodeURIComponent(data.primaryCategory ?? data.slug)}`}
            onClick={() => trackEvent("passport_replacement_click", { product_slug: data.slug })}
            className={actionBtnClass}
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
            {t("findReplacement")}
          </Link>
        )}
        {data.supportsScene && data.sceneUrl && (
          <Link
            href={data.sceneUrl}
            onClick={() => trackEvent("passport_scene_click", { product_slug: data.slug })}
            className={actionBtnAccentClass}
          >
            <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
            {t("tryInScene")}
          </Link>
        )}
        <button
          type="button"
          onClick={() => {
            trackEvent("passport_qr_open", { product_slug: data.slug });
            setQrOpen(true);
          }}
          className={actionBtnClass}
        >
          <QrCode className="h-4 w-4" strokeWidth={1.5} />
          {t("showQr")}
        </button>
        <Link href={`/products/${data.slug}`} className={actionBtnClass}>
          <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
          {t("viewProduct")}
        </Link>
      </section>

      {data.replacements.length > 0 && (
        <ProductRowSection
          title={t("replacements")}
          products={data.replacements}
          locale={locale}
        />
      )}

      {data.complementary.length > 0 && (
        <ProductRowSection
          title={t("complementary")}
          products={data.complementary}
          locale={locale}
        />
      )}

      <section className="mt-8 rounded-2xl border border-brand-orange/20 bg-brand-orange/5 p-5 text-center">
        <MessageCircle className="mx-auto h-6 w-6 text-brand-orange" strokeWidth={1.5} />
        <p className="mt-2 text-sm font-medium text-brand-black-soft">{t("supportTitle")}</p>
        <p className="mt-1 text-xs text-text-secondary">{t("supportBody")}</p>
        <Link href="/contact" className="btn-cta mt-4 inline-flex text-sm">
          {t("contactSupport")}
        </Link>
      </section>

      <PassportQrModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        url={passportUrl}
        productName={name}
      />
    </div>
  );
}

function ActionButton({
  children,
  icon,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={actionBtnClass}>
      {icon}
      {children}
    </button>
  );
}

function ProductRowSection({
  title,
  products,
  locale,
}: {
  title: string;
  products: PassportProductCard[];
  locale: "ar" | "en";
}) {
  return (
    <section className="mt-6">
      <h3 className="mb-3 text-sm font-semibold text-brand-black-soft">{title}</h3>
      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.slug}>
            <Link
              href={p.productUrl}
              className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 transition-colors hover:border-brand-orange/30"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ProductImagePlaceholder locale={locale} className="h-full w-full" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium">
                  {locale === "ar" ? p.nameAr : p.nameEn}
                </p>
                {p.keySpec && <p className="text-[10px] text-meta">{p.keySpec}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
