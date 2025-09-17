/** @format */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Gift, TrendingUp, Building2, Users } from "lucide-react"; // ikonlar

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedCompany = localStorage.getItem("company");

    if (storedUser) {
      router.replace("/dashboard"); // müşteri dashboard
    } else if (storedCompany) {
      router.replace("/company/dashboard"); // şirket dashboard
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 pt-8">
      {/* Slogan */}
      <h1 className="text-5xl font-extrabold text-center mb-4 tracking-tight">
        ReloYa
      </h1>
      <p className="text-lg sm:text-xl text-gray-300 text-center max-w-2xl mb-10">
        <span className="font-semibold text-white">
          Her yerde, her zaman yanınızda
        </span>
        . <br />
        Harcamalarınız boşa gitmesin, kazanca dönüşsün. 🎉
      </p>

      {/* Özellikler */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mb-14">
        <div className="flex flex-col items-center text-center p-4">
          <Gift className="w-10 h-10 text-yellow-400 mb-3" />
          <h3 className="font-semibold">Her Harcamadan Puan</h3>
          <p className="text-sm text-gray-400">
            Alışveriş yaptıkça ekstra kazanın.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-4">
          <TrendingUp className="w-10 h-10 text-green-400 mb-3" />
          <h3 className="font-semibold">Avantajlı Kullanım</h3>
          <p className="text-sm text-gray-400">
            Puanlarınızı dilediğiniz yerde harcayın.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-4">
          <Sparkles className="w-10 h-10 text-purple-400 mb-3" />
          <h3 className="font-semibold">Sürpriz Kampanyalar</h3>
          <p className="text-sm text-gray-400">
            Sadece size özel fırsatlarla daha fazla kazanın.
          </p>
        </div>
      </div>

      {/* Seçenekler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Müşteri */}
        <div className="bg-white text-black rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 transition-transform">
          <Users className="w-10 h-10 text-black mb-4" />
          <h2 className="text-2xl font-bold mb-2">Müşteri</h2>
          <p className="text-gray-600 text-center mb-6">
            Puan toplayın, fırsatları yakalayın, harcamalarınızdan kazançlı
            çıkın.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Giriş Yap
            </button>
            <button
              onClick={() => router.push("/register")}
              className="px-6 py-2 border border-black text-black rounded-lg hover:bg-gray-100"
            >
              Kayıt Ol
            </button>
          </div>
        </div>

        {/* Şirket */}
        <div className="bg-white text-black rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 transition-transform">
          <Building2 className="w-10 h-10 text-black mb-4" />
          <h2 className="text-2xl font-bold mb-2">Şirket</h2>
          <p className="text-gray-600 text-center mb-6">
            Müşterilerinize sadakat kazandırın, onları mutlu edin.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/company/login")}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Giriş Yap
            </button>
            <button
              onClick={() => router.push("/company/register")}
              className="px-6 py-2 border border-black text-black rounded-lg hover:bg-gray-100"
            >
              Kayıt Ol
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
