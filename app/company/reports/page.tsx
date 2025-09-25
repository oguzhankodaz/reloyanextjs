/** @format */
"use client";

import BackButton from "@/components/company/BackButton";
import CompanyNavbar from "@/components/company/Navbar/Navbar";
import { useQuery } from "@tanstack/react-query";
import { getReportData } from "@/actions/companyStats";
import { ReportData } from "@/lib/types";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import SummaryCards from "./SummaryCards";
import CustomerPointsTable from "./CustomerPointsTable";
import MonthlyPointsChart from "./MonthlyPointsChart";

const ReportsPage = () => {
  const { company } = useCompanyAuth();

  const { data, isLoading, isError } = useQuery<ReportData>({
    queryKey: ["reports", company?.companyId],
    queryFn: async () => {
      if (!company?.companyId) throw new Error("Şirket bulunamadı");
      return await getReportData(company.companyId);
    },
    enabled: !!company?.companyId,
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
        Yükleniyor ⏳
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

        <SummaryCards data={data} />
        <CustomerPointsTable points={data.customerPoints} />
        <MonthlyPointsChart data={data.monthlyPoints} />
      </div>
    </div>
  );
};

export default ReportsPage;
