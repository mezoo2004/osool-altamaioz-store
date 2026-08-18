import fs from "node:fs";
import path from "node:path";
import type { SceneRecord } from "@/lib/experience/types";

const SCENES_PATH = path.join(process.cwd(), "data", "experiences", "scenes.json");

let cache: SceneRecord[] | null = null;

function loadScenes(): SceneRecord[] {
  if (cache) return cache;
  if (!fs.existsSync(SCENES_PATH)) {
    cache = [];
    return cache;
  }
  cache = JSON.parse(fs.readFileSync(SCENES_PATH, "utf8")) as SceneRecord[];
  return cache;
}

export interface SceneRepository {
  list(): Promise<SceneRecord[]>;
  getBySlug(slug: string): Promise<SceneRecord | null>;
  getBySpaceId(spaceId: string): Promise<SceneRecord[]>;
  getFeatured(): Promise<SceneRecord[]>;
  getAllSlugs(): Promise<string[]>;
}

export class FileSceneRepository implements SceneRepository {
  async list() {
    return [...loadScenes()].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getBySlug(slug: string) {
    return loadScenes().find((s) => s.slug === slug) ?? null;
  }

  async getBySpaceId(spaceId: string) {
    return loadScenes()
      .filter((s) => s.spaceId === spaceId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getFeatured() {
    return loadScenes()
      .filter((s) => s.featured)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getAllSlugs() {
    return loadScenes().map((s) => s.slug);
  }
}

let repository: SceneRepository | null = null;

export function getSceneRepository(): SceneRepository {
  if (!repository) repository = new FileSceneRepository();
  return repository;
}
