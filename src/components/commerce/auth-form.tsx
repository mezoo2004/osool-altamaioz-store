"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { OsoolLogo } from "@/components/brand/osool-logo";
import { Link, useRouter } from "@/i18n/navigation";
import { SocialAuthButtons } from "@/components/commerce/social-auth-buttons";
import { cn } from "@/lib/utils";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("commerce.auth");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(t(`errors.${err instanceof Error ? err.message : "failed"}` as "errors.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page flex min-h-[60vh] max-w-md flex-col justify-center py-12 md:py-16">
      <div className="mb-8 space-y-5 text-center md:text-start">
        <div className="flex justify-center md:justify-start">
          <OsoolLogo locale={locale} surface="light" size="auth" href="/" />
        </div>
        <h1 className="heading-section">{mode === "login" ? t("login") : t("register")}</h1>
      </div>

      <div className="card-surface space-y-5 p-5 md:p-6">
        <SocialAuthButtons />
      </div>

      <form onSubmit={submit} className="card-surface mt-4 space-y-4 p-5 md:p-6">
        {mode === "register" && (
          <>
            <Input label={t("firstName")} value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} required />
            <Input label={t("lastName")} value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} required />
            <Input label={t("phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          </>
        )}
        <Input label={t("email")} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
        <Input
          label={t("password")}
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          required
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-xs text-text-secondary hover:text-text-primary"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "−" : "+"}
            </button>
          }
        />
        {mode === "register" && (
          <Input label={t("confirmPassword")} type="password" value={form.confirmPassword} onChange={(v) => setForm({ ...form, confirmPassword: v })} required />
        )}
        {mode === "login" && (
          <div className="text-end">
            <Link href="/forgot-password" className="text-xs text-brand-orange hover:underline">
              {t("forgotPassword")}
            </Link>
          </div>
        )}
        {error && (
          <p className="rounded-lg border border-brand-orange/30 bg-brand-orange/5 px-3 py-2 text-sm text-brand-orange">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn-cta w-full">
          {loading ? t("loading") : mode === "login" ? t("login") : t("register")}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-text-secondary">
        {mode === "login" ? (
          <>
            {t("noAccount")}{" "}
            <Link href="/register" className="font-medium text-brand-orange hover:underline">
              {t("register")}
            </Link>
          </>
        ) : (
          <>
            {t("hasAccount")}{" "}
            <Link href="/login" className="font-medium text-brand-orange hover:underline">
              {t("login")}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  trailing,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-meta">{label}</span>
      <div className="relative">
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("input-field", trailing && "pe-10")}
        />
        {trailing && <div className="absolute end-3 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
    </label>
  );
}

export function ForgotPasswordContent({ locale }: { locale: string }) {
  const t = useTranslations("commerce.auth");
  const localeKey = locale as "ar" | "en";
  return (
    <div className="container-page flex min-h-[50vh] max-w-md flex-col justify-center py-12 md:py-16">
      <div className="mb-6 flex justify-center md:justify-start">
        <OsoolLogo locale={localeKey} surface="light" size="auth" href="/" />
      </div>
      <h1 className="heading-section mb-4">{t("forgotPassword")}</h1>
      <div className="card-surface p-5 md:p-6">
        <p className="text-sm leading-relaxed text-text-secondary">{t("forgotPasswordHint")}</p>
        <Link href="/login" className="mt-6 inline-flex text-sm font-medium text-brand-orange hover:underline">
          {t("login")} {locale === "ar" ? "←" : "→"}
        </Link>
      </div>
    </div>
  );
}
