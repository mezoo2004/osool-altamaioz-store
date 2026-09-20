"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type OAuthAvailability = { google: boolean; apple: boolean };

export function SocialAuthButtons() {
  const locale = useLocale();
  const t = useTranslations("commerce.auth");
  const [availability, setAvailability] = useState<OAuthAvailability | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/oauth/config")
      .then((r) => r.json())
      .then((data) => setAvailability(data as OAuthAvailability))
      .catch(() => setAvailability({ google: false, apple: false }));
  }, []);

  const startOAuth = async (provider: "google" | "apple") => {
    setError(null);
    const res = await fetch(`/api/auth/oauth/${provider}?locale=${locale}`, { redirect: "manual" });
    if (res.status === 503) {
      setError(t(`oauthNotConfigured.${provider}`));
      return;
    }
    if (res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400)) {
      window.location.href = `/api/auth/oauth/${provider}?locale=${locale}`;
      return;
    }
    window.location.href = `/api/auth/oauth/${provider}?locale=${locale}`;
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => startOAuth("google")}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:border-brand-gray/40 hover:bg-surface-muted"
      >
        <GoogleIcon />
        {t("continueGoogle")}
      </button>
      <button
        type="button"
        onClick={() => startOAuth("apple")}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-brand-black-soft bg-brand-black-soft px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-92"
      >
        <AppleIcon />
        {t("continueApple")}
      </button>
      {!availability?.google && !availability?.apple && (
        <p className="text-center text-xs text-text-secondary">{t("oauthSetupHint")}</p>
      )}
      {error && (
        <p className="rounded-lg border border-brand-orange/30 bg-brand-orange/5 px-3 py-2 text-xs text-brand-orange">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <span className="text-xs text-text-secondary">{t("orDivider")}</span>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22 12.24c0-.82-.07-1.42-.22-2.04H12v3.72h5.76c-.12 1-.76 2.52-2.18 3.88l-.02.16 3.17 2.46.22.02C20.96 18.3 22 15.42 22 12.24z" />
      <path fill="#34A853" d="M12 22c2.97 0 5.46-.98 7.28-2.66l-3.47-2.69c-.93.63-2.18 1.06-3.81 1.06-2.92 0-5.39-1.97-6.27-4.62l-.15.01-3.4 2.63-.04.14C4.98 19.53 8.24 22 12 22z" />
      <path fill="#FBBC05" d="M5.73 13.09c-.23-.69-.36-1.43-.36-2.19s.13-1.5.36-2.19l-.01-.15-3.44-2.67-.11.05C1.27 8.14 1 10.02 1 12s.27 3.86.74 5.61l3.99-3.52z" />
      <path fill="#EA4335" d="M12 5.38c2.06 0 3.45.89 4.25 1.63l3.1-3.02C17.44 2.09 14.97 1 12 1 8.24 1 4.98 3.47 3.74 7.39l3.99 3.52C8.61 7.35 11.08 5.38 12 5.38z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.42 2.09-1.24 2.84-.83.76-1.84 1.13-2.86 1.06-.03-1.1.4-2.14 1.18-2.88.84-.79 2.02-1.22 2.92-1.02zM20.88 17.07c-.57 1.32-.85 1.91-1.58 3.08-1.02 1.58-2.46 3.55-4.25 3.56-1.59.01-2-.98-4.15-.97-2.15.01-2.6 1-4.19.98-1.8-.03-3.17-1.66-4.19-3.24-2.87-4.44-3.17-9.65-1.4-12.42 1.25-1.97 3.22-3.12 5.07-3.12 1.88 0 3.06 1 4.61 1 1.5 0 2.42-.99 4.57-.99 1.63 0 3.35.89 4.6 2.43-4.05 2.2-3.4 7.93.67 9.48-.84 2.27-1.88 4.46-3.05 6.21z" />
    </svg>
  );
}
