/** @format */
"use client";

import { getUserByIdAction } from "@/actions/users";
import { getProductsByCompanyAction } from "@/actions/product";
import CompanyNavbar from "@/components/company/Navbar/Navbar";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductList from "../company/products/ProductList";
import { addPurchaseAction } from "@/actions/purchases";

export default function QRResultPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<{ id: number; quantity: number }[]>(
    []
  );
  const [saving, setSaving] = useState(false);

  // Kullanıcı bilgisi
  useEffect(() => {
    if (userId) {
      getUserByIdAction(userId).then((res) => {
        if (res.success) {
          setUser(res.user);
        }
        setLoading(false);
      });
    }
  }, [userId]);

  // Şirket ürünlerini getir
  useEffect(() => {
    const companyRaw = localStorage.getItem("company");
    if (!companyRaw) {
      console.warn("Company bilgisi bulunamadı.");
      return;
    }

    const company = JSON.parse(companyRaw); // 👈 JSON parse
    const companyId = company.id; // 👈 doğru id

    getProductsByCompanyAction(companyId).then((res) => {
      if (res.success) setProducts(res.products);
    });
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    if (selected.length === 0) {
      alert("En az bir ürün seçmelisiniz.");
      return;
    }

    const companyRaw = localStorage.getItem("company");
    if (!companyRaw) {
      alert("Şirket bilgisi bulunamadı.");
      return;
    }
    const company = JSON.parse(companyRaw);
    const companyId = company.id;

    const items = selected.map((i) => ({
      productId: i.id,
      quantity: i.quantity,
    }));

    setSaving(true);
    const res = await addPurchaseAction(userId, companyId, items);
    setSaving(false);

    if (res.success) {
      alert(`Satın alma kaydedildi ✅ Toplam +${res.totalPoints} puan eklendi`);
      setSelected([]);
    } else {
      alert(res.message);
    }
  };

  if (loading) return <p className="text-center mt-10">⏳ Yükleniyor...</p>;
  if (!user)
    return (
      <p className="text-center mt-10 text-red-600">Kullanıcı bulunamadı.</p>
    );

  return (
    <div>
      <CompanyNavbar />
      <div className="flex flex-col items-center justify-start min-h-screen p-6">
        {/* Kullanıcı bilgisi */}
        <h1 className="text-2xl font-bold mb-6">📌 Kullanıcı Bilgileri</h1>
        <div className="bg-gray-100 rounded-lg shadow-md p-6 w-[320px] text-left mb-6">
          <p className="text-black">
            <strong>Ad Soyad:</strong> {user.name} {user.surname}
          </p>
          <p className="text-black">
            <strong>Email:</strong> {user.email}
          </p>
        </div>

        {/* Ürün listesi */}
        <h2 className="text-xl font-semibold mb-4">🛒 Ürün Seç</h2>
        <div className="bg-white text-black rounded-xl p-6 shadow">
          <ProductList
            products={products}
            mode="select"
            onSelectChange={(sel) => setSelected(sel)}
          />
        </div>

        {/* Kaydet butonu */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "Kaydet ✅"}
        </button>
      </div>
    </div>
  );
}
