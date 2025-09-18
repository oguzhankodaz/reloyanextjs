/** @format */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CompanyNavbar from "@/components/company/Navbar/Navbar";
import ProductList from "../company/products/ProductList";

import { getUserByIdAction } from "@/actions/users";
import { getProductsByCompanyAction } from "@/actions/product";
import { addPurchaseAction } from "@/actions/purchases";
import { getUserPointsAction } from "@/actions/points";
import { useCompanyAuth } from "@/context/CompanyAuthContext"; // ✅ context

type User = {
  id: string;
  name: string;
  surname?: string | null;
  email: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
  pointsToBuy: number;
  pointsOnSell: number;
};

export default function QRResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId");

  const { company } = useCompanyAuth(); // ✅ şirket bilgisi context'ten

  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<{ id: number; quantity: number }[]>(
    []
  );
  const [totalPoints, setTotalPoints] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Kullanıcı + Puan + Ürünleri getir
  useEffect(() => {
    if (!userId || !company) {
      setLoading(false);
      return;
    }

    (async () => {
      // Kullanıcı bilgisi
      const userRes = await getUserByIdAction(userId);
      if (userRes.success) {
        setUser(userRes.user);

        // Kullanıcının puanı
        const pointsRes = await getUserPointsAction(userId);
        if (pointsRes.success) {
          const companyPoints = pointsRes.points.find(
            (p) => p.company.id === company.companyId
          );
          setTotalPoints(companyPoints?.totalPoints ?? 0);
        }
      }

      // Şirket ürünleri
      const prodRes = await getProductsByCompanyAction(company.companyId);
      if (prodRes.success) {
        setProducts(prodRes.products);
      }

      setLoading(false);
    })();
  }, [userId, company]);

  // Kullanıcı bulunamazsa dashboard’a yönlendir
  useEffect(() => {
    if (!loading && !user) {
      router.push("/company/dashboard");
    }
  }, [loading, user, router]);

  // Eğer şirket yoksa login'e yönlendir
  useEffect(() => {
    if (!company) {
      router.replace("/company/login");
    }
  }, [company, router]);

  // Satın alma kaydetme
  const handleSave = async () => {
    if (!userId || !company) return;
    if (selected.length === 0) {
      alert("En az bir ürün seçmelisiniz.");
      return;
    }

    const items = selected.map((i) => ({
      productId: i.id,
      quantity: i.quantity,
    }));

    setSaving(true);
    const res = await addPurchaseAction(userId, company.companyId, items);
    setSaving(false);

    if (res.success) {
      alert(`Satın alma kaydedildi ✅ Toplam +${res.totalPoints} puan eklendi`);
      setSelected([]);

      // Satın alma sonrası puanı güncelle
      const pointsRes = await getUserPointsAction(userId);
      if (pointsRes.success) {
        const companyPoints = pointsRes.points.find(
          (p) => p.company.id === company.companyId
        );
        setTotalPoints(companyPoints?.totalPoints ?? 0);
      }
    } else {
      alert(res.message);
    }
  };

  if (loading) return <p className="text-center mt-10">⏳ Yükleniyor...</p>;
  if (!user) return null; // yönlendirme yapılana kadar boş dön

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
          <p className="text-black mt-2">
            <strong>Toplam Puanı:</strong>{" "}
            <span className="text-green-600 font-bold">{totalPoints}</span>
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
