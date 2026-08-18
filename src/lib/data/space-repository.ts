import fs from "node:fs";
import path from "node:path";
import type { SpaceRecord } from "@/lib/experience/types";

const SPACES_PATH = path.join(process.cwd(), "data", "experiences", "spaces.json");

let cache: SpaceRecord[] | null = null;

function loadSpaces(): SpaceRecord[] {
  if (cache) return cache;
  if (!fs.existsSync(SPACES_PATH)) {
    cache = [];
    return cache;
  }
  cache = JSON.parse(fs.readFileSync(SPACES_PATH, "utf8")) as SpaceRecord[];
  return cache;
}

export interface SpaceRepository {
  list(): Promise<SpaceRecord[]>;
  getBySlug(slug: string): Promise<SpaceRecord | null>;
  getFeatured(): Promise<SpaceRecord[]>;
  getAllSlugs(): Promise<string[]>;
}

export class FileSpaceRepository implements SpaceRepository {
  async list() {
    return [...loadSpaces()].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getBySlug(slug: string) {
    return loadSpaces().find((s) => s.slug === slug) ?? null;
  }

  async getFeatured() {
    return loadSpaces()
      .filter((s) => s.featured)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getAllSlugs() {
    return loadSpaces().map((s) => s.slug);
  }
}

let repository: SpaceRepository | null = null;

export function getSpaceRepository(): SpaceRepository {
  if (!repository) repository = new FileSpaceRepository();
  return repository;
}
