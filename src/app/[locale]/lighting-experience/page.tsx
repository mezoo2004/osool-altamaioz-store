import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { LightingExperienceWizard } from "@/components/experience/lighting-experience-wizard";
import { getSpaceRepository } from "@/lib/data";
import { buildExperienceMetadata } from "@/lib/seo/metadata";

type LightingExperiencePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: LightingExperiencePageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildExperienceMetadata({
    locale,
    path: "/lighting-experience",
    titleAr: "صمّم أجواء مساحتك | اصول التميز",
    titleEn: "Design Your Lighting Atmosphere | Osool Altamaioz",
    descriptionAr: "جولة إرشادية في 5 خطوات لاختيار الإضاءة المناسبة لمساحتك ومودك.",
    descriptionEn: "A guided 5-step journey to choose lighting suited to your space and mood.",
  });
}

function ExperienceFallback() {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-md space-y-4">
        <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
        <div className="h-8 w-full animate-pulse rounded-lg bg-surface-muted" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-8 animate-pulse rounded-full bg-surface-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

function hasDesignerHandoff(
  searchParams: Record<string, string | string[] | undefined>,
): boolean {
  return Object.entries(searchParams).some(([key, value]) => {
    if (key === "page" || key === "sort") return false;
    if (value == null) return false;
    if (Array.isArray(value)) return value.some((v) => String(v).trim().length > 0);
    return String(value).trim().length > 0;
  });
}

export default async function LightingExperiencePage({ params, searchParams }: LightingExperiencePageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  if (!hasDesignerHandoff(sp)) {
    redirect(`/${locale}/products`);
  }

  const spaces = await getSpaceRepository().list();

  return (
    <Suspense fallback={<ExperienceFallback />}>
      <LightingExperienceWizard spaces={spaces} locale={locale} />
    </Suspense>
  );
}
