/** @format */
"use client";

import React from "react";
import UserQrButton from "@/components/user/UserQRCode";
import { useAuth } from "@/context/AuthContext";
import { getUserDashboard } from "@/actions/userDashboard";
import { UserDashboardData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

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

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Başlık */}
      <h1 className="text-3xl font-bold mb-2">👋 Hoş Geldiniz, {user?.name}</h1>
      <p className="text-gray-400 mb-6">
        Buradan bakiyenizi, işlemlerinizi ve avantajlarınızı takip
        edebilirsiniz.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Toplam Cashback Kartı */}
        <div className="col-span-1 bg-gray-800 rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">💰 Toplam Para Puan</h2>
          <p className="text-4xl font-bold text-green-400">
            {data.totalCashback.toFixed(2)} ₺
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Biriken nakit iadelerinizi dilediğiniz zaman kullanabilirsiniz.
          </p>
        </div>

        {/* İşletmelere Göre Cashback */}
        <div className="col-span-2 bg-gray-800 rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">
            🏢 İşletmelere Göre Nakit İadem
          </h2>
          <div className="space-y-3">
            {data.companyCashback.map((c) => (
              <div
                key={c.companyId}
                className="flex justify-between border-b border-gray-700 pb-2"
              >
                <span>{c.companyName}</span>
                <span className="font-semibold text-green-400">
                  {c.cashback.toFixed(2)} ₺
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alt kısım: Son İşlemler & Kampanyalar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Son İşlemler */}
        <div className="bg-gray-800 rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">📜 Son İşlemler</h2>
          <ul className="space-y-3 text-gray-300 text-sm">
            {data.lastPurchases.length === 0 ? (
              <li className="text-gray-400">Henüz işlem yok.</li>
            ) : (
              data.lastPurchases.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between border-b border-gray-700 pb-2"
                >
                  <span>
                    {p.product} ({p.company})
                  </span>
                  <span
                    className={`${
                      p.cashbackEarned > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {p.cashbackEarned > 0
                      ? `+${p.cashbackEarned.toFixed(2)} ₺`
                      : `${p.cashbackEarned.toFixed(2)} ₺`}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Kampanyalar */}
        <div className="bg-gray-800 rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">🎁 Kampanyalar</h2>
          <div className="space-y-3">
            {data.campaigns.length === 0 ? (
              <p className="text-gray-400 text-sm">Şu anda kampanya yok.</p>
            ) : (
              data.campaigns.map((c) => (
                <div key={c.id} className="p-3 bg-gray-700 rounded">
                  <p className="font-semibold">{c.title}</p>
                  {c.detail && (
                    <p className="text-sm text-gray-300">{c.detail}</p>
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
