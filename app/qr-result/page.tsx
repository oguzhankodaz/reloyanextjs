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

  // 🔹 Yeni state (toplam harcama + yüzde)
  const [totalSpendInput, setTotalSpendInput] = useState<string>("");
  const [percentageInput, setPercentageInput] = useState<string>("3");

  const [pointsPreview, setPointsPreview] = useState<number>(0);

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

  // Hesaplama için effect
  useEffect(() => {
    const spend = parseFloat(totalSpendInput);
    const percent = parseFloat(percentageInput);

    if (!isNaN(spend) && spend > 0 && !isNaN(percent) && percent > 0) {
      setPointsPreview(Math.floor((spend * percent) / 100));
    } else {
      setPointsPreview(0);
    }
  }, [totalSpendInput, percentageInput]);

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

  // Kaydetme (ürün bazlı işlemler)
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

  // 🔹 Toplam harcama üzerinden puan verme
  const handleGivePointsBySpend = async () => {
    if (!userId || !company) return;

    const spend = parseFloat(totalSpendInput);
    const percent = parseFloat(percentageInput);

    if (isNaN(spend) || isNaN(percent) || spend <= 0 || percent <= 0) {
      alert("Geçerli değerler girin.");
      return;
    }

    const pointsToGive = Math.floor((spend * percent) / 100);

    setSaving(true);
    const res = await addPurchaseAction(userId, company.companyId, [
      { totalSpend: spend, points: pointsToGive },
    ]);
    setSaving(false);

    if (res.success) {
      alert(`${pointsToGive} puan verildi ✅`);
      setTotalSpendInput("");
      setPercentageInput("");
      // puanı güncelle
      const pointsRes = await getUserPointsAction(userId);
      if (pointsRes.success) {
        const companyPoints = pointsRes.points.find(
          (p) => p.company.id === company.companyId
        );
        setTotalPoints(companyPoints?.totalPoints ?? 0);
      }
    } else {
      alert(res.success);
    }
  };

  if (loading) return <p className="text-center mt-10">⏳ Yükleniyor...</p>;
  if (!user) return null;

  return (
    <div className="bg-gray-950 min-h-screen">
      <CompanyNavbar />
      <div className="flex flex-col items-center justify-start p-4 space-y-6">
        {/* Kullanıcı bilgisi */}
        <div className="bg-gray-900 rounded-lg shadow-md p-6 w-full max-w-3xl">
          <h1 className="text-lg font-bold text-gray-100 mb-2">
            📌 Kullanıcı Bilgileri
          </h1>
          <p className="text-gray-300">
            <strong className="text-gray-100">Ad Soyad:</strong> {user.name}{" "}
            {user.surname}
          </p>
          <p className="text-gray-300">
            <strong className="text-gray-100">Email:</strong> {user.email}
          </p>
          <p className="text-gray-300 mt-2">
            <strong className="text-gray-100">Toplam Puanı:</strong>{" "}
            <span className="text-green-400 font-bold">{totalPoints}</span>
          </p>
        </div>

        {/* Ek İşlemler */}
        <div className="bg-gray-900 rounded-lg shadow-md p-6 w-full max-w-3xl space-y-6">
          <h2 className="text-lg font-semibold text-gray-100">
            ⚙️ Ek İşlemler
          </h2>

          {/* Toplam Harcama */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              💰 Toplam Harcama ile Puan Ver
            </h3>
            <input
              type="number"
              value={totalSpendInput}
              onChange={(e) => setTotalSpendInput(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-3 text-gray-100"
              placeholder="Toplam harcama (₺)"
            />
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Yüzde oranı %
            </h3>

            <input
              type="number"
              value={percentageInput}
              onChange={(e) => setPercentageInput(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-3 text-gray-100"
              placeholder="Yüzde (%)"
            />

            {/* 🔹 Önizleme alanı */}
            <p className="text-gray-300 mb-3">
              🎯 Verilecek Puan:{" "}
              <span className="font-bold text-green-400">{pointsPreview}</span>
            </p>

            <button
              onClick={handleGivePointsBySpend}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "İşlem yapılıyor..." : "Puan Ver"}
            </button>
          </div>

          {/* Manuel Puan Kullan */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              🎯 Manuel Puan Kullan
            </h3>
            <input
              type="number"
              min={1}
              max={totalPoints}
              value={useAmountInput}
              onChange={(e) => setUseAmountInput(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-3 text-gray-100"
              placeholder="Kullanılacak puan"
            />
            <button
              onClick={handleUsePoints}
              disabled={saving || parseInt(useAmountInput, 10) <= 0}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "İşlem yapılıyor..." : "Puanı Kullan"}
            </button>
          </div>
        </div>
        {/* Ürün işlemleri */}
        <div className="bg-gray-900 rounded-lg shadow-md p-6 w-full max-w-3xl space-y-6">
          <h2 className="text-lg font-semibold text-gray-100">
            🛒 Ürün Seç ve Sepet
          </h2>

          {/* Ürün listesi */}
          <div className="bg-white text-black p-2 rounded ">
            <ProductList products={products} onAdd={handleAddToCart} />
          </div>

          {/* Sepet */}
          <div className="bg-gray-800 text-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">🛍 Sepetiniz</h3>
            {cartItems.length === 0 ? (
              <p className="text-gray-400 text-sm">Henüz ürün eklemediniz.</p>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const product = products.find((p) => p.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={item.usePoints}
                            onChange={() => toggleUsePoints(item.id)}
                            className="w-4 h-4 accent-green-500"
                          />
                          Puan
                        </label>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-red-400 hover:text-red-500 text-sm"
                        >
                          ❌ Sil
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Toplamlar */}
                <div className="border-t border-gray-700 pt-3 text-sm">
                  <p>
                    🎯{" "}
                    <span className="font-semibold text-gray-100">
                      Verilecek Puan:
                    </span>{" "}
                    {cartItems.reduce((sum, item) => {
                      const product = products.find((p) => p.id === item.id);
                      return sum + (product?.pointsOnSell || 0) * item.quantity;
                    }, 0)}
                  </p>
                  <p>
                    💳{" "}
                    <span className="font-semibold text-gray-100">
                      Gerekli Puan:
                    </span>{" "}
                    {cartItems.reduce((sum, item) => {
                      if (!item.usePoints) return sum;
                      const product = products.find((p) => p.id === item.id);
                      return sum + (product?.pointsToBuy || 0) * item.quantity;
                    }, 0)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Kaydet butonu */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet ✅"}
          </button>
        </div>
      </div>
    </div>
  );
}
