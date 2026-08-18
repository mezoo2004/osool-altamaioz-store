import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("rounded-xl border border-dashed border-border bg-surface-muted px-6 py-14 text-center", className)}>
      <h2 className="heading-subsection">{title}</h2>
      {description && <p className="mt-2 text-meta">{description}</p>}
      {action && (
        <Link href={action.href} className="btn-cta mt-6">
          {action.label}
        </Link>
      )}
    </div>
  );
}

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8 border-b border-border pb-6", className)}>
      <h1 className="heading-section">{title}</h1>
      {description && <p className="mt-2 text-meta">{description}</p>}
    </div>
  );
}
