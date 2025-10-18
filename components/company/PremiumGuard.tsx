/** @format */

"use client";

import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

interface PremiumGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  featureName?: string;
  showBackButton?: boolean;
}

export default function PremiumGuard({ 
  children, 
  fallback,
  featureName = "Bu özellik",
  showBackButton = true
}: PremiumGuardProps) {
  const { isPremium, hasActiveSubscription, hasActiveTrial, subscription, trial, isLoading } = usePremiumStatus();
  const router = useRouter();

  // Yükleme durumu
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full animate-pulse mx-auto mb-4"></div>
          <div className="h-4 bg-gray-700 rounded animate-pulse w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Premium değilse
  if (!isPremium) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
        {/* Geri Tuşu */}
        {showBackButton && (
          <div className="container mx-auto px-4 pt-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-gray-400 hover:text-yellow-400 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Geri Dön</span>
            </button>
          </div>
        )}
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🔒</span>
              </div>
              <h1 className="text-4xl font-bold text-yellow-300 mb-4">Premium Özellik</h1>
              <p className="text-xl text-gray-300 mb-6">
                {featureName} için Premium üyelik gereklidir.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Premium Avantajları</h2>
              <ul className="space-y-3 text-left text-gray-300">
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Detaylı raporlar ve analizler
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Müşteri yönetimi ve takibi
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Gelişmiş istatistikler
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Personel yönetimi
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <Link
                href="/company/profile"
                className="inline-block bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-bold px-8 py-4 rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all transform hover:scale-105 text-lg"
              >
                Premium'a Geç
              </Link>
              
              <div className="text-sm text-gray-400">
                {hasActiveTrial ? (
                  <span>Deneme süreniz: {trial?.daysLeft} gün kaldı</span>
                ) : hasActiveSubscription ? (
                  <span>Aboneliğiniz: {subscription ? Math.ceil((new Date(subscription.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} gün kaldı</span>
                ) : (
                  <span>7 günlük deneme sürenizi başlatın</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Premium ise içeriği göster
  return <>{children}</>;
}
