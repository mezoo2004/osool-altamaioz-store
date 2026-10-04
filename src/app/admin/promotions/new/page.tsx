import { AdminPromotionEditor, type AdminPromotionForm } from "@/components/admin/admin-promotion-editor";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/auth";

const defaults: AdminPromotionForm = {
  status: "DRAFT",
  priority: 10,
  popupEnabled: true,
  heroEnabled: false,
  desktopEnabled: true,
  mobileEnabled: true,
  frequency: "SESSION",
  titleAr: "عرض خاص لفترة محدودة",
  titleEn: "Limited-time offer",
  subtitleAr: "عروض مختارة على منتجات الإنارة",
  subtitleEn: "Selected offers on lighting products",
  imageUrl: null,
  primaryCtaLabelAr: "تصفح العروض",
  primaryCtaLabelEn: "Browse offers",
  primaryCtaUrl: "/ar/offers",
  secondaryCtaLabelAr: "تصفح المنتجات",
  secondaryCtaLabelEn: "Browse products",
  secondaryCtaUrl: "/ar/products",
  discountPercentClaim: null,
  startsAt: "",
  endsAt: "",
};

export default async function AdminNewPromotionPage() {
  const user = await requireAdminSession();
  return (
    <AdminShell user={user}>
      <AdminPromotionEditor initial={defaults} />
    </AdminShell>
  );
}
