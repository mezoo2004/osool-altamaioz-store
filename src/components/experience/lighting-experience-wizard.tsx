"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/components/commerce/cart-provider";
import { ProductGrid } from "@/components/catalog/product-card";
import { HomeImage } from "@/components/home/home-image";
import { ExperienceBreadcrumb } from "@/components/experience/experience-breadcrumb";
import { getPriceDisplay, getProductName } from "@/lib/catalog/display";
import type { Product } from "@/lib/catalog/types";
import { trackEvent } from "@/lib/analytics";
import { designTokens } from "@/lib/design-tokens";
import type {
  BrightnessPreference,
  CctChoice,
  InteriorStyle,
  LightingRecommendationResult,
  MoodId,
  NaturalLightLevel,
  SpaceRecord,
  WallColorTone,
} from "@/lib/experience/types";
import { buildDesignerSceneHandoffUrl } from "@/lib/experience/lighting-designer-handoff";
import { saveLightingRecommendation } from "@/lib/experience/lighting-designer-storage";
import { WALL_SWATCH_HEX } from "@/lib/experience/lighting-designer-constants";
import { getSpaceImageEntry } from "@/lib/experience/space-images";
import { cn } from "@/lib/utils";

const MOODS: MoodId[] = [
  "warm", "luxury", "modern", "relaxed", "minimal", "hotel", "dramatic", "functional",
];

const CCTS: CctChoice[] = ["3000K", "4000K", "6500K"];

const WALL_COLORS: WallColorTone[] = [
  "very_light",
  "beige",
  "light_gray",
  "dark_gray",
  "warm_tones",
  "unsure",
];

const INTERIOR_STYLES: InteriorStyle[] = ["light", "balanced", "dark"];
const NATURAL_LIGHT: NaturalLightLevel[] = ["low", "medium", "high"];
const BRIGHTNESS_PREFS: BrightnessPreference[] = ["soft", "standard", "bright"];

type LightingExperienceWizardProps = {
  spaces: SpaceRecord[];
  locale: string;
};

type Step = 1 | 2 | 3 | 4 | 5;

export function LightingExperienceWizard({ spaces, locale }: LightingExperienceWizardProps) {
  const t = useTranslations("experiences");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { mergeLines } = useCart();
  const brand = locale === "ar" ? "اصول التميز" : "Osool Altamaioz";

  const [step, setStep] = useState<Step>(1);
  const [spaceSlug, setSpaceSlug] = useState<string>("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [mood, setMood] = useState<MoodId | "">("");
  const [wallColor, setWallColor] = useState<WallColorTone>("unsure");
  const [ceilingColor, setCeilingColor] = useState<WallColorTone | "">("");
  const [interiorStyle, setInteriorStyle] = useState<InteriorStyle>("balanced");
  const [naturalLight, setNaturalLight] = useState<NaturalLightLevel>("medium");
  const [brightnessPreference, setBrightnessPreference] = useState<BrightnessPreference>("standard");
  const [cct, setCct] = useState<CctChoice | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<LightingRecommendationResult | null>(null);
  const [resultProducts, setResultProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    trackEvent("lighting_experience_start");
    const initialSpace = searchParams.get("space");
    if (initialSpace && spaces.some((s) => s.slug === initialSpace)) {
      setSpaceSlug(initialSpace);
    }
    const l = searchParams.get("length");
    const w = searchParams.get("width");
    const h = searchParams.get("height");
    if (l) setLength(l);
    if (w) setWidth(w);
    if (h) setHeight(h);
    const moodParam = searchParams.get("mood") as MoodId | null;
    if (moodParam && MOODS.includes(moodParam)) setMood(moodParam);
    const wallParam = searchParams.get("wallColor") as WallColorTone | null;
    if (wallParam && WALL_COLORS.includes(wallParam)) setWallColor(wallParam);
    const cctParam = searchParams.get("cct") as CctChoice | null;
    if (cctParam && CCTS.includes(cctParam)) setCct(cctParam);
    const stepParam = searchParams.get("step");
    if (stepParam) {
      const n = parseInt(stepParam, 10);
      if (n >= 1 && n <= 5) setStep(n as Step);
    }
  }, [searchParams, spaces]);

  const syncUrl = useCallback(
    (partial: {
      space?: string;
      length?: string;
      width?: string;
      height?: string;
      mood?: string;
      wallColor?: string;
      cct?: string;
      step?: number;
    }) => {
      const params = new URLSearchParams();
      if (partial.space ?? spaceSlug) params.set("space", partial.space ?? spaceSlug);
      if (partial.length ?? length) params.set("length", partial.length ?? length);
      if (partial.width ?? width) params.set("width", partial.width ?? width);
      if (partial.height ?? height) params.set("height", partial.height ?? height);
      if (partial.mood ?? mood) params.set("mood", partial.mood ?? mood);
      if (partial.wallColor ?? wallColor) params.set("wallColor", partial.wallColor ?? wallColor);
      if (partial.cct ?? cct) params.set("cct", partial.cct ?? cct);
      if (partial.step ?? step) params.set("step", String(partial.step ?? step));
      router.replace(`/lighting-experience?${params.toString()}`, { scroll: false });
    },
    [spaceSlug, length, width, height, mood, wallColor, cct, step, router],
  );

  const selectedSpace = spaces.find((s) => s.slug === spaceSlug);

  const validateStep = (current: Step): boolean => {
    const nextErrors: Record<string, string> = {};
    if (current === 1 && !spaceSlug) nextErrors.space = t("errorSpaceRequired");
    if (current === 2) {
      const l = parseFloat(length);
      const w = parseFloat(width);
      const h = parseFloat(height);
      if (!length || Number.isNaN(l) || l <= 0 || l > 100) nextErrors.length = t("errorInvalidDimension");
      else if (l < 0.5) nextErrors.length = t("errorDimension");
      if (!width || Number.isNaN(w) || w <= 0 || w > 100) nextErrors.width = t("errorInvalidDimension");
      else if (w < 0.5) nextErrors.width = t("errorDimension");
      if (!height || Number.isNaN(h) || h <= 0 || h > 12) nextErrors.height = t("errorInvalidDimension");
      else if (h < 2) nextErrors.height = t("errorHeight");
      if (l > 0 && w > 0 && l * w > 800) nextErrors.area = t("errorAreaTooLarge");
    }
    if (current === 3 && !mood) nextErrors.mood = t("errorMoodRequired");
    if (current === 4 && !cct) nextErrors.cct = t("errorCctRequired");
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = async () => {
    if (!validateStep(step)) return;

    if (step === 1) {
      trackEvent("lighting_experience_space", { space_slug: spaceSlug });
      syncUrl({ step: 2 });
      setStep(2);
      return;
    }
    if (step === 2) {
      trackEvent("lighting_experience_dimensions", {
        length: parseFloat(length),
        width: parseFloat(width),
        height: parseFloat(height),
      });
      syncUrl({ step: 3 });
      setStep(3);
      return;
    }
    if (step === 3) {
      trackEvent("lighting_experience_mood", { mood: mood as string });
      syncUrl({ step: 4 });
      setStep(4);
      return;
    }
    if (step === 4) {
      trackEvent("lighting_experience_cct", { cct: cct as string });
      setLoading(true);
      try {
        const res = await fetch("/api/experience/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            spaceSlug,
            length: parseFloat(length),
            width: parseFloat(width),
            height: parseFloat(height),
            mood,
            cct,
            wallColor,
            ceilingColor: ceilingColor || undefined,
            interiorStyle,
            naturalLight,
            brightnessPreference,
          }),
        });
        const recommendation = (await res.json()) as LightingRecommendationResult;

        const productRes = await fetch("/api/products/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slugs: recommendation.items.map((i) => i.productSlug) }),
        });
        const { products } = (await productRes.json()) as { products: Product[] };

        const qtyMap: Record<string, number> = {};
        for (const item of recommendation.items) {
          qtyMap[item.productSlug] = item.quantity;
        }
        setQuantities(qtyMap);
        setResult(recommendation);
        setResultProducts(products ?? []);
        saveLightingRecommendation(recommendation);
        trackEvent("lighting_experience_complete", { space_slug: spaceSlug });
        syncUrl({ step: 5 });
        setStep(5);
      } finally {
        setLoading(false);
      }
    }
  };

  const goBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleAddBundle = () => {
    if (!result) return;
    const lines = result.items
      .map((item) => {
        const product = resultProducts.find((p) => p.slug === item.productSlug);
        if (!product) return null;
        const variant = product.variants.find((v) => v.id === item.variantId) ?? product.variants[0];
        if (!variant || variant.stockStatus === "OUT_OF_STOCK") return null;
        return {
          productId: product.id,
          productSlug: product.slug,
          variantId: variant.id,
          variantSku: variant.sku,
          quantity: quantities[item.productSlug] ?? item.quantity,
        };
      })
      .filter(Boolean) as Array<{
      productId: string;
      productSlug: string;
      variantId: string;
      variantSku: string;
      quantity: number;
    }>;

    if (lines.length > 0) {
      mergeLines(lines);
      trackEvent("lighting_experience_add_bundle", { item_count: lines.length });
    }
  };

  const cctPreviewStyle = useMemo(() => {
    if (!cct) return {};
    const hex = designTokens.cct[cct]?.hex ?? "#FFF4E0";
    return { background: `linear-gradient(135deg, ${hex}, #f7f6f5)` };
  }, [cct]);

  return (
    <div className="md:pb-20">
      <section className="border-b border-border bg-surface-muted">
        <div className="container-page py-8 md:py-10">
          <ExperienceBreadcrumb items={[{ label: brand, href: "/" }, { label: t("experienceTitle") }]} />
          <h1 className="heading-section">{t("experienceTitle")}</h1>
          <p className="mt-2 max-w-2xl text-meta">{t("experienceSubtitle")}</p>

          <ol className="mt-8 flex items-center gap-0 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={t("progressLabel")}>
            {[1, 2, 3, 4, 5].map((n, i) => (
              <li key={n} className="flex items-center">
                <div
                  className={cn(
                    "flex min-w-[4.5rem] flex-col items-center gap-1.5 text-xs",
                    step === n ? "text-brand-black-soft" : step > n ? "text-text-primary" : "text-text-secondary",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold tabular-nums transition-colors",
                      step > n
                        ? "border-brand-black-soft bg-brand-black-soft text-white"
                        : step === n
                          ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                          : "border-border bg-white",
                    )}
                    aria-current={step === n ? "step" : undefined}
                  >
                    {n}
                  </span>
                  <span className="hidden max-w-[5rem] text-center leading-tight sm:block">
                    {t(`step${n}Label` as "step1Label")}
                  </span>
                </div>
                {i < 4 && (
                  <div
                    className={cn("mx-1 h-px w-6 sm:w-10", step > n ? "bg-brand-black-soft" : "bg-border")}
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="container-page py-10 md:py-14">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="heading-subsection">{t("step1Title")}</h2>
            {errors.space && <p className="text-sm text-brand-orange">{errors.space}</p>}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {spaces.map((space) => (
                <button
                  key={space.id}
                  type="button"
                  onClick={() => {
                    setSpaceSlug(space.slug);
                    syncUrl({ space: space.slug });
                  }}
                  className={cn(
                    "group card-surface overflow-hidden text-start transition-colors",
                    spaceSlug === space.slug
                      ? "border-brand-black-soft ring-1 ring-brand-black-soft"
                      : "hover:border-brand-gray/50",
                  )}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
                    <HomeImage
                      entry={getSpaceImageEntry(space.slug)}
                      alt={locale === "ar" ? space.nameAr : space.nameEn}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden="true" />
                  </div>
                  <div className="p-3.5">
                    <p className="text-sm font-medium">{locale === "ar" ? space.nameAr : space.nameEn}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mx-auto max-w-xl space-y-6">
            <h2 className="heading-subsection">{t("step2Title")}</h2>
            <p className="text-meta">{t("step2Hint")}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["length", length, setLength, errors.length],
                  ["width", width, setWidth, errors.width],
                  ["height", height, setHeight, errors.height],
                ] as const
              ).map(([key, value, setter, error]) => (
                <div key={key}>
                  <label htmlFor={key} className="mb-1.5 block text-sm font-medium">{t(key as "length")}</label>
                  <input
                    id={key}
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="input-field"
                    placeholder="0.0"
                  />
                  <span className="mt-1 block text-meta">{t("meters")}</span>
                  {error && <p className="mt-1 text-xs text-brand-orange">{error}</p>}
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t border-border pt-6">
              <h3 className="text-sm font-semibold">{t("wallColorTitle")}</h3>
              <p className="text-meta">{t("wallColorHint")}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {WALL_COLORS.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => {
                      setWallColor(tone);
                      syncUrl({ wallColor: tone });
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-3 text-start text-sm transition-colors motion-reduce:transition-none",
                      wallColor === tone
                        ? "border-brand-orange bg-brand-orange/5 ring-1 ring-brand-orange/30"
                        : "border-border bg-white hover:border-brand-gray",
                    )}
                  >
                    <span
                      className="h-8 w-8 shrink-0 rounded-md border border-black/10 shadow-inner"
                      style={{ backgroundColor: WALL_SWATCH_HEX[tone] }}
                      aria-hidden="true"
                    />
                    {t(`wall_${tone}` as "wall_unsure")}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3 border-t border-border pt-6">
              <h3 className="text-sm font-semibold">{t("ceilingColorTitle")}</h3>
              <p className="text-meta">{t("ceilingColorHint")}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCeilingColor("")}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs transition-colors",
                    !ceilingColor ? "border-brand-orange bg-brand-orange/5" : "border-border bg-white",
                  )}
                >
                  {locale === "ar" ? "مثل الجدران" : "Same as walls"}
                </button>
                {WALL_COLORS.filter((t) => t !== "unsure").map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setCeilingColor(tone)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs transition-colors",
                      ceilingColor === tone ? "border-brand-orange bg-brand-orange/5" : "border-border bg-white",
                    )}
                  >
                    <span
                      className="h-5 w-5 rounded border border-black/10"
                      style={{ backgroundColor: WALL_SWATCH_HEX[tone] }}
                      aria-hidden="true"
                    />
                    {t(`wall_${tone}` as "wall_unsure")}
                  </button>
                ))}
              </div>
            </div>
            {errors.area && <p className="text-sm text-brand-orange">{errors.area}</p>}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="heading-subsection">{t("step3Title")}</h2>
            {errors.mood && <p className="text-sm text-brand-orange">{errors.mood}</p>}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMood(m);
                    syncUrl({ mood: m });
                  }}
                  className={cn(
                    "rounded-lg border px-4 py-5 text-center transition-colors motion-reduce:transition-none",
                    mood === m
                      ? "border-brand-black-soft bg-brand-black-soft/5 ring-1 ring-brand-black-soft"
                      : "border-border bg-white hover:border-brand-gray",
                  )}
                >
                  <span className="text-sm font-medium">{t(`mood_${m}` as "mood_warm")}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <h2 className="heading-subsection">{t("step4Title")}</h2>
                {errors.cct && <p className="text-sm text-brand-orange">{errors.cct}</p>}
                <div className="grid gap-3">
                  {CCTS.map((k) => {
                    const label = designTokens.cct[k];
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => {
                          setCct(k);
                          syncUrl({ cct: k });
                        }}
                        className={cn(
                          "flex items-center gap-4 rounded-lg border px-4 py-3.5 text-start transition-colors motion-reduce:transition-none",
                          cct === k
                            ? "border-brand-black-soft bg-brand-black-soft/5 ring-1 ring-brand-black-soft"
                            : "border-border bg-white hover:border-brand-gray",
                        )}
                      >
                        <span
                          className="h-9 w-9 shrink-0 rounded-full border border-black/10 shadow-inner"
                          style={{ backgroundColor: label.hex }}
                          aria-hidden="true"
                        />
                        <span>
                          <span className="block text-sm font-semibold tabular-nums">{k}</span>
                          <span className="text-meta">{locale === "ar" ? label.ar : label.en}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div
                className="overflow-hidden rounded-xl border border-border transition-colors duration-500 motion-reduce:transition-none"
                style={cctPreviewStyle}
              >
                <div className="flex aspect-[4/3] items-end p-5">
                  <p className="rounded-lg bg-white/85 px-4 py-2.5 text-sm backdrop-blur">{t("cctPreviewHint")}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 border-t border-border pt-8 md:grid-cols-3">
              <PreferenceGroup
                title={t("interiorStyleTitle")}
                options={INTERIOR_STYLES.map((s) => ({
                  id: s,
                  label: t(`interiorStyle_${s}` as "interiorStyle_balanced"),
                }))}
                value={interiorStyle}
                onChange={(v) => setInteriorStyle(v as InteriorStyle)}
              />
              <PreferenceGroup
                title={t("naturalLightTitle")}
                options={NATURAL_LIGHT.map((s) => ({
                  id: s,
                  label: t(`naturalLight_${s}` as "naturalLight_medium"),
                }))}
                value={naturalLight}
                onChange={(v) => setNaturalLight(v as NaturalLightLevel)}
              />
              <PreferenceGroup
                title={t("brightnessTitle")}
                options={BRIGHTNESS_PREFS.map((s) => ({
                  id: s,
                  label: t(`brightness_${s}` as "brightness_standard"),
                }))}
                value={brightnessPreference}
                onChange={(v) => setBrightnessPreference(v as BrightnessPreference)}
              />
            </div>
          </div>
        )}

        {step === 5 && result && (
          <div className="space-y-8">
            <div className="card-surface overflow-hidden p-0">
              <div className="border-b border-border bg-gradient-to-br from-brand-orange/5 to-surface-muted px-5 py-6 md:px-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="heading-subsection">{t("step5Title")}</h2>
                    <p className="mt-2 max-w-2xl text-text-secondary">
                      {locale === "ar" ? result.explanationAr : result.explanationEn}
                    </p>
                  </div>
                  <ConfidenceBadge level={result.confidence} label={t(`confidence_${result.confidence}` as "confidence_HIGH")} />
                </div>
              </div>

              <div className="space-y-6 p-5 md:p-8">
                <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <SummaryItem label={t("step1Label")} value={selectedSpace ? (locale === "ar" ? selectedSpace.nameAr : selectedSpace.nameEn) : "—"} />
                  <SummaryItem label={t("dimensionsSummary")} value={`${length} × ${width} × ${height} ${t("meters")}`} />
                  <SummaryItem label={t("wallColorTitle")} value={t(`wall_${result.wallColor}` as "wall_unsure")} />
                  <SummaryItem label={t("step4Label")} value={cct || "—"} />
                  <SummaryItem label={t("step3Label")} value={mood ? t(`mood_${mood}` as "mood_warm") : "—"} />
                  <SummaryItem label={t("volume")} value={`${result.calculation.volume.toFixed(0)} m³`} />
                  <SummaryItem label={t("estimatedLux")} value={`~${result.calculation.targetLux} lux`} />
                  <SummaryItem label={t("requiredLumens")} value={`~${result.calculation.requiredLumens.toLocaleString()} lm`} />
                </dl>

                {result.approach && (
                  <div className="rounded-lg border border-border bg-surface-muted p-4 text-sm">
                    <p className="font-medium">{t("approachTitle")}</p>
                    <p className="mt-1 text-text-secondary">
                      {locale === "ar" ? result.approach.wallImpactAr : result.approach.wallImpactEn}
                    </p>
                    <p className="mt-2 text-meta">
                      {locale === "ar" ? result.calculation.formulaDescriptionAr : result.calculation.formulaDescriptionEn}
                    </p>
                  </div>
                )}

                {result.layers.length > 0 && (
                  <div>
                    <h3 className="font-semibold">{t("layersTitle")}</h3>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {result.layers.map((layer) => (
                        <div key={layer.layer} className="rounded-lg border border-border bg-white px-4 py-3 text-sm">
                          <p className="font-medium">
                            {t(`layer_${layer.layer}` as "layer_general")} · ×{layer.quantity}
                          </p>
                          <p className="mt-1 text-meta">{locale === "ar" ? layer.reasonAr : layer.reasonEn}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.layout && (
                  <div className="rounded-lg border border-dashed border-brand-orange/30 bg-brand-orange/[0.03] p-4 text-sm">
                    <h3 className="font-semibold">{t("layoutTitle")}</h3>
                    <p className="mt-2 text-text-secondary">
                      {locale === "ar" ? result.layout.notesAr : result.layout.notesEn}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-meta">
                      <span>{t("layoutSpacing")}: ~{result.layout.spacingM} {t("meters")}</span>
                      <span>{t("layoutWallOffset")}: ~{result.layout.wallOffsetM} {t("meters")}</span>
                    </div>
                  </div>
                )}

                {(locale === "ar" ? result.explanationsAr : result.explanationsEn).length > 0 && (
                  <div>
                    <h3 className="font-semibold">{t("explanationsTitle")}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                      {(locale === "ar" ? result.explanationsAr : result.explanationsEn).map((line, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-brand-orange" aria-hidden="true">•</span>
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.confidence !== "HIGH" && (
                  <p className="text-sm text-meta">{t("missingDataNote")}</p>
                )}
              </div>
            </div>

            {result.categories.length > 0 && (
              <div>
                <h3 className="font-semibold">{t("recommendedCategories")}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.categories.map((cat) => (
                    <Link key={cat.slug} href={`/categories/${cat.slug}`} className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm hover:border-brand-black-soft">
                      {locale === "ar" ? cat.nameAr : cat.nameEn}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {resultProducts.length > 0 && (
              <div>
                <h3 className="mb-4 font-semibold">{t("recommendedProducts")}</h3>
                <ProductGrid products={resultProducts} locale={locale} />
                <div className="mt-6 space-y-2">
                  {result.items.map((item) => {
                    const product = resultProducts.find((p) => p.slug === item.productSlug);
                    if (!product) return null;
                    const variant = product.variants.find((v) => v.id === item.variantId) ?? product.variants[0];
                    const price = getPriceDisplay(product, variant ?? undefined, locale);
                    return (
                      <div key={`${item.productSlug}-${item.layer}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {item.layer && (
                              <span className="rounded bg-brand-orange/10 px-2 py-0.5 text-xs font-medium text-brand-orange">
                                {t(`layer_${item.layer}` as "layer_general")}
                              </span>
                            )}
                            <p className="font-medium">{getProductName(product, locale)}</p>
                          </div>
                          <p className="text-meta">{price.text}</p>
                          <p className="mt-1 text-xs text-text-secondary">
                            {locale === "ar" ? item.reasonAr : item.reasonEn} · ×{quantities[item.productSlug] ?? item.quantity}
                          </p>
                          {item.confidence === "LOW" && (
                            <p className="mt-1 text-xs text-meta">
                              {locale === "ar" ? item.confidenceNoteAr : item.confidenceNoteEn}
                            </p>
                          )}
                        </div>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={quantities[item.productSlug] ?? item.quantity}
                          onChange={(e) =>
                            setQuantities((prev) => ({
                              ...prev,
                              [item.productSlug]: Math.max(1, Number(e.target.value) || 1),
                            }))
                          }
                          className="input-field h-9 w-16"
                          aria-label={t("quantity")}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm text-text-secondary">{t("disclaimer")}</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={handleAddBundle} className="btn-cta">{t("addLightingSetup")}</button>
              {selectedSpace && (
                <Link
                  href={buildDesignerSceneHandoffUrl({
                    result,
                    sceneIds: selectedSpace.sceneIds,
                    spaceSlug: selectedSpace.slug,
                  })}
                  className="btn-cta-secondary inline-flex items-center justify-center"
                >
                  {t("tryInShopScene")}
                </Link>
              )}
            </div>
          </div>
        )}

        {step < 5 && (
          <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-8">
            {step > 1 && (
              <button type="button" onClick={goBack} className="btn-cta-secondary">{t("back")}</button>
            )}
            <button type="button" onClick={goNext} disabled={loading} className="btn-cta bg-brand-black-soft hover:bg-brand-black">
              {loading ? tCommon("loading") : step === 4 ? t("generateRecommendation") : t("next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted px-3 py-2.5">
      <dt className="text-meta">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function ConfidenceBadge({ level, label }: { level: string; label: string }) {
  const colors =
    level === "HIGH"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : level === "MEDIUM"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-orange-200 bg-orange-50 text-orange-800";
  return (
    <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide", colors)}>
      {label}
    </span>
  );
}

function PreferenceGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs transition-colors",
              value === opt.id
                ? "border-brand-black-soft bg-brand-black-soft/5 ring-1 ring-brand-black-soft"
                : "border-border bg-white hover:border-brand-gray",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
