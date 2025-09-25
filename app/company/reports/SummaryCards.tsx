/** @format */
"use client";

import { Activity, BarChart, PieChart } from "lucide-react";
import { ReportData } from "@/lib/types";

type Props = {
  data: ReportData;
};

export default function SummaryCards({ data }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-gray-800 rounded-xl p-6 shadow flex flex-col items-center">
        <Activity className="w-10 h-10 text-yellow-400 mb-3" />
        <h2 className="text-lg font-semibold">Toplam Müşteri</h2>
        <p className="text-3xl font-bold mt-2">{data.totalCustomers}</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 shadow flex flex-col items-center">
        <BarChart className="w-10 h-10 text-green-400 mb-3" />
        <h2 className="text-lg font-semibold">Dağıtılan Puan</h2>
        <p className="text-3xl font-bold mt-2">
          {data.totalPointsGiven.toLocaleString()}
        </p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 shadow flex flex-col items-center">
        <BarChart className="w-10 h-10 text-purple-400 mb-3" />
        <h2 className="text-lg font-semibold">Puanla Alınan Ürünler</h2>
        <p className="text-3xl font-bold mt-2">
          {data.pointsUsageTotal.toLocaleString()} ₺
        </p>
        <p className="text-sm text-gray-400 mt-1">Toplam ürün değeri</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 shadow flex flex-col items-center">
        <PieChart className="w-10 h-10 text-blue-400 mb-3" />
        <h2 className="text-lg font-semibold">En Aktif İşletme</h2>
        <p className="text-xl font-bold mt-2">
          {data.mostActiveCompany?.name ?? "-"}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {data.mostActiveCompany?._count?.purchases ?? 0} işlem yaptı
        </p>
      </div>
    </div>
  );
}
