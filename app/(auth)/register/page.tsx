/** @format */

"use client";

import { registerAction } from "@/actions/auth";
import { useActionState } from "react";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, {
    success: false,
    message: "",
    user: null,
  });

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // ✅ Başarılı kayıt sonrası login sayfasına yönlendir
  useEffect(() => {
    if (state.success) {
      const timeout = setTimeout(() => {
        router.push("/login");
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [state.success, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative">
        {/* Geri Butonu */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 left-4 text-gray-600 hover:text-black flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Geri</span>
        </button>

        {/* Logo / Başlık */}
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6 tracking-wide">
          ReloYa
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Müşteri Sadakat Programı • Kayıt Ol
        </p>

        {/* Form */}
        <form
          className="space-y-5"
          action={(formData) =>
            startTransition(() => {
              formAction(formData);
            })
          }
        >
          <input
            type="text"
            name="name"
            placeholder="Adınız"
            required
            minLength={2}
            pattern="[A-Za-zÇĞİÖŞÜçğıöşü'\- ]{2,}"
            title="Ad yalnızca harf, boşluk, kesme işareti ve tire içerebilir."
            className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-400"
          />
          <input
            type="text"
            name="surname"
            placeholder="Soyadınız"
            minLength={2}
            pattern="[A-Za-zÇĞİÖŞÜçğıöşü'\- ]{2,}"
            title="Soyad yalnızca harf, boşluk, kesme işareti ve tire içerebilir."
            className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-400"
          />
          <input
            type="email"
            name="email"
            placeholder="E-posta adresiniz"
            required
            inputMode="email"
            autoComplete="email"
            className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Şifreniz"
            required
            minLength={8}
            pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}"
            title="En az 8 karakter, en az bir harf ve bir rakam içermeli."
            className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isPending ? "⏳ Kayıt olunuyor..." : "Kayıt Ol"}
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
