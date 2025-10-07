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
  Check, 
  Star,
  Zap,
  Crown,
  ArrowRight,
  Shield,
  Headphones,
  BarChart3
} from "lucide-react";
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

  const pricingPlans = [
    {
      name: "Aylık",
      price: "19.99",
      period: "ay",
      originalPrice: null,
      discount: null,
      features: [
        "Sınırsız puan kazanma",
        "Tüm işletmelerde geçerli",
        "7/24 müşteri desteği",
        "Mobil uygulama erişimi",
        "Temel raporlama"
      ],
      popular: false,
      icon: Zap,
      color: "from-blue-500 to-purple-600"
    },
    {
      name: "6 Aylık",
      price: "99.99",
      period: "6 ay",
      originalPrice: "119.94",
      discount: "17%",
      features: [
        "Aylık planın tüm özellikleri",
        "Öncelikli müşteri desteği",
        "Gelişmiş raporlama",
        "Özel kampanya bildirimleri",
        "2 aylık ücretsiz kullanım"
      ],
      popular: true,
      icon: Star,
      color: "from-yellow-500 to-orange-600"
    },
    {
      name: "Yıllık",
      price: "179.99",
      period: "yıl",
      originalPrice: "239.88",
      discount: "25%",
      features: [
        "6 aylık planın tüm özellikleri",
        "VIP müşteri desteği",
        "Premium raporlama ve analitik",
        "Özel etkinlik davetleri",
        "5 aylık ücretsiz kullanım",
        "Özel indirim kuponları"
      ],
      popular: false,
      icon: Crown,
      color: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Mobile-Optimized Header */}
      <header className="w-full px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          {/* Mobile Logo */}
          <Image
            src="/logo_xs_white.webp"
            alt="Reloya Logo"
            width={80}
            height={30}
            className="h-6 w-auto sm:hidden"
            priority
          />
          {/* Desktop Logo */}
          <Image
            src="/logo_xl_white.webp"
            alt="Reloya Logo"
            width={120}
            height={40}
            className="h-8 w-auto hidden sm:block"
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
      <section className="text-center px-6 py-12">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Reloya ile Kazanmaya Başla
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
          <span className="font-semibold text-white">
            Her yerde, her zaman yanınızda
          </span>
          . <br />
          Harcamalarınız boşa gitmesin, kazanca dönüşsün. 🎉
        </p>

        {/* CTA Button */}
        <div className="mb-12">
          <button
            onClick={() => handleNavigate("/register")}
            disabled={navigating === "/register"}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 mx-auto shadow-lg hover:shadow-xl"
          >
            {navigating === "/register" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Yükleniyor...
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                Hemen Kayıt Ol
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
      <section className="px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Fiyatlandırma Planları
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            İhtiyacınıza uygun planı seçin ve Reloya&apos;nın tüm avantajlarından yararlanın
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'border-yellow-500 shadow-2xl shadow-yellow-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-black px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      En Popüler
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">€{plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-lg text-gray-400 line-through">€{plan.originalPrice}</span>
                      <span className="bg-green-500 text-black px-2 py-1 rounded-full text-sm font-bold">
                        {plan.discount} İndirim
                      </span>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleNavigate("/register")}
                  disabled={navigating === "/register"}
                  className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-black hover:from-yellow-600 hover:to-orange-700'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                  } disabled:opacity-70 disabled:cursor-wait`}
                >
                  {navigating === "/register" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      Planı Seç
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Additional Benefits */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-8">Tüm Planlarda Dahil</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-4">
              <Shield className="w-8 h-8 text-blue-400 mb-2" />
              <span className="text-sm text-gray-300">Güvenli Ödeme</span>
            </div>
            <div className="flex flex-col items-center p-4">
              <Headphones className="w-8 h-8 text-green-400 mb-2" />
              <span className="text-sm text-gray-300">7/24 Destek</span>
            </div>
            <div className="flex flex-col items-center p-4">
              <BarChart3 className="w-8 h-8 text-purple-400 mb-2" />
              <span className="text-sm text-gray-300">Detaylı Raporlar</span>
            </div>
            <div className="flex flex-col items-center p-4">
              <Zap className="w-8 h-8 text-yellow-400 mb-2" />
              <span className="text-sm text-gray-300">Anında Aktivasyon</span>
            </div>
          </div>
        </div>
      </section>

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
