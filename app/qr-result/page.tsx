/** @format */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CompanyNavbar from "@/components/company/Navbar/Navbar";

import { getUserByIdAction } from "@/actions/users";
import { getProductsByCompanyAction } from "@/actions/product";
import { addPurchaseAction } from "@/actions/purchases";
import { getUserPointsAction, spendPointsAction } from "@/actions/points";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import { ProductList } from "../company/products/ProductList";

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
  const [totalPoints, setTotalPoints] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [useAmountInput, setUseAmountInput] = useState<string>("");

  const [cartItems, setCartItems] = useState<
    { id: number; name: string; quantity: number; usePoints: boolean }[]
  >([]);

  // Kullanıcı + Puan + Ürünleri getir
  useEffect(() => {
    if (!userId || !company) {
      setLoading(false);
      return;
    }

    (async () => {
      const userRes = await getUserByIdAction(userId);
      if (userRes.success) {
        setUser(userRes.user);

        const pointsRes = await getUserPointsAction(userId);
        if (pointsRes.success) {
          const companyPoints = pointsRes.points.find(
            (p) => p.company.id === company.companyId
          );
          setTotalPoints(companyPoints?.totalPoints ?? 0);
        }
      }

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

  // Sepete ekle
  const handleAddToCart = (item: {
    id: number;
    name: string;
    quantity: number;
  }) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, { ...item, usePoints: false }];
    });
  };

  const toggleUsePoints = (id: number) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, usePoints: !i.usePoints } : i))
    );
  };

  const handleRemove = (id: number) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Kaydetme
  const handleSave = async () => {
    if (!userId || !company) return;
    if (cartItems.length === 0) {
      alert("Sepet boş.");
      return;
    }

    setSaving(true);

    for (const item of cartItems) {
      const product = products.find((p) => p.id === item.id);
      if (!product) continue;

      if (item.usePoints) {
        const totalUse = product.pointsToBuy * item.quantity;

        const res = await spendPointsAction(
          userId,
          company.companyId,
          totalUse,
          product.id,
          item.quantity,
          product.price
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
    setCartItems([]);

    // puanı güncelle
    const pointsRes = await getUserPointsAction(userId);
    if (pointsRes.success) {
      const companyPoints = pointsRes.points.find(
        (p) => p.company.id === company.companyId
      );
      setTotalPoints(companyPoints?.totalPoints ?? 0);
    }

    alert("İşlemler tamamlandı ✅");
  };

  // Manuel puan düşme
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
      setUseAmountInput("");
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
        {/* Kullanıcı bilgisi */}
        <div className="bg-gray-100 rounded-lg shadow-md p-6 w-full max-w-4xl mb-6">
          <h1 className="text-xl font-bold mb-4 text-black">
            📌 Kullanıcı Bilgileri
          </h1>
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
        <div className="bg-white text-black rounded-xl p-6 shadow w-full max-w-4xl">
          <ProductList
            products={products}
            onAdd={handleAddToCart} // sepete ekleme fonksiyonunu ver
          />
        </div>

        {/* Sepet */}
        <div className="bg-black p-6 rounded-xl shadow-md mt-6 w-full max-w-4xl">
          <h3 className="font-semibold mb-4 text-white text-lg tracking-wide">
            🛍 Sepetiniz
          </h3>
          {cartItems.length === 0 && (
            <p className="text-gray-400 text-sm">Henüz ürün eklemediniz.</p>
          )}

          <div className="divide-y divide-gray-700">
            {cartItems.map((item) => {
              const product = products.find((p) => p.id === item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-gray-100 font-medium">
                    {item.name} × {item.quantity}
                  </span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={item.usePoints}
                        onChange={() => toggleUsePoints(item.id)}
                        className="w-5 h-5 accent-green-500"
                      />
                      Puan kullan
                    </label>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-400 hover:text-red-500 text-sm font-semibold"
                    >
                      ❌ Sil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toplamlar */}
          {cartItems.length > 0 && (
            <div className="mt-4 border-t border-gray-700 pt-4 text-gray-200">
              <p className="mb-1">
                🎯 <span className="font-semibold">Toplam Verilecek Puan:</span>{" "}
                {cartItems.reduce((sum, item) => {
                  const product = products.find((p) => p.id === item.id);
                  return sum + (product?.pointsOnSell || 0) * item.quantity;
                }, 0)}
              </p>
              <p>
                💳 <span className="font-semibold">Gerekli Puan:</span>{" "}
                {cartItems.reduce((sum, item) => {
                  if (!item.usePoints) return sum;
                  const product = products.find((p) => p.id === item.id);
                  return sum + (product?.pointsToBuy || 0) * item.quantity;
                }, 0)}
              </p>
            </div>
          )}
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

      {/* Manuel Puan Kullan */}
      <div className="bg-white text-black rounded-lg shadow-md p-6 m-6">
        <h2 className="text-xl font-semibold mb-4">🎯 Manuel Puan Kullan</h2>
        <input
          type="number"
          min={1}
          max={totalPoints}
          value={useAmountInput}
          onChange={(e) => setUseAmountInput(e.target.value)}
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
