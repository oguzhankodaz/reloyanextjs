/** @format */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Check,
  Star,
  Zap,
  Crown,
  ArrowRight,
  Shield,
  Headphones,
  BarChart3,
} from "lucide-react";

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
      "Temel raporlama",
    ],
    popular: false,
    icon: Zap,
    color: "from-blue-500 to-purple-600",
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
      "2 aylık ücretsiz kullanım",
    ],
    popular: true,
    icon: Star,
    color: "from-yellow-500 to-orange-600",
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
      "Özel indirim kuponları",
    ],
    popular: false,
    icon: Crown,
    color: "from-purple-500 to-pink-600",
  },
];

export default function PaymentPlanCard() {
  const router = useRouter();
  const [navigating, setNavigating] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    setNavigating(path);
    router.push(path);
  };

  return (
    <section className="px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          İşletmeler İçin Fiyatlandırma Planları
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          İhtiyacınıza uygun planı seçin ve Reloya&apos;nın tüm avantajlarından
          yararlanın
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {pricingPlans.map((plan) => {
          const IconComponent = plan.icon;
          return (
            <div
              key={plan.name}
              className={`relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? "border-yellow-500 shadow-2xl shadow-yellow-500/20"
                  : "border-gray-700 hover:border-gray-600"
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
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">€{plan.price}</span>
                  <span className="text-gray-400">/{plan.period}</span>
                </div>
                {plan.originalPrice && (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-lg text-gray-400 line-through">
                      €{plan.originalPrice}
                    </span>
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
                    ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-black hover:from-yellow-600 hover:to-orange-700"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
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
  );
}

