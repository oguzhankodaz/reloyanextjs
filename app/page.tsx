/** @format */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Gift, TrendingUp, Building2, Users, Loader2 } from "lucide-react";
import { checkSession } from "@/actions/auth";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const [navigating, setNavigating] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const session = await checkSession();

      if (session?.type === "user") {
        router.replace("/dashboard"); // müşteri
      } else if (session?.type === "company") {
        router.replace("/company/dashboard"); // şirket
      }
    })();
  }, [router]);

  const handleNavigate = (path: string) => {
    setNavigating(path);
    router.push(path);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white px-6 pt-8 pb-4">
      {/* Slogan */}
      <h1 className="text-5xl font-extrabold text-center mb-4 tracking-tight">
        <Image
          src="/logo_xl_white.webp"
          alt="ReloYa Logo"
          width={200} // istediğin boyuta göre ayarla
          height={66} // orantılı yükseklik
          className="mx-auto"
          priority
        />
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
          <h2 className="text-2xl font-bold mb-2">Kullanıcı</h2>
          <p className="text-gray-600 text-center mb-6">
            Puan toplayın, fırsatları yakalayın, harcamalarınızdan kazançlı
            çıkın.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => handleNavigate("/login")}
              disabled={navigating === "/login"}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center gap-2"
            >
              {navigating === "/login" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </button>
            <button
              onClick={() => handleNavigate("/register")}
              disabled={navigating === "/register"}
              className="px-6 py-2 border border-black text-black rounded-lg hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center gap-2"
            >
              {navigating === "/register" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                "Kayıt Ol"
              )}
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
              onClick={() => handleNavigate("/company/login")}
              disabled={navigating === "/company/login"}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center gap-2"
            >
              {navigating === "/company/login" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </button>
            <button
              onClick={() => handleNavigate("/company/register")}
              disabled={navigating === "/company/register"}
              className="px-6 py-2 border border-black text-black rounded-lg hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center gap-2"
            >
              {navigating === "/company/register" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                "Kayıt Ol"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
