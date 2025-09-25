/** @format */
"use client";

import CompanyNavbar from "@/components/company/Navbar/Navbar";
import BackButton from "@/components/company/BackButton";
import CustomersSkeleton from "./CustomersSkeleton";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import { useQuery } from "@tanstack/react-query";
import { getCompanyCustomersAction } from "@/actions/customers";
import { getUserHistoryAction } from "@/actions/points";
import { CompanyCustomer, UserHistory } from "@/lib/types";
import React, { useState } from "react";

const CustomersPage = () => {
  const { company } = useCompanyAuth();
  const [openUserId, setOpenUserId] = useState<string | null>(null);

  // ✅ Müşteriler
  const {
    data: customers,
    isLoading,
    isError,
  } = useQuery<CompanyCustomer[]>({
    queryKey: ["customers", company?.companyId],
    queryFn: async () => {
      if (!company?.companyId) return [];
      const res = await getCompanyCustomersAction(company.companyId);
      return res.success ? res.customers : [];
    },
    enabled: !!company?.companyId,
    staleTime: 1000 * 60 * 5, // 5 dk cache
  });

  // ✅ Kullanıcı detayları (userId değişince çalışır)
  const {
    data: purchases,
    isLoading: loadingPurchases,
  } = useQuery<UserHistory[]>({
    queryKey: ["user-history", openUserId, company?.companyId],
    queryFn: async () => {
      if (!openUserId || !company?.companyId) return [];
      const res = await getUserHistoryAction(openUserId, company.companyId);
      return res.success ? res.history ?? [] : [];
    },
    enabled: !!openUserId && !!company?.companyId, // sadece detay açıkken fetch et
    staleTime: 1000 * 60 * 2, // 2 dk cache
  });

  const handleShowDetails = (userId: string) => {
    if (openUserId === userId) {
      setOpenUserId(null); // tekrar tıklayınca kapat
    } else {
      setOpenUserId(userId);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <CompanyNavbar />
      <BackButton />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-white">👥 Müşterilerim</h1>

        {isLoading ? (
          <CustomersSkeleton />
        ) : isError ? (
          <p className="text-red-500">Müşteriler yüklenirken hata oluştu ❌</p>
        ) : !customers || customers.length === 0 ? (
          <p className="text-gray-400">Henüz müşteriniz yok.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800 text-gray-200">
                  <th className="px-4 py-3 text-left">Ad Soyad</th>
                  <th className="px-4 py-3 text-center">Puan</th>
                  <th className="px-4 py-3 text-center">Detay</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, idx) => (
                  <React.Fragment key={`customer-${c.user.id}`}>
                    <tr
                      className={`${
                        idx % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                      } hover:bg-gray-700 transition`}
                    >
                      <td className="px-4 py-3">
                        {c.user.name} {c.user.surname}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-green-400">
                        {c.totalPoints}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleShowDetails(c.user.id)}
                          className="text-blue-400 hover:underline"
                        >
                          {openUserId === c.user.id ? "Kapat" : "Göster"}
                        </button>
                      </td>
                    </tr>

                    {openUserId === c.user.id && (
                      <tr>
                        <td colSpan={4} className="bg-gray-700 px-4 py-3">
                          {loadingPurchases ? (
                            <p className="text-gray-300">Yükleniyor...</p>
                          ) : !purchases || purchases.length === 0 ? (
                            <p className="text-gray-400">Henüz işlem yok.</p>
                          ) : (
                            <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-md">
                              <table className="w-full text-sm border-collapse">
                                <thead>
                                  <tr className="bg-gray-600 text-gray-100">
                                    <th className="px-3 py-2 text-left">
                                      Ürün
                                    </th>
                                    <th className="px-3 py-2 text-center">
                                      Adet
                                    </th>
                                    <th className="px-3 py-2 text-center">
                                      Fiyat
                                    </th>
                                    <th className="px-3 py-2 text-center">
                                      Puan
                                    </th>
                                    <th className="px-3 py-2 text-center">
                                      Tarih
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {purchases.map((h, index) => (
                                    <tr
                                      key={`history-${c.user.id}-${h.id}-${index}`}
                                      className="bg-gray-800"
                                    >
                                      <td className="px-3 py-2">{h.product}</td>
                                      <td className="px-3 py-2 text-center">
                                        {h.quantity}
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        {h.totalPrice > 0
                                          ? `${h.totalPrice}₺`
                                          : "-"}
                                      </td>
                                      <td
                                        className={`px-3 py-2 text-center font-semibold ${
                                          h.points > 0
                                            ? "text-green-400"
                                            : "text-red-400"
                                        }`}
                                      >
                                        {h.points > 0
                                          ? `+${h.points}`
                                          : h.points}
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        {new Date(h.date).toLocaleDateString(
                                          "tr-TR"
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
