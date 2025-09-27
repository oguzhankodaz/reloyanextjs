/** @format */
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/helpers"; // ✅ helper import

type Props = {
  data: { month: string; cashback: number }[];
};

export default function MonthlyPointsChart({ data }: Props) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow mt-8">
      <h2 className="text-xl font-semibold mb-4">📈 Aylık Nakit İade Dağılımı</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="month" stroke="#aaa" />
          <YAxis
            stroke="#aaa"
            tickFormatter={(value) => formatCurrency(value)} // ✅ eksen format
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)} // ✅ tooltip format
          />
          <Line
            type="monotone"
            dataKey="cashback"
            stroke="#4ade80"
            strokeWidth={2}
            dot={{ r: 4 }} // ✅ nokta boyutunu sabitle (istersen kaldırabilirsin)
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
