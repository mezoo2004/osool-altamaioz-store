import { Link } from "@/i18n/navigation";
import { ExperienceBreadcrumb } from "@/components/experience/experience-breadcrumb";

type ContentHeroProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
};

export function ContentHero({ eyebrow, title, subtitle, cta }: ContentHeroProps) {
  return (
    <section className="relative overflow-hidden bg-brand-black-soft text-white">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0)_0%,rgba(8,8,8,0.88)_100%)]" />
      <div
        className="absolute inset-0 opacity-15"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="container-page relative py-14 md:py-20 lg:py-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="heading-display mt-4 max-w-3xl text-white">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl leading-relaxed text-white/70">{subtitle}</p>}
        {cta && (
          <Link href={cta.href} className="btn-cta mt-8">
            {cta.label}
          </Link>
        )}
      </div>
    </section>
  );
}

type ContentPageShellProps = {
  breadcrumb: { label: string; href?: string }[];
  hero: ContentHeroProps;
  children: React.ReactNode;
};

export function ContentPageShell({ breadcrumb, hero, children }: ContentPageShellProps) {
  return (
    <div className="pb-16 md:pb-20">
      <ContentHero {...hero} />
      <div className="container-page py-10 md:py-14">
        <ExperienceBreadcrumb items={breadcrumb} />
        {children}
      </div>
    </div>
  );
}

export function ContentSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 last:mb-0">
      {title && <h2 className="heading-subsection mb-4">{title}</h2>}
      <div className="space-y-4 text-sm leading-relaxed text-text-secondary md:text-base">{children}</div>
    </section>
  );
}

export function PendingConfirmationNotice({ locale }: { locale: string }) {
  return (
    <div className="mb-8 rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm text-text-secondary">
      {locale === "ar"
        ? "بعض التفاصيل في هذه الصفحة قيد التأكيد الرسمي من إدارة اصول التميز."
        : "Some details on this page are pending official confirmation from Osool Altamaioz."}
    </div>
  );
}

export function ExperienceHero({
  eyebrow,
  title,
  subtitle,
  cta,
}: ContentHeroProps) {
  return <ContentHero eyebrow={eyebrow} title={title} subtitle={subtitle} cta={cta} />;
}
