/** @format */
"use client";

import BackButton from "@/components/company/BackButton";
import CompanyNavbar from "@/components/company/Navbar/Navbar";
import { Activity, BarChart, PieChart } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getReportData } from "@/actions/companyStats";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CustomerPoints, ReportData } from "@/lib/types";

const ReportsPage = () => {
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    (async () => {
      const res = await getReportData();
      setData(res);
    })();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <CompanyNavbar />
      <div className="p-6">
        <BackButton />

        <h1 className="text-2xl font-bold mb-6 mt-4">📊 Raporlar</h1>

        {/* Kartlar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Toplam Müşteri */}
          <div className="bg-gray-800 rounded-xl p-6 shadow flex flex-col items-center">
            <Activity className="w-10 h-10 text-yellow-400 mb-3" />
            <h2 className="text-lg font-semibold">Toplam Müşteri</h2>
            <p className="text-3xl font-bold mt-2">{data.totalCustomers}</p>
          </div>

          {/* Dağıtılan Puan */}
          <div className="bg-gray-800 rounded-xl p-6 shadow flex flex-col items-center">
            <BarChart className="w-10 h-10 text-green-400 mb-3" />
            <h2 className="text-lg font-semibold">Dağıtılan Puan</h2>
            <p className="text-3xl font-bold mt-2">
              {data.totalPointsGiven.toLocaleString()}
            </p>
          </div>

          {/* En Aktif İşletme */}
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

        {/* Müşteri Puanları Tablosu */}
        <div className="bg-gray-800 rounded-xl p-6 shadow mt-8">
          <h2 className="text-xl font-semibold mb-4">👥 Müşteri Puanları</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700 text-gray-200">
                  <th className="px-4 py-2 text-left">Ad Soyad</th>
                  <th className="px-4 py-2 text-center">Toplam Puan</th>
                  <th className="px-4 py-2 text-center">Son İşlem</th>
                </tr>
              </thead>
              <tbody>
                {data.customerPoints.map((c: CustomerPoints) => (
                  <tr key={c.userId} className="hover:bg-gray-700">
                    <td className="px-4 py-2">
                      {c.user.name} {c.user.surname}
                    </td>
                    <td className="px-4 py-2 text-center text-green-400">
                      {c.totalPoints}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {c.lastAction ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grafik */}
        <div className="bg-gray-800 rounded-xl p-6 shadow mt-8">
          <h2 className="text-xl font-semibold mb-4">📈 Aylık Puan Dağılımı</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="points"
                stroke="#4ade80"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
