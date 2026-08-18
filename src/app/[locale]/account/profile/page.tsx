import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AccountPageShell } from "@/components/commerce/account-page-shell";
import { getSessionUser } from "@/lib/data/user-repository";

export default async function AccountProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login`);

  return (
    <AccountPageShell locale={locale} title={locale === "ar" ? "الملف الشخصي" : "Profile"} active="profile">
      <dl className="card-surface divide-y divide-border text-sm">
        <div className="grid gap-1 p-4 sm:grid-cols-[8rem_1fr]">
          <dt className="text-meta">{locale === "ar" ? "الاسم" : "Name"}</dt>
          <dd className="font-medium">{user.firstName} {user.lastName}</dd>
        </div>
        <div className="grid gap-1 p-4 sm:grid-cols-[8rem_1fr]">
          <dt className="text-meta">{locale === "ar" ? "البريد" : "Email"}</dt>
          <dd className="font-medium">{user.email}</dd>
        </div>
        <div className="grid gap-1 p-4 sm:grid-cols-[8rem_1fr]">
          <dt className="text-meta">{locale === "ar" ? "الجوال" : "Phone"}</dt>
          <dd className="font-medium">{user.phone ?? "—"}</dd>
        </div>
      </dl>
    </AccountPageShell>
  );
}
