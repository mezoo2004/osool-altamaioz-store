import { Link } from "@/i18n/navigation";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function ExperienceBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="mb-6 text-meta" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, idx) => (
          <li key={`${item.label}-${idx}`} className="flex items-center gap-1.5">
            {idx > 0 && <span className="text-text-secondary/60" aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-brand-black-soft">
                {item.label}
              </Link>
            ) : (
              <span className="text-text-primary">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
