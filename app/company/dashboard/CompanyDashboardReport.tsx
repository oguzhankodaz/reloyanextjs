"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanyStatsAction } from "@/actions/companyStats";
import { useCompanyAuth } from "@/context/CompanyAuthContext";

export default function CompanyDashboardReport() {
  const { company } = useCompanyAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["company-stats", company?.companyId],
    queryFn: async () => {
      if (!company) return null;
      const res = await getCompanyStatsAction(company.companyId);
      return res.success ? res.stats : null;
    },
    enabled: !!company,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <p className="p-4 text-gray-400">Yükleniyor...</p>;
  }

  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4">
      <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
        <p className="text-sm text-gray-400">Toplam Müşteri</p>
        <p className="text-xl font-bold">{stats?.totalCustomers ?? "-"}</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
        <p className="text-sm text-gray-400">Bugünkü Satış (₺)</p>
        <p className="text-xl font-bold">
          {stats ? stats.todaySales.toFixed(2) : "-"} ₺
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
        <p className="text-sm text-gray-400">Toplam Nakit İade (₺)</p>
        <p className="text-xl font-bold">
          {stats ? stats.totalCashback.toFixed(2) : "-"} ₺
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
        <p className="text-sm text-gray-400">Ürün Sayısı</p>
        <p className="text-xl font-bold">{stats?.productCount ?? "-"}</p>
      </div>
    </section>
  );
}
