import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ProjectsPageContent } from "@/components/content/projects-page-content";
import { getProjectsData } from "@/lib/content/projects";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/projects",
    titleAr: "المشاريع | اصول التميز",
    titleEn: "Projects | Osool Altamaioz",
    descriptionAr: "أعمال ومشاريع إضاءة — معرض قيد الإعداد.",
    descriptionEn: "Lighting projects and case studies — portfolio in preparation.",
  });
}

export default async function ProjectsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = getProjectsData();
  return <ProjectsPageContent locale={locale} data={data} />;
}
