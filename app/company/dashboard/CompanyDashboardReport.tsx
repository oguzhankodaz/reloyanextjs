import { useEffect, useState } from "react";
import { getCompanyStatsAction } from "@/actions/companyStats";
import { useCompanyAuth } from "@/context/CompanyAuthContext";

export default function CompanyDashboardReport() {
  const { company } = useCompanyAuth();
  const [stats, setStats] = useState<{
    totalCustomers: number;
    todaySales: number;
    totalPoints: number;
    productCount: number;
  } | null>(null);

  useEffect(() => {
    if (!company) return;
    (async () => {
      const res = await getCompanyStatsAction(company.companyId);
      if (res.success) {
        setStats(res.stats);
      }
    })();
  }, [company]);

  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4">
      <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
        <p className="text-sm text-gray-400">Toplam Müşteri</p>
        <p className="text-xl font-bold">{stats?.totalCustomers ?? "-"}</p>
      </div>
      <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
        <p className="text-sm text-gray-400">Bugünkü Satış</p>
        <p className="text-xl font-bold">{stats?.todaySales ?? "-"}</p>
      </div>
      <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
        <p className="text-sm text-gray-400">Toplam Puan</p>
        <p className="text-xl font-bold">{stats?.totalPoints ?? "-"}</p>
      </div>
      <div className="bg-gray-800 rounded-lg p-4 text-center shadow">
        <p className="text-sm text-gray-400">Ürün Sayısı</p>
        <p className="text-xl font-bold">{stats?.productCount ?? "-"}</p>
      </div>
    </section>
  );
}
