/** @format */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Gift, 
  TrendingUp, 
  Building2, 
  Users, 
  Loader2, 
  ArrowRight
} from "lucide-react";
import { checkSession } from "@/actions/auth";
import Image from "next/image";
import PaymentPlanCard from "@/components/PaymentPlanCard";

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Mobile-Optimized Header */}
      <header className="w-full px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/logo_xl_white.webp"
            alt="Reloya Logo"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => handleNavigate("/login")}
            disabled={navigating === "/login"}
            className="px-3 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 hover:border-blue-400/50 hover:text-blue-400 transition-all duration-300 disabled:opacity-70 disabled:cursor-wait flex items-center gap-1 sm:gap-2 backdrop-blur-sm"
          >
            {navigating === "/login" ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                <span className="hidden sm:inline">Yükleniyor...</span>
              </>
            ) : (
              <>
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Kullanıcı Giriş</span>
                <span className="sm:hidden">Giriş</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleNavigate("/company/login")}
            disabled={navigating === "/company/login"}
            className="px-3 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white bg-green-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 hover:border-green-400/50 hover:text-green-400 transition-all duration-300 disabled:opacity-70 disabled:cursor-wait flex items-center gap-1 sm:gap-2 backdrop-blur-sm"
          >
            {navigating === "/company/login" ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                <span className="hidden sm:inline">Yükleniyor...</span>
              </>
            ) : (
              <>
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Şirket Giriş</span>
                <span className="sm:hidden">Şirket</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight">
          Reloya ile Kazanmaya Başla
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 px-2">
          <span className="font-semibold text-white">
            Her yerde, her zaman yanınızda
          </span>
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          Harcamalarınız boşa gitmesin, kazanca dönüşsün. 🎉
        </p>

        {/* CTA Button */}
        <div className="mb-8 sm:mb-12">
          <button
            onClick={() => handleNavigate("/register")}
            disabled={navigating === "/register"}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-base sm:text-lg font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 mx-auto shadow-lg hover:shadow-xl w-full max-w-xs sm:w-auto sm:max-w-none"
          >
            {navigating === "/register" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Yükleniyor...
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                Hemen Ücretsiz Kayıt Ol
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          <div className="flex flex-col items-center text-center p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700 hover:border-gray-600 transition-all">
            <Gift className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Her Harcamadan Puan</h3>
            <p className="text-gray-400">
              Alışveriş yaptıkça ekstra kazanın ve puanlarınızı biriktirin.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700 hover:border-gray-600 transition-all">
            <TrendingUp className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Avantajlı Kullanım</h3>
            <p className="text-gray-400">
              Puanlarınızı dilediğiniz yerde harcayın ve tasarruf edin.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700 hover:border-gray-600 transition-all">
            <Sparkles className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sürpriz Kampanyalar</h3>
            <p className="text-gray-400">
              Sadece size özel fırsatlarla daha fazla kazanın.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
    {/* <PaymentPlanCard /> */}

      {/* CTA Section */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Hemen Başla, Kazanmaya Başla!
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Binlerce kullanıcıya katılın ve harcamalarınızdan kazançlı çıkın
          </p>
          
          {/* User CTA */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-4 text-blue-400">👤 Kullanıcı Olarak</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleNavigate("/login")}
                disabled={navigating === "/login"}
                className="px-8 py-4 border border-blue-500 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 text-lg font-semibold"
              >
                {navigating === "/login" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Kullanıcı Giriş
                  </>
                )}
              </button>
              <button
                onClick={() => handleNavigate("/register")}
                disabled={navigating === "/register"}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 text-lg font-semibold"
              >
                {navigating === "/register" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Kullanıcı Kayıt
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Company CTA */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 rounded-2xl p-8 border border-green-500/20">
            <h3 className="text-2xl font-semibold mb-4 text-green-400">🏢 Şirket Olarak</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Müşterilerinize sadakat kazandırın, onları mutlu edin ve işletmenizi büyütün. 
              Reloya ile müşteri sadakat programınızı başlatın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleNavigate("/company/login")}
                disabled={navigating === "/company/login"}
                className="px-8 py-4 border border-green-500 text-green-400 rounded-lg hover:bg-green-500 hover:text-white active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 text-lg font-semibold"
              >
                {navigating === "/company/login" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Building2 className="w-5 h-5" />
                    Şirket Giriş
                  </>
                )}
              </button>
              <button
                onClick={() => handleNavigate("/company/register")}
                disabled={navigating === "/company/register"}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 text-lg font-semibold shadow-lg"
              >
                {navigating === "/company/register" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Building2 className="w-5 h-5" />
                    Şirket Kayıt
                    <ArrowRight className="w-5 h-5" />
                  </>
              )}
            </button>
          </div>
        </div>
      </div>
      </section>
    </div>
  );
}
