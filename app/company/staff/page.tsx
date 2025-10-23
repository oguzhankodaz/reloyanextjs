/** @format */
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import { registerStaffAction } from "@/actions/auth";
import {
  deleteStaffAction,
  toggleStaffActiveAction,
} from "@/actions/staff-admin";
import CompanyNavbar from "@/components/company/Navbar/Navbar";
import { ArrowLeft } from "lucide-react";

type Staff = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
};

export default function StaffPage() {
  const { company } = useCompanyAuth();
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!company?.companyId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    fetch(`/api/staff`, { credentials: "include" })
      .then((res) => {
        // 401 Unauthorized kontrolü
        if (res.status === 401) {
          setStaff([]);
          return { staff: [] };
        }
        return res.json();
      })
      .then((data) => {
        // API { staff: [] } formatında döndürüyor
        if (data && Array.isArray(data.staff)) {
          setStaff(data.staff);
        } else {
          setStaff([]);
        }
      })
      .catch((error) => {
        console.error("Staff fetch error:", error);
        setStaff([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [company?.companyId]);

  const handleAdd = async (formData: FormData) => {
    if (!company) {
      alert("Şirket oturumu bulunamadı.");
      return;
    }

    startTransition(async () => {
      formData.append("companyId", company.companyId);
      const res = await registerStaffAction(formData);
      if (res.success && res.staff) {
        setStaff((prev) => [...prev, res.staff]);
      } else {
        alert(res.message);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu personeli silmek istediğinize emin misiniz?")) return;
    const res = await deleteStaffAction(id);
    if (res.success) {
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert(res.message);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const res = await toggleStaffActiveAction(id, !isActive);
    if (res.success) {
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !isActive } : s))
      );
    } else {
      alert(res.message);
    }
  };

  return (
  <div className="pb-20 sm:pb-0">
    <CompanyNavbar></CompanyNavbar>
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow text-gray-800 mx-2 sm:mx-0 mt-4 sm:mt-0">
      
      {/* Geri Tuşu */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors group mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Geri Dön</span>
      </button>

      <h1 className="text-2xl font-bold mb-4 text-gray-900">
        👨‍💼 Personel Yönetimi
      </h1>

      {/* Yeni Personel Formu */}
      <form
        action={handleAdd}
        className="flex flex-col gap-3 border p-4 rounded mb-6 bg-gray-50"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            name="name"
            placeholder="Ad Soyad"
            className="border p-3 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="E-posta"
            className="border p-3 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Şifre"
            className="border p-3 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-black text-white px-4 py-3 rounded hover:bg-gray-800 disabled:bg-gray-400 transition-colors font-medium"
        >
          {isPending ? "Ekleniyor..." : "Personel Ekle"}
        </button>
      </form>

      {/* Personel Listesi - Desktop */}
      <div className="hidden md:block">
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-900">
              <th className="p-2 border">Ad</th>
              <th className="p-2 border">Durum</th>
              <th className="p-2 border">İşlemler</th>
              <th className="p-2 border">E-posta</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Desktop Skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="text-gray-700">
                  <td className="p-2 border">
                    <div className="h-5 bg-gray-300 rounded animate-pulse"></div>
                  </td>
                  <td className="p-2 border">
                    <div className="h-5 bg-gray-300 rounded animate-pulse w-16"></div>
                  </td>
                  <td className="p-2 border">
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-300 rounded animate-pulse w-20"></div>
                      <div className="h-6 bg-gray-300 rounded animate-pulse w-12"></div>
                    </div>
                  </td>
                  <td className="p-2 border">
                    <div className="h-4 bg-gray-300 rounded animate-pulse w-32"></div>
                  </td>
                </tr>
              ))
            ) : (
              <>
                {staff.map((s) => (
                  <tr key={s.id} className="text-gray-700">
                    <td className="p-2 border font-medium">{s.name}</td>
                    <td className="p-2 border">
                      {s.isActive ? (
                        <span className="text-green-600 font-medium">✅ Aktif</span>
                      ) : (
                        <span className="text-red-600 font-medium">❌ Pasif</span>
                      )}
                    </td>
                    <td className="p-2 border">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggle(s.id, s.isActive)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                        >
                          {s.isActive ? "Pasifleştir" : "Aktifleştir"}
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                    <td className="p-2 border text-sm text-gray-600">{s.email}</td>
                  </tr>
                ))}
                {staff.length === 0 && !isLoading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-4 text-center text-gray-500 bg-gray-50"
                    >
                      Henüz personel yok
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Personel Listesi - Mobile */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          // Mobile Skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`mobile-skeleton-${index}`} className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="h-5 bg-gray-300 rounded animate-pulse w-32 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-48"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-12"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-8 bg-gray-300 rounded animate-pulse"></div>
                <div className="flex-1 h-8 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          ))
        ) : staff.length === 0 ? (
          <div className="p-4 text-center text-gray-500 bg-gray-50 rounded">
            Henüz personel yok
          </div>
        ) : (
          staff.map((s) => (
            <div key={s.id} className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{s.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{s.email}</p>
                </div>
                <div className="text-right">
                  {s.isActive ? (
                    <span className="text-green-600 font-medium text-sm">✅ Aktif</span>
                  ) : (
                    <span className="text-red-600 font-medium text-sm">❌ Pasif</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggle(s.id, s.isActive)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  {s.isActive ? "Pasifleştir" : "Aktifleştir"}
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
  );
}
