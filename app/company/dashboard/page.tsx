/** @format */
"use client";

import CompanyNavbar from "@/components/company/Navbar/Navbar";
import QRReader from "@/components/company/QrReader";
import { QrCode, Package, Users, BarChart2 } from "lucide-react";
import { useRouter } from "next/navigation";

const CompanyDashboard = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col">
      <CompanyNavbar />

      {/* Üstte hızlı istatistikler */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
          <p className="text-sm text-gray-400">Toplam Müşteri</p>
          <p className="text-xl font-bold">120</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
          <p className="text-sm text-gray-400">Bugünkü Satış</p>
          <p className="text-xl font-bold">32</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
          <p className="text-sm text-gray-400">Toplam Puan</p>
          <p className="text-xl font-bold">15,240</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
          <p className="text-sm text-gray-400">Ürün Sayısı</p>
          <p className="text-xl font-bold">58</p>
        </div>
      </section>

      {/* Ana Menü */}
      <main className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ürünler */}
        <div
          onClick={() => router.push("/company/products")}
          className="cursor-pointer bg-white text-black rounded-xl p-6 flex flex-col items-center shadow hover:scale-105 transition w-full"
        >
          <Package className="w-10 h-10 mb-3 text-yellow-500" />
          <span className="font-medium text-base">Ürün İşlemleri</span>
        </div>

        {/* Müşteriler */}
        <div
          onClick={() => router.push("/company/customers")}
          className="cursor-pointer bg-white text-black rounded-xl p-6 flex flex-col items-center shadow hover:scale-105 transition w-full"
        >
          <Users className="w-10 h-10 mb-3 text-green-500" />
          <span className="font-medium text-base">Müşterilerim</span>
        </div>

        {/* Raporlar */}
        <div
          onClick={() => router.push("/company/reports")}
          className="cursor-pointer bg-white text-black rounded-xl p-6 flex flex-col items-center shadow hover:scale-105 transition w-full"
        >
          <BarChart2 className="w-10 h-10 mb-3 text-blue-500" />
          <span className="font-medium text-base">Raporlar</span>
        </div>
      </main>

      {/* Duyuru / Öneriler */}
      <section className="p-6">
        <div className="bg-gray-800 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">📢 Şirket Duyuruları</h2>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>☕ Bu hafta kahve ürünlerinde çift puan kampanyası başladı!</li>
            <li>📊 Yeni raporlama ekranı eklendi.</li>
            <li>🎉 Sadakat programımız 500 müşteriyle büyüyor.</li>
          </ul>
        </div>
      </section>

      {/* QR Okutma Butonu */}
      <QRReader />
    </div>
  );
};

export default CompanyDashboard;
