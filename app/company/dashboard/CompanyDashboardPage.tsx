/** @format */
"use client";

import CompanyNavbar from "@/components/company/Navbar/Navbar";
import { Package, Users, BarChart2, UserCog, Settings, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import CompanyDashboardReport from "./CompanyDashboardReport";

const CompanyDashboard = () => {
  const router = useRouter();
  const { company } = useCompanyAuth();
  const [navigating, setNavigating] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    setNavigating(path);
    router.push(path);
  };

  return (
    <div className="min-h-screen p-6 text-white flex flex-col">
      <CompanyNavbar />

      {/* İşletme Adı */}
      <section className="p-6">
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
      <main className="flex-1 p-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ürünler */}
        <button
          onClick={() => handleNavigate("/company/products")}
          disabled={navigating === "/company/products"}
          className="cursor-pointer bg-white text-black rounded-xl p-6 flex flex-col items-center shadow hover:scale-105 active:scale-95 transition-all w-full disabled:opacity-70 disabled:cursor-wait"
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
          className="cursor-pointer bg-white text-black rounded-xl p-6 flex flex-col items-center shadow hover:scale-105 active:scale-95 transition-all w-full disabled:opacity-70 disabled:cursor-wait"
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
          className="cursor-pointer bg-white text-black rounded-xl p-6 flex flex-col items-center shadow hover:scale-105 active:scale-95 transition-all w-full disabled:opacity-70 disabled:cursor-wait"
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
          className="cursor-pointer bg-white text-black rounded-xl p-6 flex flex-col items-center shadow hover:scale-105 active:scale-95 transition-all w-full disabled:opacity-70 disabled:cursor-wait"
        >
          {navigating === "/company/staff" ? (
            <>
              <Loader2 className="w-10 h-10 mb-3 text-purple-500 animate-spin" />
              <span className="font-medium text-base">Yükleniyor...</span>
            </>
          ) : (
            <>
              <UserCog className="w-10 h-10 mb-3 text-purple-500" />
              <span className="font-medium text-base">Personel İşlemleri</span>
            </>
          )}
        </button>

   
      </main>

      <span className="h-px w-full bg-gray-700 block"></span>

      {/* Duyurular */}
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
    </div>
  );
};

export default CompanyDashboard;
