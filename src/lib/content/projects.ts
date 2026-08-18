import fs from "node:fs";
import path from "node:path";

export type ProjectCategory = {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
};

export type ProjectRecord = {
  id: string;
  slug: string;
  categoryId: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  imageUrl?: string | null;
  confirmationStatus?: string;
};

export type ProjectsData = {
  confirmationStatus: string;
  note: string;
  categories: ProjectCategory[];
  projects: ProjectRecord[];
};

const PROJECTS_PATH = path.join(process.cwd(), "data", "content", "projects.json");

let cache: ProjectsData | null = null;

export function getProjectsData(): ProjectsData {
  if (cache) return cache;
  if (!fs.existsSync(PROJECTS_PATH)) {
    cache = { confirmationStatus: "BUSINESS_CONFIRMATION_REQUIRED", note: "", categories: [], projects: [] };
    return cache;
  }
  cache = JSON.parse(fs.readFileSync(PROJECTS_PATH, "utf8")) as ProjectsData;
  return cache;
}
