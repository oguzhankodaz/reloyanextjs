/** @format */
"use client";

import CompanyNavbar from "@/components/company/Navbar/Navbar";
import BackButton from "@/components/company/BackButton";
import PremiumGuard from "@/components/company/PremiumGuard";
import CustomersSkeleton from "./CustomersSkeleton";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import { useQuery } from "@tanstack/react-query";
import { getCompanyCustomersAction } from "@/actions/customers";
import { CompanyCustomer, UserHistory } from "@/lib/types";
import React, { useState } from "react";
import { getUserHistoryAction } from "@/actions/points";
import { formatCurrency } from "@/lib/helpers"; // ✅ formatCurrency eklendi

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
    staleTime: 1000 * 60 * 5,
  });

  // ✅ Kullanıcı detayları
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
    enabled: !!openUserId && !!company?.companyId,
    staleTime: 1000 * 60 * 2,
  });

  const handleShowDetails = (userId: string) => {
    setOpenUserId((prev) => (prev === userId ? null : userId));
  };

  return (
    <PremiumGuard featureName="Müşteri Yönetimi">
      <div className="min-h-screen flex flex-col"> {/* p-6 ve text-gray kaldırıldı, yapı aynı */}
        <CompanyNavbar />
        <BackButton />

      {/* 🔧 SAĞ/SOL SIKIŞMAYI GİDEREN SARMALAYICI */}
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
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
                  <th className="px-4 sm:px-5 py-3 text-left">Ad Soyad</th>
                  <th className="px-4 sm:px-5 py-3 text-center">
                    Toplam Nakit İade (₺)
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-center">Detay</th>
                </tr>
              </thead>
              <tbody>
                {[...customers]
                  .sort((a, b) => (b.totalCashback ?? 0) - (a.totalCashback ?? 0))
                  .map((c, idx) => (
                  <React.Fragment key={`customer-${c.user.id}`}>
                    <tr
                      className={`${
                        idx % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                      } hover:bg-gray-700 transition`}
                    >
                      <td className="px-4 sm:px-5 py-3">
                        {c.user.name} {c.user.surname}
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-center font-semibold text-green-400">
                        {formatCurrency(c.totalCashback ?? 0)}
                      </td>
                      <td className="px-4 sm:px-5 py-3 text-center">
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
                        <td colSpan={4} className="bg-gray-700 px-4 sm:px-5 py-3">
                          {loadingPurchases ? (
                            <p className="text-gray-300">Yükleniyor...</p>
                          ) : !purchases || purchases.length === 0 ? (
                            <p className="text-gray-400">Henüz işlem yok.</p>
                          ) : (
                            <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-md">
                              <table className="w-full text-sm border-collapse">
                                <thead>
                                  <tr className="bg-gray-600 text-gray-100">
                                    <th className="px-3 sm:px-4 py-2 text-left">
                                      Ürün
                                    </th>
                                    <th className="px-3 sm:px-4 py-2 text-center">
                                      Adet
                                    </th>
                                    <th className="px-3 sm:px-4 py-2 text-center">
                                      Fiyat (₺)
                                    </th>
                                    <th className="px-3 sm:px-4 py-2 text-center">
                                      Nakit İade (₺)
                                    </th>
                                    <th className="px-3 sm:px-4 py-2 text-center">
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
                                      <td className="px-3 sm:px-4 py-2">{h.product}</td>
                                      <td className="px-3 sm:px-4 py-2 text-center">
                                        {h.quantity}
                                      </td>
                                      <td className="px-3 sm:px-4 py-2 text-center">
                                        {h.totalPrice > 0
                                          ? formatCurrency(h.totalPrice)
                                          : "-"}
                                      </td>
                                      <td
                                        className={`px-3 sm:px-4 py-2 text-center font-semibold ${
                                          h.cashbackEarned > 0
                                            ? "text-green-400"
                                            : "text-red-400"
                                        }`}
                                      >
                                        {formatCurrency(h.cashbackEarned)}
                                      </td>
                                      <td className="px-3 sm:px-4 py-2 text-center">
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
    </PremiumGuard>
  );
};

export default CustomersPage;
