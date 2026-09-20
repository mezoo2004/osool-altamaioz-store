import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { brand } from "@/i18n/routing";
import {
  resolveOsoolMarkSrc,
  type OsoolLogoSurface,
} from "@/lib/brand/logo-assets";
import { cn } from "@/lib/utils";

export type OsoolLogoSize = "header" | "headerCompact" | "footer" | "auth" | "assistant" | "checkout";

/** Logo height in px — width follows aspect ratio via object-contain. */
const heightMap: Record<OsoolLogoSize, number> = {
  header: 40,
  headerCompact: 32,
  footer: 44,
  auth: 40,
  assistant: 28,
  checkout: 36,
};

type OsoolLogoProps = {
  locale: "ar" | "en";
  /** Background surface the logo sits on (not the mark color). */
  surface?: OsoolLogoSurface;
  /** @deprecated Use `surface`. */
  tone?: OsoolLogoSurface;
  size?: OsoolLogoSize;
  className?: string;
  href?: string | false;
  priority?: boolean;
  onClick?: () => void;
};

export function OsoolLogo({
  locale,
  surface,
  tone,
  size = "header",
  className,
  href = "/",
  priority = false,
  onClick,
}: OsoolLogoProps) {
  const resolvedSurface = surface ?? tone ?? "light";
  const height = heightMap[size];
  const src = resolveOsoolMarkSrc(resolvedSurface);
  const label = brand[locale];

  const image = (
    <Image
      src={src}
      alt=""
      width={height}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto shrink-0 object-contain object-center", className)}
      style={{ height, width: "auto", maxWidth: height * 1.35 }}
    />
  );

  if (href === false) {
    return (
      <span className={cn("inline-flex shrink-0 items-center", className)} aria-hidden="true">
        {image}
      </span>
    );
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
