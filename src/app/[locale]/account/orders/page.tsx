import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { OrdersListContent } from "@/components/commerce/order-content";
import { getOrderRepository } from "@/lib/data/order-repository";
import { getSessionUser } from "@/lib/data/user-repository";

export default async function AccountOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login`);
  const orders = await getOrderRepository().findByCustomerId(user.id);
  return <OrdersListContent locale={locale} orders={orders} />;
}
