/** @format */
"use client";

import { useActionState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginStaffAction } from "@/actions/auth";
import { ArrowLeft } from "lucide-react";

export default function StaffLoginPage() {
  const [state, formAction] = useActionState(loginStaffAction, {
    success: false,
    message: "",
    staff: null as null | { id: string; name: string; email: string; companyId: string },
  });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (state.success && state.staff) {
      router.push("/company/staff/dashboard");
    }
  }, [state, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative">
        <button
          onClick={() => router.push("/company/login")}
          className="absolute top-4 left-4 text-gray-600 hover:text-black flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Geri</span>
        </button>

        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          ReloYa • Personel
        </h1>
        <p className="text-center text-gray-500 mb-8">Sadece QR ve işlem ekranları</p>

        <form
          className="space-y-5"
          action={(formData) => startTransition(() => formAction(formData))}
        >
          <input
            type="email"
            name="email"
            placeholder="Personel e-posta"
            required
            className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Şifre"
            required
            className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className={`w-full font-semibold py-3 rounded-lg transition-colors ${
              isPending ? "bg-gray-500 text-white" : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        {state.message && (
          <p
            className={`mt-6 text-center font-medium ${
              state.success ? "text-green-600" : "text-red-600"
            }`}
          >
            {state.message}
          </p>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Şirket hesabına dönmek için{" "}
          <a href="/company/login" className="text-black font-semibold hover:underline">
            tıklayın
          </a>
        </div>
      </div>
    </div>
  );
}
