import { requiresDatabaseStorage } from "@/lib/data/database-config";
import { PrismaWishlistRepository } from "@/lib/data/prisma-wishlist-repository";
import type { WishlistRepository } from "@/lib/data/wishlist-repository";

let repository: WishlistRepository | null = null;

export function getWishlistRepository(): WishlistRepository {
  if (!requiresDatabaseStorage()) {
    throw new Error("Wishlist database storage requires DATABASE_URL.");
  }
  if (!repository) repository = new PrismaWishlistRepository();
  return repository;
}

export function isWishlistDatabaseEnabled(): boolean {
  return requiresDatabaseStorage();
}
