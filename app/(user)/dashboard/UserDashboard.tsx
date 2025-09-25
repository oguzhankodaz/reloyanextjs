/** @format */
"use client";

import React from "react";
import UserQrButton from "@/components/user/UserQRCode";
import { useAuth } from "@/context/AuthContext";
import { getUserDashboard } from "@/actions/userDashboard";
import { UserDashboardData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

const UserDashboard  = () => {
  const { user } = useAuth();

  // ✅ React Query ile data çekme
  const { data, isLoading, isError } = useQuery<UserDashboardData | null>({
    queryKey: ["user-dashboard", user?.userId],
    queryFn: async () => {
      if (!user?.userId) return null; // ✅ null dönebiliyor
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
        Buradan puanlarınızı, işlemlerinizi ve avantajlarınızı takip
        edebilirsiniz.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Toplam Puan Kartı */}
        <div className="col-span-1 bg-gray-800 rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">⭐ Toplam Puanınız</h2>
          <p className="text-4xl font-bold text-yellow-400">
            {data.totalPoints}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            5000 puanda özel ödül sizi bekliyor!
          </p>
          <div className="w-full bg-gray-700 h-3 rounded mt-4">
            <div
              className="bg-yellow-400 h-3 rounded"
              style={{ width: `${(data.totalPoints / 5000) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* İşletmelere Göre Puan */}
        <div className="col-span-2 bg-gray-800 rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">
            🏢 İşletmelere Göre Puanlarım
          </h2>
          <div className="space-y-3">
            {data.companyPoints.map((c) => (
              <div key={c.companyId} className="flex justify-between">
                <span>{c.companyName}</span>
                <span className="font-semibold text-green-400">{c.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alt kısım: Son İşlemler & Kampanyalar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Son İşlemler */}
        <div className="bg-gray-800 rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">
            📜 Son Kazanılan Puanlar
          </h2>
          <ul className="space-y-3 text-gray-300 text-sm">
            {data.lastPurchases.map((p) => (
              <li
                key={p.id}
                className="flex justify-between border-b border-gray-700 pb-2"
              >
                <span>
                  {p.product} ({p.company})
                </span>
                <span className="text-green-400">+{p.points} puan</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Kampanyalar */}
        <div className="bg-gray-800 rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">🎁 Kampanyalar</h2>
          <div className="space-y-3">
            {data.campaigns.map((c) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Sağ altta QR kod butonu */}
      <UserQrButton />
    </div>
  );
};

export default UserDashboard ;
