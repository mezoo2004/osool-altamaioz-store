import fs from "node:fs";
import path from "node:path";
import { getProductRepository } from "@/lib/data";
import type { PendingReviewRecord, PublicCustomerReview, ReviewSubmissionInput } from "./types";

const REVIEWS_DIR = path.join(process.cwd(), "data", "reviews");
const DEMO_SEED_PATH = path.join(REVIEWS_DIR, "approved-demo.seed.json");
const PENDING_PATH = path.join(REVIEWS_DIR, "pending-submissions.json");

type DemoSeedFile = {
  reviews: {
    id: string;
    status: string;
    isDemoSeed: boolean;
    rating: number;
    displayNameAr: string;
    displayNameEn: string;
    bodyAr: string;
    bodyEn: string;
    productSlug: string | null;
    imageUrl: string | null;
    verifiedPurchase: boolean;
    createdAt: string;
  }[];
};

function readPending(): PendingReviewRecord[] {
  if (!fs.existsSync(PENDING_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(PENDING_PATH, "utf8")) as PendingReviewRecord[];
  } catch {
    return [];
  }
}

function writePending(rows: PendingReviewRecord[]) {
  if (!fs.existsSync(REVIEWS_DIR)) fs.mkdirSync(REVIEWS_DIR, { recursive: true });
  fs.writeFileSync(PENDING_PATH, JSON.stringify(rows, null, 2));
}

function readDemoApproved(locale: "ar" | "en"): PublicCustomerReview[] {
  if (!fs.existsSync(DEMO_SEED_PATH)) return [];
  const parsed = JSON.parse(fs.readFileSync(DEMO_SEED_PATH, "utf8")) as DemoSeedFile;
  return parsed.reviews
    .filter((r) => r.status === "APPROVED")
    .map((r) => ({
      id: r.id,
      status: "APPROVED" as const,
      rating: r.rating,
      displayName: locale === "ar" ? r.displayNameAr : r.displayNameEn,
      body: locale === "ar" ? r.bodyAr : r.bodyEn,
      productSlug: r.productSlug,
      productName: null,
      productImageUrl: null,
      imageUrl: r.imageUrl,
      verifiedPurchase: false,
      createdAt: r.createdAt,
      isDemoSeed: true,
    }));
}

export async function listApprovedPublicReviews(
  locale: "ar" | "en",
  limit?: number,
): Promise<PublicCustomerReview[]> {
  const rows = readDemoApproved(locale).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const repo = getProductRepository();
  const enriched = await Promise.all(
    rows.map(async (review) => {
      if (!review.productSlug) return review;
      const product = await repo.getBySlug(review.productSlug);
      if (!product) return review;
      return {
        ...review,
        productName: locale === "ar" ? product.nameAr : product.nameEn,
        productImageUrl: product.variants[0]?.imageUrl ?? null,
      };
    }),
  );

  return limit ? enriched.slice(0, limit) : enriched;
}

export function queuePendingReview(input: {
  locale: "ar" | "en";
  displayName: string;
  customerId: string;
  submission: ReviewSubmissionInput;
}): PendingReviewRecord {
  const record: PendingReviewRecord = {
    id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: "PENDING",
    rating: input.submission.rating,
    body: input.submission.body.trim(),
    locale: input.locale,
    displayName: input.displayName,
    customerId: input.customerId,
    productSlug: input.submission.productSlug?.trim() || null,
    imageStorageKey: input.submission.imageStorageKey ?? null,
    createdAt: new Date().toISOString(),
  };

  const pending = readPending();
  pending.push(record);
  writePending(pending);
  return record;
}
