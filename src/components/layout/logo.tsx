import { brand } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type LogoProps = {
  locale: "ar" | "en";
  className?: string;
  compact?: boolean;
};

export function Logo({ locale, className, compact = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex flex-col leading-none", className)}
      aria-label={brand[locale]}
    >
      <span
        className={cn(
          "font-semibold tracking-tight text-brand-black-soft transition-colors group-hover:text-brand-orange",
          compact ? "truncate text-[15px] md:text-base" : "text-lg md:text-xl",
        )}
      >
        {brand[locale]}
      </span>
      {!compact && (
        <span className="mt-0.5 text-[9px] uppercase tracking-[0.24em] text-text-secondary">
          {locale === "ar" ? "Lighting Store" : "Premium Lighting"}
        </span>
      )}
    </Link>
  );
}
