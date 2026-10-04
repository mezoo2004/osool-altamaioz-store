import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";

const PENDING_PATH = path.join(process.cwd(), "data", "reviews", "pending-submissions.json");
const APPROVED_PATH = path.join(process.cwd(), "data", "reviews", "approved-submissions.json");

export type AdminReviewRow = {
  id: string;
  source: "file" | "db";
  status: string;
  rating: number;
  displayName: string;
  body: string;
  productSlug: string | null;
  createdAt: string;
};

function readJsonArray<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T[];
  } catch {
    return [];
  }
}

export async function listAdminReviews(): Promise<AdminReviewRow[]> {
  const pendingFile = readJsonArray<{
    id: string;
    status: string;
    rating: number;
    displayName: string;
    body: string;
    productSlug: string | null;
    createdAt: string;
  }>(PENDING_PATH);

  const dbRows = process.env.DATABASE_URL?.trim()
    ? await prisma.customerReview.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
    : [];

  return [
    ...pendingFile.map((r) => ({
      id: r.id,
      source: "file" as const,
      status: r.status,
      rating: r.rating,
      displayName: r.displayName,
      body: r.body,
      productSlug: r.productSlug,
      createdAt: r.createdAt,
    })),
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
  ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function setReviewStatus(input: {
  id: string;
  source: "file" | "db";
  status: "APPROVED" | "REJECTED";
}) {
  if (input.source === "db") {
    await prisma.customerReview.update({
      where: { id: input.id },
      data: { status: input.status },
    });
    return;
  }

  const pending = readJsonArray<Record<string, unknown>>(PENDING_PATH);
  const idx = pending.findIndex((r) => r.id === input.id);
  if (idx < 0) throw new Error("not_found");
  const row = pending[idx];
  pending.splice(idx, 1);
  fs.writeFileSync(PENDING_PATH, JSON.stringify(pending, null, 2));

  if (input.status === "APPROVED") {
    const approved = readJsonArray<Record<string, unknown>>(APPROVED_PATH);
    approved.push({ ...row, status: "APPROVED", approvedAt: new Date().toISOString() });
    fs.writeFileSync(APPROVED_PATH, JSON.stringify(approved, null, 2));
  }
}
