import type { ProductRepository } from "@/lib/data/product-repository";
import type { OrderRepository } from "@/lib/data/order-repository";
import type { AddressRepository, UserRepository } from "@/lib/data/user-repository";
import { ImportProductRepository } from "@/lib/data/import-product-repository";
import { FileOrderRepository } from "@/lib/data/order-repository";
import {
  FileAddressRepository,
  FileUserRepository,
} from "@/lib/data/user-repository";
import { PrismaProductRepository } from "@/lib/data/prisma-product-repository";
import { PrismaUserRepository } from "@/lib/data/prisma-user-repository";
import { PrismaAddressRepository } from "@/lib/data/prisma-address-repository";
import { PrismaOrderRepository } from "@/lib/data/prisma-order-repository";
import type { WishlistRepository } from "@/lib/data/wishlist-repository";
import { PrismaWishlistRepository } from "@/lib/data/prisma-wishlist-repository";
import { isDatabaseConfigured, requiresDatabaseStorage } from "@/lib/data/database-config";

export type RepositoryBundle = {
  products: ProductRepository;
  users: UserRepository;
  addresses: AddressRepository;
  orders: OrderRepository;
  wishlist: WishlistRepository | null;
};

let bundle: RepositoryBundle | null = null;

export { isDatabaseConfigured, requiresDatabaseStorage };

function createBundle(): RepositoryBundle {
  if (requiresDatabaseStorage()) {
    return {
      products: new PrismaProductRepository(),
      users: new PrismaUserRepository(),
      addresses: new PrismaAddressRepository(),
      orders: new PrismaOrderRepository(),
      wishlist: new PrismaWishlistRepository(),
    };
  }

  return {
    products: new ImportProductRepository(),
    users: new FileUserRepository(),
    addresses: new FileAddressRepository(),
    orders: new FileOrderRepository(),
    wishlist: null,
  };
}

/** Central repository selection — file fallback when DATABASE_URL is unset. */
export function getRepositoriesSync(): RepositoryBundle {
  if (!bundle) bundle = createBundle();
  return bundle;
}

export async function getRepositories(): Promise<RepositoryBundle> {
  return getRepositoriesSync();
}

export function resetRepositories() {
  bundle = null;
}
