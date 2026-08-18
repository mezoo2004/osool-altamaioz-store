import type { ProductRepository } from "@/lib/data/product-repository";
import { getRepositoriesSync, resetRepositories } from "@/lib/data/repository-factory";

export { getSpaceRepository } from "@/lib/data/space-repository";
export { getSceneRepository } from "@/lib/data/scene-repository";
export { getRepositories, getRepositoriesSync, isDatabaseConfigured } from "@/lib/data/repository-factory";

/**
 * Returns the active product repository via central factory.
 * File JSON sample when DATABASE_URL is unset; Prisma when configured.
 */
export function getProductRepository(): ProductRepository {
  return getRepositoriesSync().products;
}

export function resetProductRepository() {
  resetRepositories();
}
