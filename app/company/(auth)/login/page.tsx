/** @format */

"use client";

import { loginCompanyAction } from "@/actions/auth"; // 👈 company için ayrı action
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useTransition } from "react";

export default function CompanyLoginPage() {
  const [state, formAction] = useActionState(loginCompanyAction, {
    success: false,
    message: "",
    company: null,
  });

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (state.success && state.company) {
      localStorage.setItem("company", JSON.stringify(state.company));
      router.push("/company/dashboard"); // 👈 şirket dashboard’una yönlendirme
    }
  }, [state, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo / Başlık */}
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6 tracking-wide">
          ReloYa Business
        </h1>
        <p className="text-center text-gray-500 mb-8">
          İşletme Paneli • Giriş Yap
        </p>

        {/* Form */}
        <form
          className="space-y-5"
          action={(formData) => {
            startTransition(() => formAction(formData));
          }}
        >
          <div>
            <input
              type="email"
              name="email"
              placeholder="Şirket e-posta adresiniz"
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-400"
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Şifreniz"
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className={`w-full font-semibold py-3 rounded-lg transition-colors ${
              isPending
                ? "bg-gray-500 text-white cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        {/* Hata veya başarı mesajı */}
        {state.message && (
          <p
            className={`mt-6 text-center font-medium ${
              state.success ? "text-green-600" : "text-red-600"
            }`}
          >
            {state.message}
          </p>
        )}

        {/* Ekstra link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Şirket hesabınız yok mu?{" "}
          <a
            href="/company/register"
            className="text-black font-semibold hover:underline"
          >
            Kayıt Ol
          </a>
        </div>
      </div>
    </div>
  );
}
