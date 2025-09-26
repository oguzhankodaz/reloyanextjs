/** @format */
"use client";

import { CustomerCashback } from "@/lib/types";

type Props = {
  cashback: CustomerCashback[];
};

export default function CustomerPointsTable({ cashback }: Props) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow mt-8">
      <h2 className="text-xl font-semibold mb-4">👥 En Çok Cashback Alan Müşteriler</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-700 text-gray-200">
              <th className="px-4 py-3">Ad Soyad</th>
              <th className="px-4 py-3 text-center">Toplam İade (₺)</th>
              <th className="px-4 py-3 text-center">Son İşlem</th>
            </tr>
          </thead>
          <tbody>
            {cashback.map((c, idx) => (
              <tr
                key={c.userId}
                className={idx % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}
              >
                <td className="px-4 py-3">
                  {c.user.name} {c.user.surname}
                </td>
                <td className="px-4 py-3 text-center font-semibold text-green-400">
                  {c.totalCashback.toFixed(2)} ₺
                </td>
                <td className="px-4 py-3 text-center text-gray-300">
                  {c.lastAction ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
