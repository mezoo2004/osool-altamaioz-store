"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Suggestion = {
  type: string;
  label: string;
  href: string;
};

type SearchBarProps = {
  className?: string;
  compact?: boolean;
  defaultValue?: string;
};

export function SearchBar({ className, compact = false, defaultValue = "" }: SearchBarProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(query)}&locale=${locale}`,
        );
        const data = (await res.json()) as { suggestions: Suggestion[] };
        setSuggestions(data.suggestions ?? []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, locale]);

  return (
    <div className={cn("relative w-full", className)}>
      <form action={`/${locale}/search`} method="get" className="relative">
        <label htmlFor="site-search" className="sr-only">
          {t("search")}
        </label>
        <input
          id="site-search"
          name="q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={compact ? t("searchShort") : t("search")}
          className="h-10 w-full rounded-lg border border-border bg-surface-muted px-3.5 pe-10 text-sm outline-none transition-colors placeholder:text-text-secondary focus:border-brand-black-soft focus:bg-white"
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute end-1 top-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-white hover:text-brand-black-soft"
          aria-label={t("searchShort")}
        >
          <SearchIcon />
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-white shadow-soft">
          {suggestions.map((s) => (
            <li key={`${s.type}-${s.label}`}>
              <Link
                href={s.href}
                className="flex items-center justify-between px-3.5 py-2.5 text-sm transition-colors hover:bg-surface-muted"
                onClick={() => setOpen(false)}
              >
                <span>{s.label}</span>
                <span className="text-[10px] uppercase tracking-wide text-text-secondary">{s.type}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m21 21-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} aria-label={label} className="icon-btn">
      {children}
    </Link>
  );
}
