import Link from "next/link";

type AdminPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  query?: Record<string, string | undefined>;
};

function buildHref(basePath: string, page: number, query?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value?.trim()) params.set(key, value.trim());
    }
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function AdminPagination({ page, pageSize, total, basePath, query }: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-black/60">
        صفحة {page} من {totalPages}
      </p>
      <div className="flex gap-2">
        {page > 1 && (
          <Link
            href={buildHref(basePath, page - 1, query)}
            className="rounded-lg border border-black/15 px-3 py-1.5"
          >
            السابق
          </Link>
        )}
        {page < totalPages && (
          <Link
            href={buildHref(basePath, page + 1, query)}
            className="rounded-lg border border-black/15 px-3 py-1.5"
          >
            التالي
          </Link>
        )}
      </div>
    </div>
  );
}
