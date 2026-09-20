import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { brand } from "@/i18n/routing";
import {
  resolveOsoolLogoSrc,
  type OsoolLogoPresentation,
  type OsoolLogoTone,
} from "@/lib/brand/logo-assets";
import { cn } from "@/lib/utils";

export type OsoolLogoSize = "header" | "headerCompact" | "footer" | "auth" | "assistant" | "checkout";

const sizeMap: Record<
  OsoolLogoSize,
  { ar: { width: number; height: number }; en: { width: number; height: number } }
> = {
  header: { ar: { width: 132, height: 52 }, en: { width: 36, height: 36 } },
  headerCompact: { ar: { width: 108, height: 44 }, en: { width: 32, height: 32 } },
  footer: { ar: { width: 168, height: 64 }, en: { width: 44, height: 44 } },
  auth: { ar: { width: 148, height: 56 }, en: { width: 40, height: 40 } },
  assistant: { ar: { width: 28, height: 28 }, en: { width: 28, height: 28 } },
  checkout: { ar: { width: 120, height: 44 }, en: { width: 32, height: 32 } },
};

type OsoolLogoProps = {
  locale: "ar" | "en";
  tone?: OsoolLogoTone;
  presentation?: OsoolLogoPresentation;
  size?: OsoolLogoSize;
  className?: string;
  href?: string | false;
  priority?: boolean;
  onClick?: () => void;
};

export function OsoolLogo({
  locale,
  tone = "dark",
  presentation = "full",
  size = "header",
  className,
  href = "/",
  priority = false,
  onClick,
}: OsoolLogoProps) {
  const dims = sizeMap[size][locale];
  const src = resolveOsoolLogoSrc(locale, tone, presentation);
  const label = brand[locale];

  const image = (
    <Image
      src={src}
      alt={label}
      width={dims.width}
      height={dims.height}
      priority={priority}
      className={cn("h-auto w-auto max-w-full object-contain object-start", className)}
      style={{ width: dims.width, height: "auto", maxHeight: dims.height }}
    />
  );

  if (href === false) {
    return <span className={cn("inline-flex shrink-0 items-center", className)}>{image}</span>;
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("inline-flex shrink-0 items-center transition-opacity hover:opacity-90", className)}
      aria-label={label}
    >
      {image}
    </Link>
  );
}
