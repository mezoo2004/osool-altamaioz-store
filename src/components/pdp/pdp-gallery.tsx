"use client";

import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductImagePlaceholder } from "@/components/ui/product-image-placeholder";
import { cn } from "@/lib/utils";

type PdpGalleryProps = {
  images: (string | null)[];
  name: string;
  locale: string;
  categorySlugs: string[];
  productType: string;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
};

export function PdpGallery({
  images,
  name,
  locale,
  categorySlugs,
  productType,
  activeIndex,
  onActiveIndexChange,
}: PdpGalleryProps) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const hasMultiple = images.filter(Boolean).length > 1;

  const go = useCallback(
    (delta: number) => {
      if (images.length <= 1) return;
      onActiveIndexChange((activeIndex + delta + images.length) % images.length);
    },
    [activeIndex, images.length, onActiveIndexChange],
  );

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomOpen(false);
      if (e.key === "ArrowLeft") go(locale === "ar" ? 1 : -1);
      if (e.key === "ArrowRight") go(locale === "ar" ? -1 : 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOpen, go, locale]);

  const active = images[activeIndex] ?? null;

  return (
    <div className="space-y-3">
      <div
        className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-surface-muted md:aspect-square"
        onTouchStart={(e) => {
          touchStartX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null || images.length <= 1) return;
          const dx = e.changedTouches[0]?.clientX - touchStartX.current;
          if (Math.abs(dx) < 40) return;
          go(dx > 0 ? (locale === "ar" ? 1 : -1) : locale === "ar" ? -1 : 1);
          touchStartX.current = null;
        }}
      >
        {active ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={active} alt={name} className="h-full w-full object-contain p-4 md:object-cover md:p-0" />
        ) : (
          <ProductImagePlaceholder
            locale={locale}
            categorySlugs={categorySlugs}
            productType={productType}
            className="h-full w-full"
          />
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => go(locale === "ar" ? 1 : -1)}
              className="absolute start-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-black-soft shadow-sm transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100"
              aria-label={locale === "ar" ? "السابق" : "Previous"}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(locale === "ar" ? -1 : 1)}
              className="absolute end-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-black-soft shadow-sm transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100"
              aria-label={locale === "ar" ? "التالي" : "Next"}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {active && (
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="absolute bottom-3 end-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-brand-black-soft shadow-sm"
            aria-label={locale === "ar" ? "تكبير" : "Zoom"}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        )}
      </div>

      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={`${img ?? "empty"}-${i}`}
              type="button"
              onClick={() => onActiveIndexChange(i)}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                i === activeIndex ? "border-brand-black-soft" : "border-border hover:border-brand-gray",
              )}
            >
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-surface-muted text-[10px] text-text-secondary">
                  —
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {zoomOpen && active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active}
            alt={name}
            className="max-h-[90vh] max-w-[92vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
