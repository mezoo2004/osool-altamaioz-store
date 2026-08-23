"use client";

import { Camera, FolderOpen, Images, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ALLOWED_IMAGE_MIMES, MAX_IMAGE_BYTES } from "@/lib/visual-search/types";
import { createImagePreviewUrl, revokeImagePreviewUrl } from "@/lib/visual-search/visual-search-client";

export type ImageSourcePickerProps = {
  open: boolean;
  onClose: () => void;
  onImageSelected: (file: File, previewUrl: string) => void;
  /** desktop popover vs mobile sheet styling handled via className */
  variant?: "search" | "assistant";
};

type Step = "source" | "preview";

export function ImageSourcePicker({
  open,
  onClose,
  onImageSelected,
  variant = "search",
}: ImageSourcePickerProps) {
  const t = useTranslations("visualSearch");
  const [step, setStep] = useState<Step>("source");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    if (previewUrl) revokeImagePreviewUrl(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
    setError(null);
    setStep("source");
  }, [previewUrl]);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const handleFile = (file: File | undefined | null) => {
    if (!file) return;
    setError(null);
    if (!ALLOWED_IMAGE_MIMES.includes(file.type as (typeof ALLOWED_IMAGE_MIMES)[number])) {
      setError(t("errorInvalidType"));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t("errorTooLarge"));
      return;
    }
    const url = createImagePreviewUrl(file);
    setPreviewUrl(url);
    setPendingFile(file);
    setStep("preview");
  };

  const confirm = () => {
    if (pendingFile && previewUrl) {
      onImageSelected(pendingFile, previewUrl);
      onClose();
    }
  };

  if (!open) return null;

  const isMobileSheet = variant === "search" || variant === "assistant";

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[1px] motion-reduce:backdrop-blur-none"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("addImageTitle")}
        className={cn(
          "fixed z-[61] overflow-hidden bg-white shadow-2xl",
          isMobileSheet
            ? "inset-x-0 bottom-0 max-h-[85svh] rounded-t-2xl md:inset-auto md:bottom-auto md:start-4 md:top-auto md:mt-0 md:w-[22rem] md:rounded-2xl md:border md:border-border"
            : "md:w-[22rem] md:rounded-2xl md:border md:border-border",
          variant === "search" && "md:start-auto md:end-[max(1rem,calc(50%-20rem))] md:top-24",
          variant === "assistant" && "md:start-4 md:bottom-28",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-brand-black-soft">
            {step === "source" ? t("addImageTitle") : t("previewTitle")}
          </h3>
          <button type="button" onClick={onClose} className="icon-btn-premium h-8 w-8" aria-label={t("close")}>
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {step === "source" && (
          <div className="space-y-1 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-3">
            <SourceOption
              icon={<Camera className="h-5 w-5" strokeWidth={1.5} />}
              title={t("takePhoto")}
              subtitle={t("takePhotoHint")}
              onClick={() => cameraRef.current?.click()}
            />
            <SourceOption
              icon={<Images className="h-5 w-5" strokeWidth={1.5} />}
              title={t("photoLibrary")}
              subtitle={t("photoLibraryHint")}
              onClick={() => galleryRef.current?.click()}
            />
            <SourceOption
              icon={<FolderOpen className="h-5 w-5" strokeWidth={1.5} />}
              title={t("chooseFiles")}
              subtitle={t("chooseFilesHint")}
              onClick={() => filesRef.current?.click()}
            />
            {error && <p className="px-2 pt-2 text-xs text-brand-orange">{error}</p>}
          </div>
        )}

        {step === "preview" && previewUrl && (
          <div className="space-y-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="overflow-hidden rounded-xl border border-border bg-surface-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="" className="max-h-48 w-full object-contain" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={reset} className="btn-cta-secondary flex-1 text-sm">
                {t("retake")}
              </button>
              <button type="button" onClick={confirm} className="btn-cta flex-1 bg-brand-orange text-sm hover:bg-brand-orange/90">
                {t("useImage")}
              </button>
            </div>
          </div>
        )}

        <input
          ref={cameraRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={filesRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </>
  );
}

function SourceOption({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-start transition-colors hover:bg-brand-orange/5 active:scale-[0.99] motion-reduce:active:scale-100"
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-brand-black-soft">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-medium text-brand-black-soft">{title}</span>
        <span className="mt-0.5 block text-xs text-text-secondary">{subtitle}</span>
      </span>
    </button>
  );
}
