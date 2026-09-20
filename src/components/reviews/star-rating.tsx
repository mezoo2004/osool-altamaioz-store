"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: "sm" | "md";
  label: string;
  readOnly?: boolean;
};

export function StarRating({
  value,
  onChange,
  max = 5,
  size = "md",
  label,
  readOnly = false,
}: StarRatingProps) {
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div className="inline-flex flex-col gap-1.5" role={readOnly ? "img" : "group"} aria-label={label}>
      <div className="inline-flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const star = i + 1;
          const filled = star <= display;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange?.(star)}
              onMouseEnter={() => !readOnly && setHover(star)}
              onMouseLeave={() => !readOnly && setHover(null)}
              className={cn(
                "rounded p-0.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange",
                readOnly ? "cursor-default" : "hover:scale-105",
              )}
              aria-label={`${star} / ${max}`}
            >
              <Star
                className={cn(iconClass, filled ? "fill-brand-orange text-brand-orange" : "text-[#D0CEC9]")}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
