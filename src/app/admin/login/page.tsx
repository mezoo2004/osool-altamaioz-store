import { AdminLoginForm } from "@/components/admin/admin-login-form";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const sp = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <p className="text-xs tracking-[0.2em] text-black/50">ADMIN</p>
        <h1 className="mt-1 text-2xl font-semibold">دخول الإدارة</h1>
        <p className="mt-2 text-sm text-black/60">للموظفين المخولين فقط — اصول التميز</p>
        {sp.error === "unauthorized" && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            لا تملك صلاحية الوصول إلى لوحة التحكم.
          </p>
        )}
        <AdminLoginForm />
      </div>
    </div>
  );
}
