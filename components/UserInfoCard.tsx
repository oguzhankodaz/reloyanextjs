// components/UserInfoCard.tsx
"use client";

import { formatCurrency } from "@/lib/helpers";
import { User } from "@/types/user";

type Props = {
  user: User;
  totalCashback: number;
};

export function UserInfoCard({ user, totalCashback }: Props) {
  return (
    <div className="bg-gray-900 rounded-lg shadow-md p-6 w-full max-w-3xl">
      <h1 className="text-lg font-bold text-gray-100 mb-2">📌 Kullanıcı Bilgileri</h1>
      <p className="text-gray-300">
        <strong className="text-gray-100">Ad Soyad:</strong> {user.name}{" "}
        {user.surname}
      </p>
   
      <p className="text-gray-300 mt-2">
        <strong className="text-gray-100">Toplam Bakiye:</strong>{" "}
        <span className="text-green-400 font-bold">
          {formatCurrency(totalCashback)}
        </span>
      </p>
    </div>
  );
}
