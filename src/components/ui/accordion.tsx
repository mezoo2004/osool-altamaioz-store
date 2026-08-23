"use client";

import { cn } from "@/lib/utils";

type AccordionItem = {
  id: string;
  question: string;
  answer: string;
};

type AccordionGroup = {
  id: string;
  title: string;
  items: AccordionItem[];
};

type AccordionProps = {
  items?: AccordionItem[];
  groups?: AccordionGroup[];
  className?: string;
};

export function Accordion({ items, groups, className }: AccordionProps) {
  if (groups?.length) {
    return (
      <div className={cn("faq-accordion space-y-8", className)}>
        {groups.map((group) => (
          <section key={group.id}>
            <h2 className="heading-subsection mb-4">{group.title}</h2>
            <AccordionList items={group.items} />
          </section>
        ))}
      </div>
    );
  }

  return <AccordionList items={items ?? []} className={className} />;
}

function AccordionList({ items, className }: { items: AccordionItem[]; className?: string }) {
  return (
    <div className={cn("faq-accordion card-surface divide-y divide-border overflow-hidden", className)}>
      {items.map((item) => (
        <details key={item.id} className="group">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium marker:content-none transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none md:px-6 md:py-5 md:text-base [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-4">
              <span className="text-start leading-snug">{item.question}</span>
              <span
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-lg leading-none text-text-secondary transition-[transform,color,background-color,border-color] duration-200 group-open:rotate-45 group-open:border-brand-orange/30 group-open:bg-brand-orange/8 group-open:text-brand-orange motion-reduce:transition-none"
                aria-hidden="true"
              >
                +
              </span>
            </span>
          </summary>
          <div className="faq-answer border-t border-border/80 px-5 pb-5 pt-3 md:px-6 md:pb-6 md:pt-4">
            <p className="text-sm leading-relaxed text-text-secondary md:text-[15px] md:leading-7">
              {item.answer}
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
