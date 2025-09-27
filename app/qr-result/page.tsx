/** @format */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CompanyNavbar from "@/components/company/Navbar/Navbar";

import { getUserByIdAction } from "@/actions/users";
import { getProductsByCompanyAction } from "@/actions/product";
import {
  addPurchaseAction,
  getUserCashbackAction,
  spendCashbackAction,
} from "@/actions/purchases";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import { ProductList } from "../company/products/ProductList";
import { formatCurrency } from "@/lib/helpers";

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
  cashback: number;
};

export default function QRResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId");

  const { company } = useCompanyAuth();

  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCashback, setTotalCashback] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [cartItems, setCartItems] = useState<
    { id: number; name: string; quantity: number }[]
  >([]);

  // 🔹 Ek state (toplam harcama üzerinden %)
  const [totalSpendInput, setTotalSpendInput] = useState<string>("");
  const [percentageInput, setPercentageInput] = useState<string>("3");
  const [cashbackPreview, setCashbackPreview] = useState<number>(0);

  // 🔹 Manuel cashback kullanma
  const [useCashbackInput, setUseCashbackInput] = useState<string>("");

  // Kullanıcı + Ürün + Cashback bilgisi
  useEffect(() => {
    if (!userId || !company) {
      setLoading(false);
      return;
    }

    (async () => {
      const userRes = await getUserByIdAction(userId);
      if (userRes.success) {
        setUser(userRes.user);

        const cashbackRes = await getUserCashbackAction(
          userId,
          company.companyId
        );
        if (cashbackRes.success) {
          setTotalCashback(cashbackRes.totalCashback);
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

  // 🔹 Toplam harcama önizleme
  useEffect(() => {
    const spend = parseFloat(totalSpendInput);
    const percent = parseFloat(percentageInput);

    if (!isNaN(spend) && spend > 0 && !isNaN(percent) && percent > 0) {
      setCashbackPreview((spend * percent) / 100);
    } else {
      setCashbackPreview(0);
    }
  }, [totalSpendInput, percentageInput]);

  // Sepet yönetimi
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
      return [...prev, item];
    });
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

      await addPurchaseAction(userId, company.companyId, [
        {
          productId: product.id,
          quantity: item.quantity,
          totalPrice: product.price * item.quantity,
          cashbackEarned: product.cashback * item.quantity,
        },
      ]);
    }

    setSaving(false);
    setCartItems([]);

    // cashback güncelle
    const cashbackRes = await getUserCashbackAction(userId, company.companyId);
    if (cashbackRes.success) {
      setTotalCashback(cashbackRes.totalCashback);
    }

    alert("Satın alma işlemi tamamlandı ✅");
  };

  // 🔹 Toplam harcama ile nakit iade verme
  const handleGiveCashbackBySpend = async () => {
    if (!userId || !company) return;

    const spend = parseFloat(totalSpendInput);
    const percent = parseFloat(percentageInput);

    if (isNaN(spend) || spend <= 0 || isNaN(percent) || percent <= 0) {
      alert("Geçerli değerler girin.");
      return;
    }

    const cashbackToGive = (spend * percent) / 100;

    setSaving(true);
    const res = await addPurchaseAction(userId, company.companyId, [
      {
        productId: undefined, // ürünle ilişkili değil
        quantity: 1, // ✅ quantity zorunlu olduğu için 1
        totalPrice: spend,
        cashbackEarned: cashbackToGive,
      },
    ]);
    setSaving(false);

    if (res.success) {
      alert(`${formatCurrency(cashbackToGive)} nakit iade verildi ✅`);
      setTotalSpendInput("");
      setPercentageInput("3");

      const cashbackRes = await getUserCashbackAction(
        userId,
        company.companyId
      );
      if (cashbackRes.success) {
        setTotalCashback(cashbackRes.totalCashback);
      }
    }
  };

  // 🔹 Manuel bakiye kullanma
  const handleUseCashback = async () => {
    if (!userId || !company) return;

    const amount = parseFloat(useCashbackInput);
    if (isNaN(amount) || amount <= 0) {
      alert("Geçerli bir tutar girin.");
      return;
    }

    setSaving(true);
    const res = await spendCashbackAction(userId, company.companyId, amount);
    setSaving(false);

    if (res.success) {
      alert(`-${formatCurrency(amount)} bakiye kullanıldı ✅`);
      setUseCashbackInput("");
      setTotalCashback(res.totalCashback ?? totalCashback);
    } else {
      alert(res.message);
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
            <strong className="text-gray-100">Toplam Bakiye:</strong>{" "}
            <span className="text-green-400 font-bold">
              {formatCurrency(totalCashback)}
            </span>
          </p>
        </div>

        {/* Ek İşlemler */}
        <div className="bg-gray-900 rounded-lg shadow-md p-6 w-full max-w-3xl space-y-6">
          <h2 className="text-lg font-semibold text-gray-100">
            💳 Müşteri Para Puan İşlemleri
          </h2>

          {/* Toplam harcama ile iade */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Toplam Harcama ile Nakit İade Ver
            </h3>
            <input
              type="number"
              value={totalSpendInput}
              onChange={(e) => setTotalSpendInput(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-3 text-gray-100"
              placeholder="Toplam harcama (₺)"
            />
            {/* Yüzde oranı ayarı */}
            <div className="mb-4">
              <label
                htmlFor="percentageInput"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Nakit İade Oranı (%)
              </label>
              <input
                id="percentageInput"
                type="number"
                min={1}
                max={100}
                value={percentageInput}
                onChange={(e) => setPercentageInput(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 
               focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                placeholder="Varsayılan: %3"
              />
              <p className="text-xs text-gray-400 mt-1">
                Varsayılan oran{" "}
                <span className="font-semibold text-green-400">3%</span>’tür.
                Dilerseniz bu değeri manuel olarak değiştirebilirsiniz.
              </p>
            </div>

            <p className="text-gray-300 mb-3">
              🎯 Verilecek Nakit İade:{" "}
              <span className="font-bold text-green-400">
                {formatCurrency(cashbackPreview)}
              </span>
            </p>
            <button
              onClick={handleGiveCashbackBySpend}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "İşlem yapılıyor..." : "İade Ver"}
            </button>
          </div>

          {/* Manuel bakiye kullan */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              🎯 Manuel Para Puan Kullan
            </h3>
            <input
              type="number"
              min={1}
              max={totalCashback}
              value={useCashbackInput}
              onChange={(e) => setUseCashbackInput(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-3 text-gray-100"
              placeholder="Kullanılacak tutar (₺)"
            />
            <button
              onClick={handleUseCashback}
              disabled={saving || parseFloat(useCashbackInput) <= 0}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "İşlem yapılıyor..." : "Bakiyeyi Kullan"}
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
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-red-400 hover:text-red-500 text-sm"
                      >
                        ❌ Sil
                      </button>
                    </div>
                  );
                })}

                {/* Toplamlar */}
                <div className="border-t border-gray-700 pt-3 text-sm">
                  <p>
                    💵{" "}
                    <span className="font-semibold text-gray-100">
                      Toplam Fiyat:
                    </span>{" "}
                    {formatCurrency(
                      cartItems.reduce((sum, item) => {
                        const product = products.find((p) => p.id === item.id);
                        return sum + (product?.price || 0) * item.quantity;
                      }, 0)
                    )}
                  </p>
                  <p>
                    🎯{" "}
                    <span className="font-semibold text-gray-100">
                      Kazanılacak Nakit İade:
                    </span>{" "}
                    {formatCurrency(
                      cartItems.reduce((sum, item) => {
                        const product = products.find((p) => p.id === item.id);
                        return sum + (product?.cashback || 0) * item.quantity;
                      }, 0)
                    )}
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
