/** @format */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanyMiniStatsAction } from "@/actions/companyStats";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { formatCurrency } from "@/lib/helpers";
import Link from "next/link";

export default function CompanyDashboardReport() {
  const { company } = useCompanyAuth();
  const { isPremium, hasActiveSubscription, hasActiveTrial, subscription, trial, isLoading: premiumLoading } = usePremiumStatus();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["company-stats", company?.companyId],
    queryFn: async () => {
      if (!company) return null;
      const res = await getCompanyMiniStatsAction(company.companyId);
      return res.success ? res.stats : null;
    },
    enabled: !!company && isPremium, // Sadece premium kullanıcılar için çalıştır
    staleTime: 1000 * 60 * 5,
    // ✅ Logout sırasında hata ekranı gösterme
    retry: (failureCount, error: unknown) => {
      // 401 Unauthorized ise retry yapma
      const err = error as { status?: number; response?: { status?: number } };
      if (err?.status === 401 || err?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // ✅ Company yoksa loading göster (logout sırasında)
  if (!company) {
    return (
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center animate-spin">
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Oturum Kontrol Ediliyor</h3>
          <p className="text-gray-400 text-sm">Lütfen bekleyin...</p>
        </div>
      </div>
    );
  }

  // Premium yükleme durumu
  if (premiumLoading) {
    return (
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="h-6 bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-700 rounded animate-pulse w-2/3 mx-auto"></div>
        </div>
      </div>
    );
  }

  // ✅ Sadece company varsa premium kontrolü yap
  if (company && !isPremium) {
    return (
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-lg p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-yellow-300 mb-2">Premium Özellik</h3>
            <p className="text-yellow-200 text-sm mb-4">
              Günlük raporları görüntülemek için Premium üyelik gereklidir.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link
              href="/company/profile"
              className="inline-block bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-semibold px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all transform hover:scale-105"
            >
              Premium&apos;a Geç
            </Link>
            
            <div className="text-xs text-yellow-300">
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
    );
  }

  return (
    <div>
      <div className="px-3 sm:px-4 lg:px-6 pt-2">
        <h2 className="text-xl font-bold text-white">📅 Günlük Özet</h2>
        <p className="text-sm text-gray-400 mb-3">
          Bugüne ait müşteri, satış ve iade hareketleri
        </p>
      </div>
      
      {isError ? (
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
            <p className="text-red-400 text-sm">İstatistikler yüklenemedi</p>
          </div>
        </div>
      ) : (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 text-center shadow">
            <p className="text-sm text-gray-400">Müşteri</p>
            {isLoading ? (
              <div className="h-7 bg-gray-700 rounded animate-pulse mt-1"></div>
            ) : (
              <p className="text-xl font-bold text-blue-400">
                {stats?.todayCustomers ?? "-"}
              </p>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 text-center shadow">
            <p className="text-sm text-gray-400">Satış (₺)</p>
            {isLoading ? (
              <div className="h-7 bg-gray-700 rounded animate-pulse mt-1"></div>
            ) : (
              <p className="text-xl font-bold text-green-400">
                {stats ? formatCurrency(stats.todaySales) : "-"}
              </p>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 text-center shadow">
            <p className="text-sm text-gray-400">Nakit İade (₺)</p>
            {isLoading ? (
              <div className="h-7 bg-gray-700 rounded animate-pulse mt-1"></div>
            ) : (
              <p className="text-xl font-bold text-red-400">
                {stats ? formatCurrency(stats.todayCashback) : "-"}
              </p>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 text-center shadow">
            <p className="text-sm text-gray-400">Kullanılan Para Puan (₺)</p>
            {isLoading ? (
              <div className="h-7 bg-gray-700 rounded animate-pulse mt-1"></div>
            ) : (
              <p className="text-xl font-bold text-yellow-400">
                {stats ? formatCurrency(stats.todayUsedCashback) : "-"}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
