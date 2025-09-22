/** @format */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CompanyNavbar from "@/components/company/Navbar/Navbar";
import ProductList from "../company/products/ProductList";

import { getUserByIdAction } from "@/actions/users";
import { getProductsByCompanyAction } from "@/actions/product";
import { addPurchaseAction } from "@/actions/purchases";
import { getUserPointsAction, spendPointsAction } from "@/actions/points";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import { SelectedItem } from "@/lib/types";

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

  const { company } = useCompanyAuth();

  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<SelectedItem[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [useAmountInput, setUseAmountInput] = useState<string>("");

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
  
    setSaving(true);
  
    for (const item of selected) {
      const product = products.find((p) => p.id === item.id);
      if (!product) continue;
  
      if (item.usePoints) {
        // ürünün puanla alış değeri × adet
        const totalUse = product.pointsToBuy * item.quantity;
  
        const res = await spendPointsAction(
          userId,
          company.companyId,
          totalUse,
          product.id,          // ✅ productId gönder
          item.quantity,       // ✅ adet gönder
          product.price        // ✅ fiyat gönder
        );
  
        if (!res.success) {
          alert(res.message);
        }
      } else {
        await addPurchaseAction(userId, company.companyId, [
          { productId: item.id, quantity: item.quantity },
        ]);
      }
    }
  
    setSaving(false);
  
    // puanı güncelle
    const pointsRes = await getUserPointsAction(userId);
    if (pointsRes.success) {
      const companyPoints = pointsRes.points.find(
        (p) => p.company.id === company.companyId
      );
      setTotalPoints(companyPoints?.totalPoints ?? 0);
    }
  
    alert("İşlemler tamamlandı ✅");
    setSelected([]);
  };
  

  // Puan kullanma işlemi
  const handleUsePoints = async () => {
    if (!userId || !company) return;

    const amount = parseInt(useAmountInput, 10);
    if (isNaN(amount) || amount <= 0) {
      alert("Geçerli bir puan girin.");
      return;
    }

    setSaving(true);
    const res = await spendPointsAction(userId, company.companyId, amount);
    setSaving(false);

    if (res.success) {
      alert(`-${amount} puan düşüldü ✅`);
      setTotalPoints(res.totalPoints ?? 0);
      setUseAmountInput(""); // input'u sıfırla
    } else {
      alert(res.message);
    }
  };

  if (loading) return <p className="text-center mt-10">⏳ Yükleniyor...</p>;
  if (!user) return null;

  return (
    <div>
      <CompanyNavbar />
      <div className="flex flex-col items-center justify-start min-h-screen p-6">
        {/* Kullanıcı bilgisi + Puan Kullan yan yana */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 w-full max-w-4xl">
          {/* Kullanıcı bilgisi */}
          <div className="bg-gray-100 rounded-lg shadow-md p-6 flex-1">
            <h1 className="text-xl font-bold mb-4 text-black">📌 Kullanıcı Bilgileri</h1>
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

   
        </div>

        {/* Ürün listesi */}
        <h2 className="text-xl font-semibold mb-4">🛒 Ürün Seç</h2>
        <div className="bg-white text-black rounded-xl p-6 shadow w-full max-w-4xl">
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
             {/* Puan Kullanma Alanı */}
             <div className="bg-white text-black rounded-lg shadow-md p-6 flex-1">
            <h2 className="text-xl font-semibold mb-4">🎯 Manuel Puan Kullan</h2>
            <input
              type="number"
              min={1}
              max={totalPoints}
              value={useAmountInput}
              onChange={(e) => setUseAmountInput(e.target.value)} // string olarak tut
              className="w-full border rounded px-3 py-2 mb-4 text-black"
              placeholder="Kullanılacak puan"
            />
            <button
              onClick={handleUsePoints}
              disabled={saving || parseInt(useAmountInput, 10) <= 0}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "İşlem yapılıyor..." : "Puanı Kullan"}
            </button>
          </div>
    </div>
  );
}
