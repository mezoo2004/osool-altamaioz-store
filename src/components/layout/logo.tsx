import { OsoolLogo, type OsoolLogoSize } from "@/components/brand/osool-logo";

type LogoProps = {
  locale: "ar" | "en";
  className?: string;
  compact?: boolean;
};

/** Storefront header logo — official Osool assets. */
export function Logo({ locale, className, compact = false }: LogoProps) {
  const size: OsoolLogoSize = compact ? "headerCompact" : "header";
  return (
    <OsoolLogo
      locale={locale}
      tone="dark"
      presentation="full"
      size={size}
      className={className}
      priority
    />
  );
}
