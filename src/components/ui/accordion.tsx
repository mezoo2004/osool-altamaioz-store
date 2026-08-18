"use client";

import { cn } from "@/lib/utils";

type AccordionItem = {
  id: string;
  question: string;
  answer: string;
};

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
};

export function Accordion({ items, className }: AccordionProps) {
  return (
    <div className={cn("card-surface divide-y divide-border overflow-hidden", className)}>
      {items.map((item) => (
        <details key={item.id} className="group">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium marker:content-none transition-colors hover:bg-surface-muted [&::-webkit-details-marker]:hidden md:text-base">
            <span className="flex items-center justify-between gap-4">
              <span className="text-start leading-snug">{item.question}</span>
              <span
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface-muted text-sm text-text-secondary transition-transform group-open:rotate-45 motion-reduce:transition-none"
                aria-hidden="true"
              >
                +
              </span>
            </span>
          </summary>
          <p className="border-t border-border px-5 pb-4 pt-3 text-sm leading-relaxed text-text-secondary">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
