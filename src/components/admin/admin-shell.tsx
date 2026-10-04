import Link from "next/link";
import type { SessionUser } from "@/lib/commerce/types";

const nav = [
  { href: "/admin", label: "الرئيسية" },
  { href: "/admin/products", label: "المنتجات" },
  { href: "/admin/products/bulk-prices", label: "أسعار جماعية" },
  { href: "/admin/categories", label: "التصنيفات" },
  { href: "/admin/orders", label: "الطلبات" },
  { href: "/admin/reviews", label: "التقييمات" },
  { href: "/admin/promotions", label: "العروض" },
];

type AdminShellProps = {
  user: SessionUser;
  children: React.ReactNode;
};

export function AdminShell({ user, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#111]" dir="rtl">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-black/50">OSOOL ADMIN</p>
            <h1 className="text-lg font-semibold">لوحة تحكم اصول التميز</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-black/60">{user.email}</span>
            <Link href="/ar" className="rounded-full border border-black/10 px-3 py-1.5 hover:border-black/30">
              المتجر
            </Link>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="rounded-full bg-black px-3 py-1.5 text-white">
                خروج
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border border-black/10 bg-white p-3">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-black/[0.04]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
