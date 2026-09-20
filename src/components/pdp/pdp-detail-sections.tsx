"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PdpSpecRow } from "@/lib/pdp/pdp-presenters";

type Section = {
  id: string;
  title: string;
  content: React.ReactNode;
  hidden?: boolean;
};

type PdpDetailSectionsProps = {
  sections: Section[];
};

export function PdpDetailSections({ sections }: PdpDetailSectionsProps) {
  const visible = sections.filter((s) => !s.hidden);
  const [openId, setOpenId] = useState<string | null>(visible[0]?.id ?? null);

  if (!visible.length) return null;

  return (
    <div className="mt-10 space-y-2 md:mt-12">
      {visible.map((section) => {
        const open = openId === section.id;
        return (
          <div key={section.id} className="overflow-hidden rounded-xl border border-border bg-white">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start md:px-5"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : section.id)}
            >
              <span className="text-sm font-semibold text-brand-black-soft">{section.title}</span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
            </button>
            {open && <div className="border-t border-border px-4 py-4 md:px-5">{section.content}</div>}
          </div>
        );
      })}
    </div>
  );
}

export function SpecTable({ rows }: { rows: PdpSpecRow[] }) {
  if (!rows.length) return null;
  return (
    <dl className="divide-y divide-border">
      {rows.map((row) => (
        <div key={`${row.key}-${row.value}`} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-2 sm:gap-4">
          <dt className="text-sm text-text-secondary">{row.key}</dt>
          <dd className="text-sm font-medium text-text-primary">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BulletList({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="list-disc space-y-2 ps-5 text-sm leading-relaxed text-text-primary">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
