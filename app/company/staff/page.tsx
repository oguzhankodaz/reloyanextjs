/** @format */
"use client";

import { useEffect, useState, useTransition } from "react";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import { registerStaffAction } from "@/actions/auth";
import { toTitleCase } from "@/lib/helpers";
import {
  deleteStaffAction,
  toggleStaffActiveAction,
} from "@/actions/staff-admin";
// QRReaderModal kaldırıldı (kullanılmıyor)
import CompanyNavbar from "@/components/company/Navbar/Navbar";
import BackButton from "@/components/company/BackButton";

type Staff = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
};

export default function StaffPage() {
  const { company } = useCompanyAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!company?.companyId) return;
    fetch(`/api/staff`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setStaff(data.staff ?? []));
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
        setStaff((prev) => [
          ...prev,
          { ...res.staff, name: toTitleCase(res.staff.name) },
        ]);
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
    <div>
      <CompanyNavbar></CompanyNavbar>
      <BackButton />
      <div className="mb-6"></div>

      <div className="p-6 bg-white rounded-lg shadow text-gray-800">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          👨‍💼 Personel Yönetimi
        </h1>

        {/* Yeni Personel Formu */}
        <form
          action={handleAdd}
          className="flex flex-col gap-3 border p-4 rounded mb-6 bg-gray-50"
        >
          <input
            name="name"
            placeholder="Ad Soyad"
            className="border p-2 rounded text-gray-800 placeholder-gray-400"
            required
            minLength={2}
            pattern="[A-Za-zÇĞİÖŞÜçğıöşü' -]{2,}"
            title="Ad Soyad yalnızca harf, boşluk, kesme işareti ve tire içerebilir."
          />
          <input
            type="email"
            name="email"
            placeholder="E-posta"
            className="border p-2 rounded text-gray-800 placeholder-gray-400"
            required
            inputMode="email"
            autoComplete="email"
          />
          <input
            type="password"
            name="password"
            placeholder="Şifre"
            className="border p-2 rounded text-gray-800 placeholder-gray-400"
            required
            minLength={8}
            pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}"
            title="En az 8 karakter, en az bir harf ve bir rakam içermeli."
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            {isPending ? "Ekleniyor..." : "Personel Ekle"}
          </button>
        </form>

        {/* Personel Listesi */}
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-900">
              <th className="p-2 border">Ad</th>
              <th className="p-2 border">E-posta</th>
              <th className="p-2 border">Durum</th>
              <th className="p-2 border">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="text-gray-700">
                <td className="p-2 border">{s.name}</td>
                <td className="p-2 border">{s.email}</td>
                <td className="p-2 border">
                  {s.isActive ? (
                    <span className="text-green-600">✅ Aktif</span>
                  ) : (
                    <span className="text-red-600">❌ Pasif</span>
                  )}
                </td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => handleToggle(s.id, s.isActive)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {s.isActive ? "Pasifleştir" : "Aktifleştir"}
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-4 text-center text-gray-500 bg-gray-50"
                >
                  Henüz personel yok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
