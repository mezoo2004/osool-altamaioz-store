import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AccountPageShell } from "@/components/commerce/account-page-shell";
import { OrderDetailView } from "@/components/commerce/order-content";
import { getOrderRepository } from "@/lib/data/order-repository";
import { getSessionUser } from "@/lib/data/user-repository";

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; orderNumber: string }>;
}) {
  const { locale, orderNumber } = await params;
  setRequestLocale(locale);
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login`);

  const order = await getOrderRepository().findByOrderNumber(orderNumber);
  if (!order || order.customerId !== user.id) notFound();

  return (
    <AccountPageShell locale={locale} title={locale === "ar" ? "تفاصيل الطلب" : "Order details"} active="orders">
      <OrderDetailView order={order} locale={locale} />
    </AccountPageShell>
  );
}
