import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function HomeSectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  inverse = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("mb-7 flex items-end justify-between gap-6 md:mb-9", className)}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p className={cn("home-eyebrow mb-3", inverse && "text-white/50 before:bg-white/30")}>{eyebrow}</p>
        )}
        <h2 className={cn("home-heading-section", inverse && "text-white")}>{title}</h2>
        {subtitle && (
          <p
            className={cn(
              "mt-2.5 max-w-lg leading-relaxed",
              inverse ? "text-white/60" : "text-text-secondary",
            )}
            style={{ fontSize: "clamp(0.875rem, 0.8rem + 0.2vw, 1rem)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function HomeArrowLink({
  href,
  children,
  inverse = false,
}: {
  href: string;
  children: ReactNode;
  inverse?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "home-link-arrow group hidden shrink-0 items-center gap-2 text-sm font-medium md:inline-flex",
        inverse ? "text-white/80 hover:text-white" : "text-brand-black-soft hover:text-brand-orange",
      )}
    >
      <span>{children}</span>
      <ArrowIcon className="transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
    </Link>
  );
}

type HomeButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  showArrow?: boolean;
};

function ButtonInner({ children, showArrow = true }: { children: ReactNode; showArrow?: boolean }) {
  return (
    <>
      <span>{children}</span>
      {showArrow && <ArrowIcon className="home-btn-arrow h-4 w-4 opacity-80 rtl:rotate-180" />}
    </>
  );
}

export function HomeButtonPrimary({ href, children, className, showArrow }: HomeButtonProps) {
  return (
    <Link href={href} className={cn("home-btn home-btn-primary group", className)}>
      <ButtonInner showArrow={showArrow}>{children}</ButtonInner>
    </Link>
  );
}

export function HomeButtonPrimaryDark({ href, children, className, showArrow }: HomeButtonProps) {
  return (
    <Link href={href} className={cn("home-btn home-btn-primary-dark", className)}>
      <ButtonInner showArrow={showArrow}>{children}</ButtonInner>
    </Link>
  );
}

export function HomeButtonOutlineLight({ href, children, className, showArrow }: HomeButtonProps) {
  return (
    <Link href={href} className={cn("home-btn home-btn-outline-light", className)}>
      <ButtonInner showArrow={showArrow}>{children}</ButtonInner>
    </Link>
  );
}

export function HomeButtonSecondary({ href, children, className, showArrow }: HomeButtonProps) {
  return (
    <Link href={href} className={cn("home-btn home-btn-secondary", className)}>
      <ButtonInner showArrow={showArrow}>{children}</ButtonInner>
    </Link>
  );
}

export function HomeButtonAccent({ href, children, className, showArrow }: HomeButtonProps) {
  return (
    <Link href={href} className={cn("home-btn home-btn-accent", className)}>
      <ButtonInner showArrow={showArrow}>{children}</ButtonInner>
    </Link>
  );
}

export function HomeButtonInverse({ href, children, className, showArrow }: HomeButtonProps) {
  return (
    <Link href={href} className={cn("home-btn home-btn-inverse", className)}>
      <ButtonInner showArrow={showArrow}>{children}</ButtonInner>
    </Link>
  );
}

export function SceneHotspot({ className }: { className?: string }) {
  return (
    <span className={cn("home-hotspot", className)} aria-hidden="true">
      <span className="home-hotspot-ring" />
      <span className="home-hotspot-core" />
    </span>
  );
}

const ICON_STROKE = 1.5;

export function CategoryIcon({ type, className }: { type: string; className?: string }) {
  const props = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    className: cn("text-current", className),
    "aria-hidden": true as const,
  };

  switch (type) {
    case "spot":
      return (
        <svg {...props}>
          <path d="M12 4v2M8 20h8M10 14h4v6" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinecap="round" />
          <path d="M9 8h6l-1 6H10L9 8Z" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinejoin="round" />
          <path d="M12 2v2" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinecap="round" />
        </svg>
      );
    case "flood":
      return (
        <svg {...props}>
          <rect x="7" y="14" width="10" height="4" rx="0.5" stroke="currentColor" strokeWidth={ICON_STROKE} />
          <path d="M9 14V9l3-5 3 5v5" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinejoin="round" />
          <path d="M8 9h8" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinecap="round" />
        </svg>
      );
    case "chandelier":
      return (
        <svg {...props}>
          <path d="M12 3v2M7 7h10M6 10h12" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinecap="round" />
          <path d="M9 10v2a3 3 0 0 0 6 0v-2" stroke="currentColor" strokeWidth={ICON_STROKE} />
          <path d="M11 16h2v3h-2v-3Z" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinejoin="round" />
        </svg>
      );
    case "strip":
      return (
        <svg {...props}>
          <path d="M4 11h16v3H4v-3Z" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinejoin="round" />
          <path d="M7 14v3M12 14v3M17 14v3" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinecap="round" />
          <path d="M6 8h12" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinecap="round" strokeDasharray="2 2" />
        </svg>
      );
    case "switch":
      return (
        <svg {...props}>
          <rect x="8" y="3" width="8" height="18" rx="1.5" stroke="currentColor" strokeWidth={ICON_STROKE} />
          <rect x="10" y="6" width="4" height="5" rx="1" stroke="currentColor" strokeWidth={ICON_STROKE} />
        </svg>
      );
    case "fan":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <path d="M12 10V5M12 19v-5M10 12H5M19 12h-5" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinecap="round" />
          <path d="M14.8 9.2 18 6M9.2 14.8 6 18M14.8 14.8 18 18M9.2 9.2 6 6" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinecap="round" />
        </svg>
      );
    case "indoor":
      return (
        <svg {...props}>
          <path d="M4 18V8l8-4 8 4v10" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinejoin="round" />
          <path d="M9 18v-6h6v6" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinejoin="round" />
          <circle cx="12" cy="9" r="1.5" stroke="currentColor" strokeWidth={ICON_STROKE} />
        </svg>
      );
    case "outdoor":
      return (
        <svg {...props}>
          <path d="M12 3v3M8 6h8" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinecap="round" />
          <path d="M9 6v12h6V6" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinejoin="round" />
          <path d="M7 20h10" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinecap="round" />
        </svg>
      );
    case "decorative":
      return (
        <svg {...props}>
          <path d="M12 4v3M8 9h8M7 12h10" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinecap="round" />
          <path d="M10 12v3h4v-3" stroke="currentColor" strokeWidth={ICON_STROKE} />
          <path d="M11 18h2v2h-2v-2Z" stroke="currentColor" strokeWidth={ICON_STROKE} />
        </svg>
      );
    case "offers":
      return (
        <svg {...props}>
          <path d="M12 3 4 7v6l8 4 8-4V7l-8-4Z" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinejoin="round" />
          <path d="M12 11v6M9 9.5 12 11l3-1.5" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <rect x="5" y="5" width="14" height="14" rx="1" stroke="currentColor" strokeWidth={ICON_STROKE} />
        </svg>
      );
  }
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
