"use client";

/** Client-side helper — calls shared VisualSearchService API. */
import type { VisualAttributes, VisualSearchResult } from "@/lib/visual-search/types";

export async function searchByImage(options: {
  file?: File | null;
  locale: "ar" | "en";
  query?: string;
  attributes?: VisualAttributes;
}): Promise<VisualSearchResult> {
  const form = new FormData();
  form.set("locale", options.locale);
  if (options.query) form.set("query", options.query);
  if (options.attributes) form.set("attributes", JSON.stringify(options.attributes));
  if (options.file) form.set("image", options.file);

  const res = await fetch("/api/search/visual", { method: "POST", body: form });
  if (!res.ok) throw new Error("visual_search_failed");
  return (await res.json()) as VisualSearchResult;
}

export function createImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeImagePreviewUrl(url: string) {
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
}
