"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { user?: { role?: string }; error?: string };
      if (!res.ok || data.user?.role !== "ADMIN") {
        setError("بيانات الدخول غير صحيحة أو الحساب ليس مديراً.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("تعذر تسجيل الدخول. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block text-black/70">البريد الإلكتروني</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-black/15 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-black/70">كلمة المرور</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-black/15 px-3 py-2"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#EA5A2D] py-2.5 font-medium text-white disabled:opacity-60"
      >
        {loading ? "جاري الدخول..." : "دخول"}
      </button>
    </form>
  );
}
