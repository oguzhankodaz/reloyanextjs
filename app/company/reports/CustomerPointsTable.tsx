/** @format */
"use client";

import { CustomerPoints } from "@/lib/types";

type Props = {
  points: CustomerPoints[];
};

export default function CustomerPointsTable({ points }: Props) {
  return (
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
            {points.map((c) => (
              <tr key={c.id} className="hover:bg-gray-700">
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
  );
}
