import { cn } from "@/lib/utils";

type ProductImagePlaceholderProps = {
  locale: string;
  className?: string;
  label?: string;
};

export function ProductImagePlaceholder({ locale, className, label }: ProductImagePlaceholderProps) {
  const text = label ?? (locale === "ar" ? "صورة قريباً" : "Image coming soon");

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-surface-muted",
        className,
      )}
      role="img"
      aria-label={text}
    >
      <div
        className="absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(8,8,8,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(8,8,8,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative flex flex-col items-center gap-2" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-brand-gray/50">
          <rect x="6" y="10" width="20" height="14" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <path d="M16 6v4M12 8h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="16" cy="17" r="3" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <span className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">{text}</span>
      </div>
    </div>
  );
}
