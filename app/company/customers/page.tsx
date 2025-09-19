/** @format */

"use client";

import CompanyNavbar from "@/components/company/Navbar/Navbar";
import { getCompanyCustomersAction } from "@/actions/customers";
import { getUserPurchasesAction } from "@/actions/purchases"; // ✅ yeni eklenen action
import React, { useEffect, useState } from "react";
import { CompanyCustomer } from "@/lib/types";
import CustomersSkeleton from "./CustomersSkeleton";
import BackButton from "@/components/company/BackButton";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import { getUserHistoryAction } from "@/actions/points";

const CustomersPage = () => {
  const { company } = useCompanyAuth();
  const [customers, setCustomers] = useState<CompanyCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  // detay için state
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  useEffect(() => {
    if (!company?.companyId) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      const res = await getCompanyCustomersAction(company.companyId);
      if (res.success) setCustomers(res.customers);
      setLoading(false);
    })();
  }, [company]);

  const handleShowDetails = async (userId: string) => {
    if (openUserId === userId) {
      setOpenUserId(null);
      return;
    }
    setOpenUserId(userId);
    setLoadingPurchases(true);

    const res = await getUserHistoryAction(userId, company!.companyId);
    if (res.success) {
      setPurchases(res.history ?? []); // artık purchases değil history
    } else {
      setPurchases([]);
    }

    setLoadingPurchases(false);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <CompanyNavbar />
      <BackButton />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-white">👥 Müşterilerim</h1>

        {loading ? (
          <CustomersSkeleton />
        ) : customers.length === 0 ? (
          <p className="text-gray-400">Henüz müşteriniz yok.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800 text-gray-200">
                  <th className="px-4 py-3 text-left">Ad Soyad</th>
                  {/* <th className="px-4 py-3 text-left">Email</th> */}
                  <th className="px-4 py-3 text-center">Puan</th>
                  <th className="px-4 py-3 text-center">Detay</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, idx) => (
                  <React.Fragment key={c.user.id}>
                    <tr
                      className={`${
                        idx % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                      } hover:bg-gray-700 transition`}
                    >
                      <td className="px-4 py-3">
                        {c.user.name} {c.user.surname}
                      </td>
                      {/* // email alanı üst kısımıda açman geerek açmak için */}
                      {/* <td className="px-4 py-3">{c.user.email}</td> */}
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
                          ) : purchases.length === 0 ? (
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
                                  {purchases.map((h) => (
                                    <tr key={h.id} className="bg-gray-800">
                                      <td className="px-3 py-2">
                                        {h.type === "purchase"
                                          ? h.product
                                          : "🎯 Puan Kullanımı"}
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        {h.type === "purchase"
                                          ? h.quantity
                                          : "-"}
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        {h.type === "purchase"
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
