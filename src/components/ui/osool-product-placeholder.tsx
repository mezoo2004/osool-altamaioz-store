import { cn } from "@/lib/utils";
import type { PlaceholderSilhouette } from "@/lib/catalog/product-placeholder";

type OsoolProductPlaceholderProps = {
  className?: string;
  silhouette?: PlaceholderSilhouette;
  compact?: boolean;
};

function Silhouette({ type }: { type: PlaceholderSilhouette }) {
  const props = {
    viewBox: "0 0 120 120",
    className: "h-full w-full text-brand-black-soft/32",
    fill: "none" as const,
    "aria-hidden": true as const,
  };

  switch (type) {
    case "spotlight":
      return (
        <svg {...props}>
          <path d="M44 92V58c0-5 4-8 10-8h12c6 0 10 3 10 8v34" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M38 92h44" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="60" cy="44" r="9" stroke="currentColor" strokeWidth="1.3" />
          <path d="M60 35V22M52 26h16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <ellipse cx="60" cy="44" rx="13" ry="5.5" stroke="currentColor" strokeWidth="0.9" opacity="0.45" />
        </svg>
      );
    case "pendant":
      return (
        <svg {...props}>
          <path d="M60 18v14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M42 32h36" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M48 32v8c0 8 5 14 12 14s12-6 12-14v-8" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M54 88h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "linear":
      return (
        <svg {...props}>
          <rect x="28" y="52" width="64" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <path d="M36 62v18M60 62v22M84 62v18" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M32 48h56" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="3 3" opacity="0.5" />
        </svg>
      );
    case "outdoor":
      return (
        <svg {...props}>
          <path d="M52 88V54l8-18h0l8 18v34" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M44 88h32" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M38 54h44" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <ellipse cx="60" cy="38" rx="16" ry="7" stroke="currentColor" strokeWidth="0.9" opacity="0.4" />
        </svg>
      );
    case "switch":
      return (
        <svg {...props}>
          <rect x="46" y="24" width="28" height="64" rx="3" stroke="currentColor" strokeWidth="1.3" />
          <rect x="52" y="34" width="16" height="22" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="60" cy="72" r="4" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case "fan":
      return (
        <svg {...props}>
          <circle cx="60" cy="60" r="4" fill="currentColor" opacity="0.35" />
          <path d="M60 56V34M60 86V64M56 60H34M86 60H64" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M68 48l14-10M52 72l-14 10M68 72l14 10M52 48l-14-10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path d="M40 90V54c0-6 5-10 12-10h16c7 0 12 4 12 10v36" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M34 90h52" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="60" cy="40" r="10" stroke="currentColor" strokeWidth="1.3" />
          <path d="M60 30V18M50 22h20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
  }
}

/** Premium Osool missing-product visual — intentional, not a broken image. */
export function OsoolProductPlaceholder({
  className,
  silhouette = "default",
  compact = false,
}: OsoolProductPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-end justify-center overflow-hidden bg-[#f0eeea]",
        className,
      )}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(rgba(8,8,8,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(8,8,8,0.04) 1px, transparent 1px)",
          backgroundSize: compact ? "16px 16px" : "20px 20px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 58% 48% at 50% 14%, rgba(234,90,45,0.16) 0%, transparent 68%), radial-gradient(ellipse 90% 70% at 50% 100%, rgba(8,8,8,0.06) 0%, transparent 72%)",
        }}
      />
      <div className="absolute top-[10%] h-[38%] w-[40%]">
        <div
          className="absolute inset-x-[18%] top-0 h-px bg-brand-orange/40"
          style={{ transform: "rotate(-10deg)", transformOrigin: "center top" }}
        />
        <div
          className="absolute inset-x-[18%] top-0 h-px bg-white/30"
          style={{ transform: "rotate(10deg)", transformOrigin: "center top" }}
        />
      </div>
      <div className={cn("relative mb-[12%]", compact ? "h-[42%] w-[42%]" : "h-[46%] w-[46%]")}>
        <Silhouette type={silhouette} />
      </div>
      <div className="absolute bottom-0 start-0 h-px w-10 bg-brand-orange/50" />
    </div>
  );
}
