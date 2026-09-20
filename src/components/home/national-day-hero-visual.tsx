"use client";

import Image from "next/image";
import { NATIONAL_DAY_HERO_SRC, NATIONAL_DAY_HERO_UNOPTIMIZED } from "@/lib/campaigns/national-day-hero-asset";
import { cn } from "@/lib/utils";

type NationalDayHeroBackdropProps = {
  locale: "ar" | "en";
  priority?: boolean;
};

export function NationalDayHeroBackdrop({ locale, priority = true }: NationalDayHeroBackdropProps) {
  const alt =
    locale === "ar"
      ? "حملة اليوم الوطني — إضاءة فاخرة من اصول التميز"
      : "Saudi National Day — premium Osool Altamaioz lighting campaign";

  return (
    <div className="nd-hero-backdrop pointer-events-none absolute inset-0 overflow-hidden bg-[#082D23]">
      <Image
        src={NATIONAL_DAY_HERO_SRC}
        alt={alt}
        fill
        priority={priority}
        unoptimized={NATIONAL_DAY_HERO_UNOPTIMIZED}
        sizes="100vw"
        className={cn(
          "nd-hero-bg-image object-cover",
          locale === "en" ? "nd-hero-bg-image-en" : "nd-hero-bg-image-ar",
        )}
      />
      <div
        className={cn("nd-hero-scrim absolute inset-0", locale === "en" ? "nd-hero-scrim-en" : "nd-hero-scrim-ar")}
        aria-hidden="true"
      />
      <div className="nd-hero-gradient absolute inset-0 opacity-[0.22]" aria-hidden="true" />
      <div className="nd-hero-ambient-glow absolute inset-0 opacity-90" aria-hidden="true" />
    </div>
  );
}
