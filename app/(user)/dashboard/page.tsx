/** @format */
"use client";

import React, { useState, useEffect } from "react";
import UserQrButton from "@/components/user/UserQRCode";

const DashboardPage = () => {
  const [userName, setUserName] = useState("");

  // localStorage erişimi sadece client tarafında ve effect içinde yapılmalı
  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const user = JSON.parse(userRaw);
      setUserName(user.name);
    }
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Başlık */}
      <h1 className="text-3xl font-bold mb-2">👋 Hoş Geldiniz, {userName}</h1>
      <p className="text-gray-400 mb-6">
        Buradan puanlarınızı, işlemlerinizi ve avantajlarınızı takip edebilirsiniz.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Toplam Puan Kartı */}
        <div className="col-span-1 bg-gray-800 rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">⭐ Toplam Puanınız</h2>
          <p className="text-4xl font-bold text-yellow-400">214</p>
          <p className="text-sm text-gray-400 mt-2">
            5000 puanda özel ödül sizi bekliyor!
          </p>
          <div className="w-full bg-gray-700 h-3 rounded mt-4">
            <div className="bg-yellow-400 h-3 rounded w-1/5"></div>
          </div>
        </div>

        {/* İşletmelere Göre Puan */}
        <div className="col-span-2 bg-gray-800 rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">🏢 İşletmelere Göre Puanlarım</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Kahve Dükkanı</span>
              <span className="font-semibold text-green-400">1200</span>
            </div>
            <div className="flex justify-between">
              <span>Marketim</span>
              <span className="font-semibold text-green-400">800</span>
            </div>
            <div className="flex justify-between">
              <span>Kitapçı</span>
              <span className="font-semibold text-green-400">450</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alt kısım: Son İşlemler & Kampanyalar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Son İşlemler */}
        <div className="bg-gray-800 rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">📜 Son İşlemlerim</h2>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex justify-between border-b border-gray-700 pb-2">
              <span>Latte Kahve</span>
              <span>+50 puan</span>
            </li>
            <li className="flex justify-between border-b border-gray-700 pb-2">
              <span>Kitap Alımı</span>
              <span>+120 puan</span>
            </li>
            <li className="flex justify-between">
              <span>Market Alışverişi</span>
              <span>+200 puan</span>
            </li>
          </ul>
        </div>

        {/* Kampanyalar */}
        <div className="bg-gray-800 rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">🎁 Kampanyalar</h2>
          <div className="space-y-3">
            <div className="p-3 bg-gray-700 rounded">
              ☕ Kahve Dükkanı’nda bu hafta 2x puan!
            </div>
            <div className="p-3 bg-gray-700 rounded">
              📚 Kitapçı’dan 200 TL üzeri alışverişe +300 puan!
            </div>
            <div className="p-3 bg-gray-700 rounded">
              🛒 Marketim’den hafta sonuna özel %10 indirim.
            </div>
          </div>
        </div>
      </div>

      {/* Sağ altta QR kod butonu */}
      <UserQrButton />
    </div>
  );
};

export default DashboardPage;
