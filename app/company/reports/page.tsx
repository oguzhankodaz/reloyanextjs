/** @format */
"use client";

import { useState } from "react";
import BackButton from "@/components/company/BackButton";
import CompanyNavbar from "@/components/company/Navbar/Navbar";
import PremiumGuard from "@/components/company/PremiumGuard";
import { useQuery } from "@tanstack/react-query";
import { getReportData } from "@/actions/companyStats";
import { ReportData, ReportFilter } from "@/lib/types";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import SummaryCards from "./SummaryCards";
import CustomerPointsTable from "./CustomerPointsTable";
import MonthlyPointsChart from "./MonthlyPointsChart";
import ReportsSkeleton from "./ReportsSkeleton";

const ReportsPage = () => {
  const { company } = useCompanyAuth();

  // ✅ Yalnızca SummaryCards'ı etkileyecek filtre
  const [filter, setFilter] = useState<ReportFilter>("month");

  const { data, isLoading, isError } = useQuery<ReportData>({
    queryKey: ["reports", company?.companyId, filter], // filtre anahtara dahil
    queryFn: async () => {
      if (!company?.companyId) throw new Error("Şirket bulunamadı");
      // ✅ Backend filtreli özet döner; tablo ve grafik ALL-TIME kalır
      return await getReportData(company.companyId, filter);
    },
    enabled: !!company?.companyId,
    staleTime: 1000 * 60 * 10,
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
      <div className="min-h-screen text-white">
        <CompanyNavbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center animate-spin">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Oturum Kontrol Ediliyor</h3>
            <p className="text-gray-400 text-sm">Lütfen bekleyin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen  text-white">
        <CompanyNavbar />
        <ReportsSkeleton />
      </div>
    );
  }

  // ✅ Sadece gerçek hatalar için error state göster
  if (isError && company) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Raporlar yüklenirken hata oluştu ❌
      </div>
    );
  }

  return (
    <PremiumGuard featureName="Raporlar ve Analizler">
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <CompanyNavbar />
        <div className="p-6">
          <BackButton />
          <h1 className="text-2xl font-bold mb-6 mt-4">📊 Raporlar</h1>

          {/* 🔹 Filtre (sadece SummaryCards verisini etkiler) */}
          <div className="flex gap-3 mb-6">
            {[
              { key: "day", label: "Gün" },
              { key: "month", label: "Ay" },
              { key: "year", label: "Yıl" },
              { key: "all", label: "Tüm Zamanlar" },
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key as ReportFilter)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === (btn.key as ReportFilter)
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Özet kartlar (filtreli) */}
          {data && <SummaryCards data={data} />}
          {/* Aylık iade grafiği (ALL-TIME) */}
          {data && <MonthlyPointsChart data={data.chartData} filter={filter} />}
          {/* Müşteri cashback tablosu (ALL-TIME) */}
          {data && <CustomerPointsTable cashback={data.customerCashback} />}
        </div>
      </div>
    </PremiumGuard>
  );
};

export default ReportsPage;
