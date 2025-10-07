/** @format */
"use client";

import React from "react";
import UserQrButton from "@/components/user/UserQRCode";
import { useAuth } from "@/context/AuthContext";
import { getUserDashboard } from "@/actions/userDashboard";
import { UserDashboardData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/helpers"; // ✅ currency helper import
import { calculateUserBadge, getBadgeStyles } from "@/lib/badge";

const UserDashboard = () => {
  const { user } = useAuth();

  // ✅ React Query ile data çekme
  const { data, isLoading, isError } = useQuery<UserDashboardData | null>({
    queryKey: ["user-dashboard", user?.userId],
    queryFn: async () => {
      if (!user?.userId) return null;
      return await getUserDashboard(user.userId);
    },
    enabled: !!user?.userId,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Yükleniyor...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Veriler yüklenemedi ❌
      </div>
    );
  }

  // Rozet hesaplama (totalEarnings üzerinden)
  const userBadge = calculateUserBadge(data.totalEarnings);
  const badgeStyles = getBadgeStyles(userBadge.currentBadge);

  return (
    <div className="min-h-screen px-3 sm:px-4 lg:px-6 py-4 sm:py-6 text-white">
      {/* Başlık */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
        👋 Hoş Geldiniz,{" "}
        <span className="text-yellow-400">{user?.name ?? "İşletme"}</span>
      </h1>
      <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
        Buradan bakiyenizi, işlemlerinizi ve avantajlarınızı takip
        edebilirsiniz.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* Rozet ve Toplam Cashback Kartı */}
        <div className="lg:col-span-1 bg-gray-800 rounded-xl p-4 sm:p-6 shadow w-full mx-auto">
          {/* Rozet Gösterimi */}
          <div
            className={`${badgeStyles.gradient} rounded-lg p-3 sm:p-4 mb-4 text-center`}
          >
            <div className="text-2xl sm:text-3xl mb-2">{userBadge.currentBadge.icon}</div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {userBadge.currentBadge.name} Üye
            </h3>
            <p className="text-xs sm:text-sm text-white/80">
              {userBadge.nextBadge
                ? `${userBadge.nextBadge.name} seviyesine ${formatCurrency(
                    userBadge.nextBadge.minAmount - data.totalEarnings
                  )} kaldı`
                : "En yüksek seviyedesiniz!"}
            </p>
          </div>

          {/* İlerleme Çubuğu */}
          {userBadge.nextBadge && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{userBadge.currentBadge.name}</span>
                <span>{userBadge.nextBadge.name}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`${badgeStyles.gradient} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${userBadge.progressToNext}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1 text-center">
                %{userBadge.progressToNext} tamamlandı
              </p>
            </div>
          )}

          <h2 className="text-lg sm:text-xl font-semibold mb-2">💰 Toplam Para Puan</h2>
          <p className="text-3xl sm:text-4xl font-bold text-green-400">
            {formatCurrency(data.totalCashback)} {/* ✅ formatlı */}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Biriken para puanlarınızı dilediğiniz zaman kullanabilirsiniz.
          </p>
        </div>

        {/* İşletmelere Göre Cashback */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-4 sm:p-6 shadow w-full mx-auto">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            🏢 İşletmelere Göre Para Puanlarım
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {data.companyCashback.map((c) => (
              <div
                key={c.companyId}
                className="flex justify-between items-center border-b border-gray-700 pb-2"
              >
                <span className="text-sm sm:text-base">{c.companyName}</span>
                <span className="font-semibold text-green-400 text-sm sm:text-base">
                  {formatCurrency(c.cashback)} {/* ✅ formatlı */}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alt kısım: Son İşlemler & Kampanyalar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
        {/* Son İşlemler */}
        {/* Son İşlemler */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">📜 Son İşlemler</h2>
          <ul className="space-y-2 sm:space-y-3 text-gray-300 text-xs sm:text-sm">
            {data.lastPurchases.length === 0 ? (
              <li className="text-gray-400">Henüz işlem yok.</li>
            ) : (
              data.lastPurchases.map((p, i) => (
                <li
                  key={`${p.id}-${i}`}
                  className="flex justify-between items-start border-b border-gray-700 pb-2"
                >
                  <div>
                    {/* Ürün + fiyat */}
                    <span className="block">
                      {p.product}{" "}
                      <span className="text-yellow-400 font-bold">
                        {formatCurrency(p.totalPrice)}
                      </span>
                    </span>
                    {/* İşletme adı ayrı satırda */}
                    <div className="text-blue-400 text-xs mt-1">{p.company}</div>
                  </div>

                  {/* Kazanılan / Harcanan Cashback */}
                  <span
                    className={`text-xs sm:text-sm font-semibold ${
                      p.cashbackEarned > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {p.cashbackEarned > 0
                      ? `+${formatCurrency(p.cashbackEarned)}`
                      : formatCurrency(p.cashbackEarned)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Kampanyalar */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">🎁 Kampanyalar</h2>
          <div className="space-y-2 sm:space-y-3">
            {data.campaigns.length === 0 ? (
              <p className="text-gray-400 text-xs sm:text-sm">Şu anda kampanya yok.</p>
            ) : (
              data.campaigns.map((c) => (
                <div key={c.id} className="p-3 bg-gray-700 rounded">
                  <p className="font-semibold text-sm sm:text-base">{c.title}</p>
                  {c.detail && (
                    <p className="text-xs sm:text-sm text-gray-300">{c.detail}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {c.company.name} •{" "}
                    {new Date(c.startDate).toLocaleDateString()} -{" "}
                    {new Date(c.endDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sağ altta QR kod butonu */}
      <UserQrButton />
    </div>
  );
};

export default UserDashboard;
