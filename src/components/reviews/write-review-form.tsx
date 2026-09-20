"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ImagePlus, X } from "lucide-react";
import { ImageSourcePicker } from "@/components/visual-search/image-source-picker";
import { StarRating } from "@/components/reviews/star-rating";
import { revokeImagePreviewUrl } from "@/lib/visual-search/visual-search-client";
import { cn } from "@/lib/utils";

type WriteReviewFormProps = {
  className?: string;
  productSlug?: string | null;
  onSubmitted?: () => void;
};

export function WriteReviewForm({ className, productSlug, onSubmitted }: WriteReviewFormProps) {
  const t = useTranslations("reviews");
  const locale = useLocale() as "ar" | "en";
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageStorageKey, setImageStorageKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.user)))
      .catch(() => setAuthed(false));
  }, []);

  const clearImage = () => {
    if (imagePreview) revokeImagePreviewUrl(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setImageStorageKey(null);
  };

  const handleImageSelected = async (file: File, previewUrl: string) => {
    clearImage();
    setImageFile(file);
    setImagePreview(previewUrl);
    setError(null);

    const form = new FormData();
    form.set("image", file);
    const res = await fetch("/api/reviews/upload", { method: "POST", body: form });
    if (!res.ok) {
      setError(t("imageUploadFailed"));
      clearImage();
      return;
    }
    const data = (await res.json()) as { storageKey: string; previewUrl: string };
    setImageStorageKey(data.storageKey);
    if (data.previewUrl) setImagePreview(data.previewUrl);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!authed) return;
    if (rating < 1) {
      setError(t("ratingRequired"));
      return;
    }
    if (text.trim().length < 12) {
      setError(t("textRequired"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          text: text.trim(),
          locale,
          productSlug: productSlug ?? null,
          imageStorageKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error === "auth_required" ? t("loginRequired") : t("submitFailed"));
        return;
      }
      setMessage(typeof data.message === "string" ? data.message : t("pendingModeration"));
      setRating(0);
      setText("");
      clearImage();
      onSubmitted?.();
    } catch {
      setError(t("submitFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (authed === null) {
    return <p className="text-sm text-text-secondary">{t("loading")}</p>;
  }

  if (!authed) {
    return (
      <div className={cn("rounded-2xl border border-border bg-[#faf9f7] p-6", className)}>
        <h3 className="text-lg font-semibold text-brand-black-soft">{t("writeTitle")}</h3>
        <p className="mt-2 text-sm text-text-secondary">{t("loginRequired")}</p>
        <Link href={`/login?next=/${locale}/reviews`} className="btn-cta mt-4 inline-flex h-11 px-5">
          {t("loginCta")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn("rounded-2xl border border-border bg-white p-6 md:p-8", className)}>
      <h3 className="text-lg font-semibold text-brand-black-soft">{t("writeTitle")}</h3>
      <p className="mt-1 text-sm text-text-secondary">{t("writeHint")}</p>

      <div className="mt-6 space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium">{t("yourRating")}</p>
          <StarRating value={rating} onChange={setRating} label={t("yourRating")} />
        </div>

        <div>
          <label htmlFor="review-text" className="mb-2 block text-sm font-medium">
            {t("shareExperience")}
          </label>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            maxLength={2000}
            className="min-h-[8rem] w-full resize-y rounded-xl border border-border px-3 py-3 text-base md:text-sm"
            placeholder={t("textPlaceholder")}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">{t("attachImage")}</p>
          {imagePreview ? (
            <div className="relative inline-block max-w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="" className="max-h-40 rounded-xl border border-border object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -end-2 -top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-black-soft text-white"
                aria-label={t("removeImage")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-border px-4 text-sm font-medium transition-colors hover:border-brand-orange/40 hover:bg-brand-orange/5"
            >
              <ImagePlus className="h-4 w-4 text-brand-orange" />
              {t("attachImage")}
            </button>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-brand-orange">{message}</p>}

        <button type="submit" disabled={loading} className="btn-cta h-11 w-full sm:w-auto sm:min-w-[12rem]">
          {loading ? t("submitting") : t("submitReview")}
        </button>
      </div>

      <ImageSourcePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onImageSelected={handleImageSelected}
        variant="assistant"
      />
    </form>
  );
}
