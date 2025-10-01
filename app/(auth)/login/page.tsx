/** @format */
"use client";

import { loginAction } from "@/actions/auth";
import { useActionState, useTransition } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, {
    success: false,
    message: "",
    user: null,
  });

  const [isPending, startTransition] = useTransition();
  const { user, setUser } = useAuth();
  const router = useRouter();

  // Eğer zaten giriş yapılmışsa → dashboard
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  // Eğer yeni login başarılı olduysa → context güncelle + dashboard
  useEffect(() => {
    if (state.success && state.user) {
      setUser({
        userId: state.user.id, // loginAction'da id dönüyor
        email: state.user.email,
        name: state.user.name,
        surname: state.user.surname,
      });
      router.replace("/dashboard");
    }
  }, [state.success, state.user, setUser, router]);

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

        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6 tracking-wide">
          ReLoya
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Müşteri Sadakat Programı • Giriş Yap
        </p>

        <form
          className="space-y-5"
          action={(formData) => {
            startTransition(() => formAction(formData));
          }}
        >
          <input
            type="email"
            name="email"
            placeholder="E-posta adresiniz"
            className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-400"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Şifreniz"
            className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-400"
            required
          />
          
          {/* Şifremi Unuttum */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="text-sm text-gray-600 hover:text-black font-medium hover:underline"
            >
              Şifremi Unuttum
            </button>
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

        {state.message && (
          <p
            className={`mt-6 text-center font-medium ${
              state.success ? "text-green-600" : "text-red-600"
            }`}
          >
            {state.message}
          </p>
        )}

        {/* Kayıt ol linki */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Hesabınız yok mu?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-black font-semibold hover:underline"
          >
            Kayıt Ol
          </button>
        </div>
      </div>
    </div>
  );
}
