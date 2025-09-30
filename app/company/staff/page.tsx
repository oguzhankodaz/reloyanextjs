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
import CompanyNavbar from "@/components/company/Navbar/Navbar";
import BackButton from "@/components/company/BackButton";
import { useRadixToast } from "@/components/notifications/ToastProvider";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

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
  const toast = useRadixToast();

  useEffect(() => {
    if (!company?.companyId) return;
    fetch(`/api/staff`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setStaff(data.staff ?? []));
  }, [company?.companyId]);

  const handleAdd = async (formData: FormData) => {
    if (!company) {
      toast({ title: "Şirket bulunamadı", variant: "error" });
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
        toast({
          title: "Başarılı",
          description: "Personel eklendi ✅",
          variant: "success",
        });
      } else {
        toast({ title: "Hata", description: res.message, variant: "error" });
      }
    });
  };

  const handleDelete = async (id: string) => {
    const res = await deleteStaffAction(id);
    if (res.success) {
      setStaff((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: "Silindi",
        description: "Personel başarıyla silindi",
        variant: "success",
      });
    } else {
      toast({ title: "Hata", description: res.message, variant: "error" });
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const res = await toggleStaffActiveAction(id, !isActive);
    if (res.success) {
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !isActive } : s))
      );
      toast({
        title: "Durum güncellendi",
        description: isActive
          ? "Personel pasifleştirildi"
          : "Personel aktifleştirildi",
        variant: "success",
      });
    } else {
      toast({ title: "Hata", description: res.message, variant: "error" });
    }
  };

  return (
    <div>
      <CompanyNavbar />
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
          />
          <input
            type="email"
            name="email"
            placeholder="E-posta"
            className="border p-2 rounded text-gray-800 placeholder-gray-400"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Şifre"
            className="border p-2 rounded text-gray-800 placeholder-gray-400"
            required
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
        {/* Personel Listesi */}
        {/* Personel Listesi */}
        <div className="overflow-x-auto">
          <table className="w-full border text-sm min-w-[500px]">
            <thead>
              <tr className="bg-gray-100 text-gray-900">
                <th className="p-2 border whitespace-nowrap">Ad</th>
                <th className="p-2 border whitespace-nowrap">Durum</th>
                <th className="p-2 border whitespace-nowrap">İşlemler</th>
                <th className="p-2 border whitespace-nowrap">E-posta</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="text-gray-700">
                  <td className="p-2 border">{s.name}</td>
                  <td className="p-2 border">
                    {s.isActive ? (
                      <span className="text-green-600">✅ Aktif</span>
                    ) : (
                      <span className="text-red-600">❌ Pasif</span>
                    )}
                  </td>
                  <td className="p-2 border flex flex-wrap gap-2">
                    <button
                      onClick={() => handleToggle(s.id, s.isActive)}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      {s.isActive ? "Pasifleştir" : "Aktifleştir"}
                    </button>

                    <ConfirmDialog
                      title="Personeli sil?"
                      description={`${s.name} adlı personeli silmek istediğinize emin misiniz?`}
                      onConfirm={() => handleDelete(s.id)}
                      trigger={
                        <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                          Sil
                        </button>
                      }
                    />
                  </td>
                  <td className="p-2 border">{s.email}</td>
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
    </div>
  );
}
