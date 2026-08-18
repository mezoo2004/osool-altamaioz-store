import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type AccountPageShellProps = {
  locale: string;
  title: string;
  active?: "overview" | "profile" | "addresses" | "orders" | "wishlist";
  children: React.ReactNode;
};

const navItems = [
  { key: "overview", href: "/account", ar: "نظرة عامة", en: "Overview" },
  { key: "profile", href: "/account/profile", ar: "الملف الشخصي", en: "Profile" },
  { key: "addresses", href: "/account/addresses", ar: "العناوين", en: "Addresses" },
  { key: "orders", href: "/account/orders", ar: "الطلبات", en: "Orders" },
  { key: "wishlist", href: "/wishlist", ar: "المفضلة", en: "Wishlist" },
] as const;

export function AccountPageShell({ locale, title, active, children }: AccountPageShellProps) {
  return (
    <div className="container-page py-8 md:py-12">
      <nav className="-mx-1 mb-6 flex gap-1 overflow-x-auto border-b border-border px-1 pb-3" aria-label="Account">
        {navItems.map((item) => {
          const isActive = active === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-black-soft text-white"
                  : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
              )}
            >
              {locale === "ar" ? item.ar : item.en}
            </Link>
          );
        })}
      </nav>
      <h1 className="heading-section mb-6">{title}</h1>
      {children}
    </div>
  );
}
