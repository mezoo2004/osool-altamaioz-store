"use client";

import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HomeImage } from "@/components/home/home-image";
import { homeImages } from "@/lib/home/home-images";
import type { PromoCampaign } from "@/lib/promo/promo-campaign";
import { cn } from "@/lib/utils";

type PromoCardProps = {
  campaign: PromoCampaign;
  className?: string;
  compact?: boolean;
};

export function PromoCard({ campaign, className, compact }: PromoCardProps) {
  const locale = useLocale() as "ar" | "en";
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowUpLeft : ArrowUpRight;
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-sm border border-white/10 bg-[#101010] text-white shadow-[0_24px_60px_rgba(0,0,0,0.35)]",
        compact ? "min-h-[12rem]" : "min-h-[14rem] lg:min-h-[16rem]",
        className,
      )}
    >
      <div className="relative h-28 shrink-0 overflow-hidden sm:h-32 lg:h-36">
        <HomeImage
          entry={homeImages.hero}
          alt=""
          fill
          className="transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width: 1024px) 100vw, 320px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/40 to-transparent" />
        {campaign.badge ? (
          <span className="absolute start-3 top-3 rounded-sm bg-white/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white/80 ring-1 ring-white/15 backdrop-blur-sm">
            {campaign.badge}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4 lg:p-5">
        <p className="home-eyebrow mb-2 text-[10px] text-brand-orange">{isAr ? campaign.eyebrowAr : campaign.eyebrowEn}</p>
        <h2 className="text-base font-semibold leading-snug tracking-tight text-white lg:text-lg">
          {isAr ? campaign.titleAr : campaign.titleEn}
        </h2>
        <p className="mt-2 flex-1 text-[13px] leading-relaxed text-white/62">
          {isAr ? campaign.descriptionAr : campaign.descriptionEn}
        </p>
        <Link
          href={campaign.href}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-orange transition-colors hover:text-white"
        >
          {isAr ? campaign.ctaAr : campaign.ctaEn}
          <Arrow className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
