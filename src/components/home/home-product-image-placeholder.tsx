import { cn } from "@/lib/utils";

type HomeProductImagePlaceholderProps = {
  className?: string;
};

/** Premium editorial placeholder for missing product photography on the homepage only. */
export function HomeProductImagePlaceholder({ className }: HomeProductImagePlaceholderProps) {
  return (
    <div
      className={cn("relative flex h-full w-full items-end justify-center overflow-hidden bg-[#ebe9e5]", className)}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "linear-gradient(rgba(8,8,8,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(8,8,8,0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 16%, rgba(234,90,45,0.2) 0%, transparent 68%), radial-gradient(ellipse 85% 65% at 50% 100%, rgba(8,8,8,0.08) 0%, transparent 72%)",
        }}
      />
      <div className="absolute top-[12%] h-[42%] w-[42%]">
        <div
          className="absolute inset-x-[16%] top-0 h-px bg-brand-orange/45"
          style={{ transform: "rotate(-12deg)", transformOrigin: "center top" }}
        />
        <div
          className="absolute inset-x-[16%] top-0 h-px bg-white/35"
          style={{ transform: "rotate(12deg)", transformOrigin: "center top" }}
        />
      </div>
      <svg
        viewBox="0 0 120 120"
        className="relative mb-[10%] h-[48%] w-[48%] text-brand-black-soft/38"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M36 88V52c0-6 5-10 12-10h24c7 0 12 4 12 10v36"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M30 88h60" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="60" cy="38" r="10" stroke="currentColor" strokeWidth="1.4" />
        <path d="M60 28V16M50 20h20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <ellipse cx="60" cy="38" rx="14" ry="6" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      </svg>
      <div className="absolute bottom-0 start-0 h-px w-10 bg-brand-orange/55" aria-hidden="true" />
    </div>
  );
}
