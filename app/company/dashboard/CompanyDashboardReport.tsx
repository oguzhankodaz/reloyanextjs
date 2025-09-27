/** @format */

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCompanyMiniStatsAction,
  getCompanyStatsAction,
} from "@/actions/companyStats";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import { formatCurrency } from "@/lib/helpers";

export default function CompanyDashboardReport() {
  const { company } = useCompanyAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["company-stats", company?.companyId],
    queryFn: async () => {
      if (!company) return null;
      const res = await getCompanyMiniStatsAction(company.companyId);
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
    <p className="text-sm text-gray-400">Bugünkü Müşteri</p>
    <p className="text-xl font-bold text-blue-400">{stats?.todayCustomers ?? "-"}</p>
  </div>

  <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
    <p className="text-sm text-gray-400">Bugünkü Satış (₺)</p>
    <p className="text-xl font-bold text-green-400">
      {stats ? formatCurrency(stats.todaySales) : "-"}
    </p>
  </div>

  <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
    <p className="text-sm text-gray-400">Bugünkü Nakit İade (₺)</p>
    <p className="text-xl font-bold text-red-400">
      {stats ? formatCurrency(stats.todayCashback) : "-"}
    </p>
  </div>

  <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
    <p className="text-sm text-gray-400">Bugün Kullanılan İade (₺)</p>
    <p className="text-xl font-bold text-yellow-400">
      {stats ? formatCurrency(stats.todayUsedCashback) : "-"}
    </p>
  </div>
</section>

  );
}
