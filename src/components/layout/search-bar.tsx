"use client";

import { ImagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ImageSourcePicker } from "@/components/visual-search/image-source-picker";
import { VisualSearchResultsList } from "@/components/visual-search/visual-search-results-list";
import { searchByImage, revokeImagePreviewUrl } from "@/lib/visual-search/visual-search-client";
import type { VisualMatchProduct, VisualSearchResult } from "@/lib/visual-search/types";
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
  const tVisual = useTranslations("visualSearch");
  const locale = useLocale() as "ar" | "en";
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [visualOpen, setVisualOpen] = useState(false);
  const [visualPreview, setVisualPreview] = useState<string | null>(null);
  const [visualAnalyzing, setVisualAnalyzing] = useState(false);
  const [visualProducts, setVisualProducts] = useState<VisualMatchProduct[]>([]);
  const [visualFile, setVisualFile] = useState<File | null>(null);
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
        setVisualOpen(false);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, locale]);

  const runVisualSearch = async (file: File, preview: string, textQuery?: string) => {
    setVisualFile(file);
    setVisualPreview(preview);
    setVisualOpen(true);
    setOpen(false);
    setVisualAnalyzing(true);
    setVisualProducts([]);
    try {
      const result: VisualSearchResult = await searchByImage({
        file,
        locale,
        query: textQuery ?? query,
      });
      setVisualProducts(result.products);
    } catch {
      setVisualProducts([]);
    } finally {
      setVisualAnalyzing(false);
    }
  };

  const handleImageSelected = (file: File, previewUrl: string) => {
    void runVisualSearch(file, previewUrl);
  };

  const clearVisual = () => {
    if (visualPreview) revokeImagePreviewUrl(visualPreview);
    setVisualPreview(null);
    setVisualFile(null);
    setVisualProducts([]);
    setVisualOpen(false);
    setVisualAnalyzing(false);
  };

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
          onChange={(e) => {
            setQuery(e.target.value);
            if (visualOpen) clearVisual();
          }}
          onFocus={() => {
            if (suggestions.length) setOpen(true);
            if (visualProducts.length || visualAnalyzing) setVisualOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={compact ? t("searchShort") : t("search")}
          className="h-10 w-full rounded-lg border border-border bg-surface-muted px-3.5 pe-[4.5rem] text-sm outline-none transition-colors placeholder:text-text-secondary focus:border-brand-black-soft focus:bg-white"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="image-search-btn absolute end-10 top-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-brand-black-soft transition-all hover:bg-brand-orange/10 hover:text-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange/30 active:scale-95 motion-reduce:active:scale-100"
          aria-label={tVisual("searchByImage")}
          title={tVisual("searchByImage")}
        >
          <ImagePlus className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden="true" />
        </button>
        <button
          type="submit"
          className="absolute end-1 top-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-white hover:text-brand-black-soft"
          aria-label={t("searchShort")}
        >
          <SearchIcon />
        </button>
      </form>

      <ImageSourcePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onImageSelected={handleImageSelected}
        variant="search"
      />

      {visualOpen && (visualAnalyzing || visualProducts.length > 0) && (
        <div className="absolute z-50 mt-1.5 w-full">
          <VisualSearchResultsList
            products={visualProducts}
            locale={locale}
            previewUrl={visualPreview}
            analyzing={visualAnalyzing}
          />
          {!visualAnalyzing && visualFile && visualProducts.length === 0 && (
            <p className="mt-2 rounded-lg border border-border bg-white p-3 text-sm text-text-secondary">
              {tVisual("noMatches")}
            </p>
          )}
        </div>
      )}

      {open && suggestions.length > 0 && !visualOpen && (
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
    <Link href={href} aria-label={label} className="icon-btn-premium">
      {children}
    </Link>
  );
}
