/** @format */
"use client";

import { useState } from "react";
import BackButton from "@/components/company/BackButton";
import CompanyNavbar from "@/components/company/Navbar/Navbar";
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
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <CompanyNavbar />
        <ReportsSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Raporlar yüklenirken hata oluştu ❌
      </div>
    );
  }

  return (
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
        <SummaryCards data={data} />
        {/* Aylık iade grafiği (ALL-TIME) */}
        <MonthlyPointsChart data={data.chartData} filter={filter} />
        {/* Müşteri cashback tablosu (ALL-TIME) */}
        <CustomerPointsTable cashback={data.customerCashback} />
      </div>
    </div>
  );
};

export default ReportsPage;
