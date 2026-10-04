import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";

const PENDING_PATH = path.join(process.cwd(), "data", "reviews", "pending-submissions.json");

export type AdminReviewListRow = {
  id: string;
  source: "file" | "db";
  status: string;
  rating: number;
  displayName: string;
  body: string;
  productSlug: string | null;
  createdAt: string;
};

function readPendingFile(): AdminReviewListRow[] {
  if (!fs.existsSync(PENDING_PATH)) return [];
  try {
    const rows = JSON.parse(fs.readFileSync(PENDING_PATH, "utf8")) as {
      id: string;
      status: string;
      rating: number;
      displayName: string;
      body: string;
      productSlug: string | null;
      createdAt: string;
    }[];
    return rows.map((r) => ({
      id: r.id,
      source: "file" as const,
      status: r.status,
      rating: r.rating,
      displayName: r.displayName,
      body: r.body,
      productSlug: r.productSlug,
      createdAt: r.createdAt,
    }));
  } catch {
    return [];
  }
}

export async function listAdminReviewsPaginated(input: { page?: number; pageSize?: number }) {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, input.pageSize ?? 20));
  const fileRows = readPendingFile();

  const hasDb = Boolean(process.env.DATABASE_URL?.trim());
  const dbTotal = hasDb ? await prisma.customerReview.count() : 0;
  const total = fileRows.length + dbTotal;

  const items: AdminReviewListRow[] = [];

  if (page === 1) {
    items.push(...fileRows);
  }

  const remaining = Math.max(0, pageSize - items.length);
  if (remaining > 0 && hasDb) {
    const dbSkip = page === 1 ? 0 : (page - 1) * pageSize - fileRows.length;
    const dbRows = await prisma.customerReview.findMany({
      orderBy: { createdAt: "desc" },
      skip: Math.max(0, dbSkip),
      take: remaining,
      select: {
        id: true,
        status: true,
        rating: true,
        displayNameAr: true,
        bodyAr: true,
        productSlug: true,
        createdAt: true,
      },
    });
    items.push(
      ...dbRows.map((r) => ({
        id: r.id,
        source: "db" as const,
        status: r.status,
        rating: r.rating,
        displayName: r.displayNameAr,
        body: r.bodyAr,
        productSlug: r.productSlug,
        createdAt: r.createdAt.toISOString(),
      })),
    );
  }

  return { total, page, pageSize, items };
}
