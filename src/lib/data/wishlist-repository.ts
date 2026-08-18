export interface WishlistRepository {
  list(customerId: string): Promise<string[]>;
  add(customerId: string, productSlug: string): Promise<string[]>;
  remove(customerId: string, productSlug: string): Promise<string[]>;
  /** Merge guest browser slugs into account wishlist (deduplicated). */
  merge(customerId: string, productSlugs: string[]): Promise<string[]>;
}
