/** @format */
"use client";

import CompanyNavbar from "@/components/company/Navbar/Navbar";
import { Package, Users, BarChart2, UserCog, Settings, Loader2, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import CompanyDashboardReport from "./CompanyDashboardReport";
import { QRGenerator } from "./QRGenerator";

const CompanyDashboard = () => {
  const router = useRouter();
  const { company } = useCompanyAuth();
  const [navigating, setNavigating] = useState<string | null>(null);
  const [showQRGenerator, setShowQRGenerator] = useState(false);

  const handleNavigate = (path: string) => {
    setNavigating(path);
    router.push(path);
  };

  return (
    <div className="min-h-screen px-3 sm:px-4 lg:px-6 py-4 sm:py-6 text-white flex flex-col">
      <CompanyNavbar />

      {/* İşletme Adı */}
      <section className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <h1 className="text-2xl font-bold">
          👋 Hoş geldiniz,{" "}
          <span className="text-yellow-400">{company?.name ?? "İşletme"}</span>
        </h1>
      </section>

      <span className="h-px w-full bg-gray-700 block"></span>

      {/* Üstte hızlı istatistikler */}
      <CompanyDashboardReport />
      <span className="h-px w-full bg-gray-700 block"></span>

      {/* Ana Menü */}
      <main className="flex-1 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {/* Ürünler */}
        <button
          onClick={() => handleNavigate("/company/products")}
          disabled={navigating === "/company/products"}
          className="cursor-pointer bg-white text-black rounded-xl p-4 sm:p-5 lg:p-6 flex flex-col items-center shadow hover:scale-105 active:scale-95 transition-all w-full disabled:opacity-70 disabled:cursor-wait"
        >
          {navigating === "/company/products" ? (
            <>
              <Loader2 className="w-10 h-10 mb-3 text-yellow-500 animate-spin" />
              <span className="font-medium text-base">Yükleniyor...</span>
            </>
          ) : (
            <>
              <Package className="w-10 h-10 mb-3 text-yellow-500" />
              <span className="font-medium text-base">Ürün İşlemleri</span>
            </>
          )}
        </button>

        {/* Müşteriler */}
        <button
          onClick={() => handleNavigate("/company/customers")}
          disabled={navigating === "/company/customers"}
          className="cursor-pointer bg-white text-black rounded-xl p-4 sm:p-5 lg:p-6 flex flex-col items-center shadow hover:scale-105 active:scale-95 transition-all w-full disabled:opacity-70 disabled:cursor-wait"
        >
          {navigating === "/company/customers" ? (
            <>
              <Loader2 className="w-10 h-10 mb-3 text-green-500 animate-spin" />
              <span className="font-medium text-base">Yükleniyor...</span>
            </>
          ) : (
            <>
              <Users className="w-10 h-10 mb-3 text-green-500" />
              <span className="font-medium text-base">Müşterilerim</span>
            </>
          )}
        </button>

        {/* Raporlar */}
        <button
          onClick={() => handleNavigate("/company/reports")}
          disabled={navigating === "/company/reports"}
          className="cursor-pointer bg-white text-black rounded-xl p-4 sm:p-5 lg:p-6 flex flex-col items-center shadow hover:scale-105 active:scale-95 transition-all w-full disabled:opacity-70 disabled:cursor-wait"
        >
          {navigating === "/company/reports" ? (
            <>
              <Loader2 className="w-10 h-10 mb-3 text-blue-500 animate-spin" />
              <span className="font-medium text-base">Yükleniyor...</span>
            </>
          ) : (
            <>
              <BarChart2 className="w-10 h-10 mb-3 text-blue-500" />
              <span className="font-medium text-base">Raporlar</span>
            </>
          )}
        </button>

        {/* Personel İşlemleri */}
        <button
          onClick={() => handleNavigate("/company/staff")}
          disabled={navigating === "/company/staff"}
          className="cursor-pointer bg-white text-black rounded-xl p-4 sm:p-5 lg:p-6 flex flex-col items-center shadow hover:scale-105 active:scale-95 transition-all w-full disabled:opacity-70 disabled:cursor-wait"
        >
          {navigating === "/company/staff" ? (
            <>
              <Loader2 className="w-10 h-10 mb-3 text-purple-500 animate-spin" />
              <span className="font-medium text-base">Yükleniyor...</span>
            </>
          ) : (
            <>
              <UserCog className="w-10 h-10 mb-3 text-purple-500" />
              <span className="font-medium text-base">Personel</span>
            </>
          )}
        </button>

        {/* QR İşlemleri */}
        <button
          onClick={() => setShowQRGenerator(true)}
          className="cursor-pointer bg-white text-black rounded-xl p-4 sm:p-5 lg:p-6 flex flex-col items-center shadow hover:scale-105 active:scale-95 transition-all w-full"
        >
          <QrCode className="w-10 h-10 mb-3 text-orange-500" />
          <span className="font-medium text-base">QR İşlemleri</span>
        </button>
      </main>

      <span className="h-px w-full bg-gray-700 block"></span>

      {/* Duyurular */}
      <section className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">📢 Şirket Duyuruları</h2>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>☕ Bu hafta kahve ürünlerinde çift puan kampanyası başladı!</li>
            <li>📊 Yeni raporlama ekranı eklendi.</li>
            <li>🎉 Sadakat programımız 500 müşteriyle büyüyor.</li>
          </ul>
        </div>
      </section>

      {/* QR Generator Modal */}
      {showQRGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Menü QR Kodu</h2>
              <button
                onClick={() => setShowQRGenerator(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <QRGenerator />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
