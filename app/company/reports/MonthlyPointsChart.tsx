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
  data: { label: string; cashback: number }[];
  filter: "day" | "month" | "year" | "all";
};

export default function PointsChart({ data, filter }: Props) {
  const xLabel =
    filter === "day"
      ? "Gün"
      : filter === "month"
      ? "Tarih"
      : filter === "year"
      ? "Ay"
      : "Yıl";

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow mt-8">
      <h2 className="text-xl font-semibold mb-4">
        📈{" "}
        {filter === "day"
          ? "Günlük"
          : filter === "month"
          ? "Aylık"
          : filter === "year"
          ? "Yıllık"
          : "Tüm Zamanlar"}{" "}
        Nakit İade Dağılımı
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ right: 40, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />

          {/* X Ekseni */}
          <XAxis
            dataKey="label"
            stroke="#aaa"
            interval="preserveStartEnd"
            tick={{ fontSize: 12 }}
            label={{
              value:
                filter === "day"
                  ? "Saat"
                  : filter === "month"
                  ? "Gün"
                  : filter === "year"
                  ? "Ay"
                  : "Yıl",
              position: "insideBottom",
              offset: -20,
              fill: "#aaa",
            }}
          />

          {/* Y Ekseni */}
          <YAxis
            stroke="#aaa"
            tickFormatter={(value) =>
              value >= 1_000_000
                ? (value / 1_000_000).toFixed(1) + "M"
                : value >= 1000
                ? (value / 1000).toFixed(1) + "k"
                : formatCurrency(value)
            }
          />

          <Tooltip formatter={(value: number) => formatCurrency(value)} />

          <Line
            type="monotone"
            dataKey="cashback"
            stroke="#4ade80"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
