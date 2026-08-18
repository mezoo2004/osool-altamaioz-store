import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AccountPageShell } from "@/components/commerce/account-page-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { getAddressRepository, getSessionUser } from "@/lib/data/user-repository";

export default async function AccountAddressesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login`);
  const addresses = await getAddressRepository().list(user.id);

  return (
    <AccountPageShell locale={locale} title={locale === "ar" ? "العناوين" : "Addresses"} active="addresses">
      {addresses.length === 0 ? (
        <EmptyState
          title={locale === "ar" ? "لا توجد عناوين محفوظة" : "No saved addresses"}
          description={locale === "ar" ? "ستظهر عناوينك هنا بعد إتمام طلب." : "Your addresses will appear here after checkout."}
        />
      ) : (
        <ul className="space-y-3">
          {addresses.map((a) => (
            <li key={a.id} className="card-surface p-4 text-sm">
              <p className="font-medium">{a.fullName}</p>
              <p className="mt-1 text-meta">{a.street}, {a.city}, {a.country}</p>
              {a.phone && <p className="mt-1 text-meta">{a.phone}</p>}
            </li>
          ))}
        </ul>
      )}
    </AccountPageShell>
  );
}
