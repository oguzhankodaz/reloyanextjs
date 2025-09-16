"use client";

import { registerAction } from "@/actions/auth";
import { useActionState } from "react";

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, {
    success: false,
    message: "",
    user: null,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo / Başlık */}
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6 tracking-wide">
          ReloYa
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Müşteri Sadakat Programı • Kayıt Ol
        </p>

        {/* Form */}
        <form className="space-y-5" action={formAction}>
          <div>
            <input
              type="text"
              name="name"
              placeholder="Adınız"
              className=" text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-400"
            />
          </div>
          <div>
            <input
              type="text"
              name="surname"
              placeholder="Soyadınız"
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-400"
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="E-posta adresiniz"
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-400"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Şifreniz"
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Kayıt Ol
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
          Zaten hesabın var mı?{" "}
          <a href="/login" className="text-black font-semibold hover:underline">
            Giriş Yap
          </a>
        </div>
      </div>
    </div>
  );
}
