"use client";

import CompanyNavbar from "@/components/company/Navbar/Navbar";
import { getCompanyCustomersAction } from "@/actions/customers";
import { useEffect, useState } from "react";
import { CompanyCustomer } from "@/lib/types";



const CustomersPage = () => {
  const [customers, setCustomers] = useState<CompanyCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const companyRaw = localStorage.getItem("company");
    if (!companyRaw) return;

    const company = JSON.parse(companyRaw);
    const companyId = company.id;

    getCompanyCustomersAction(companyId).then((res) => {
      if (res.success) setCustomers(res.customers);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="p-6 text-gray-300">⏳ Yükleniyor...</p>;

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <CompanyNavbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-white">👥 Müşterilerim</h1>

        {customers.length === 0 ? (
          <p className="text-gray-400">Henüz müşteriniz yok.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800 text-gray-200">
                  <th className="px-4 py-3 text-left">Ad Soyad</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-center">Puan</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, idx) => (
                  <tr
                    key={c.user.id}
                    className={`${
                      idx % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                    } hover:bg-gray-700 transition`}
                  >
                    <td className="px-4 py-3">
                      {c.user.name} {c.user.surname}
                    </td>
                    <td className="px-4 py-3">{c.user.email}</td>
                    <td className="px-4 py-3 text-center font-semibold text-green-400">
                      {c.totalPoints}
                    </td>
                  </tr>
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
