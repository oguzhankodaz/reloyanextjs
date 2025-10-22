/** @format */
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import CompanyNavbar from "@/components/company/Navbar/Navbar";
import { UserInfoCard } from "@/components/UserInfoCard";
import { Cart } from "@/components/Cart";
import { ProductSelector } from "@/components/ProductSelector";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import QRResultSkeleton from "@/components/common/QRResultSkeleton";

import { useCompanyOrStaffCompanyId } from "@/hooks/useCompanyOrStaffCompanyId";
import { useUserData } from "@/hooks/useUserData";
import { useCart } from "@/hooks/useCart";
import { useRadixToast } from "@/components/notifications/ToastProvider";
import { useRouter } from "next/navigation";

import {
  addPurchase,
  fetchUserCashback,
  spendCashback,
} from "@/services/purchaseService";
import { formatCurrency } from "@/lib/helpers";

export default function QRResultPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const toast = useRadixToast();
  const router = useRouter();

  // companyId çöz
  const companyId = useCompanyOrStaffCompanyId();

  // user + ürün + cashback
  const { user, products, totalCashback, setTotalCashback, loading } =
    useUserData(userId, companyId);

  // sepet yönetimi
  const {
    cartItems,
    addToCart,
    removeFromCart,
    setCartItems,
  } = useCart(products);

  // ek state'ler
  const [saving, setSaving] = useState(false);
  const [totalSpendInput, setTotalSpendInput] = useState("");
  const [percentageInput, setPercentageInput] = useState("3");
  const [cashbackPreview, setCashbackPreview] = useState(0);
  const [useCashbackInput, setUseCashbackInput] = useState("");
  const [selectedAction, setSelectedAction] = useState<"cashback" | "points">("cashback");

  // Şirket cashback yüzdesini yükle
  useEffect(() => {
    if (companyId) {
      fetch("/api/company/settings")
        .then((res) => res.json())
        .then((data) => {
          console.log("Company settings response:", data);
          if (data.success && data.settings && data.settings.cashbackPercentage) {
            setPercentageInput(data.settings.cashbackPercentage.toString());
          } else {
            // API'den veri gelmezse varsayılan değer
            setPercentageInput("3");
          }
        })
        .catch((error) => {
          console.error("Company settings fetch error:", error);
          // Hata durumunda varsayılan değer kullanılır
          setPercentageInput("3");
        });
    } else {
      // companyId yoksa varsayılan değer
      setPercentageInput("3");
    }
  }, [companyId]);

  // cashback preview hesapla
  useEffect(() => {
    const spend = parseFloat(totalSpendInput);
    const percent = parseFloat(percentageInput || "3"); // Fallback to 3 if empty
    
    console.log("Cashback calculation:", { spend, percent, totalSpendInput, percentageInput });
    
    if (!isNaN(spend) && spend > 0 && !isNaN(percent) && percent > 0) {
      const calculated = Math.round(((spend * percent) / 100) * 100) / 100;
      setCashbackPreview(calculated);
      console.log("Calculated cashback:", calculated);
    } else {
      setCashbackPreview(0);
      console.log("Cashback calculation failed:", { spend, percent, isNaNSpend: isNaN(spend), isNaNPercent: isNaN(percent) });
    }
  }, [totalSpendInput, percentageInput]);

  // ürün bazlı kaydet
  const handleSave = async () => {
    if (!userId || !companyId) return;
    if (cartItems.length === 0) {
      toast({
        title: "Sepet boş",
        description: "Lütfen ürün ekleyin.",
        variant: "error",
      });
      return;
    }
    setSaving(true);
    for (const item of cartItems) {
      const product = products.find((p) => p.id === item.id);
      if (!product) continue;
      await addPurchase(userId, companyId, [
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
    const cashbackRes = await fetchUserCashback(userId, companyId);
    if (cashbackRes.success) setTotalCashback(cashbackRes.totalCashback);
    toast({
      title: "Başarılı",
      description: "Satın alma işlemi tamamlandı ✅",
      variant: "success",
    });
    
    // Staff dashboard'a geri dön
    setTimeout(() => {
      router.push("/company/staff/dashboard");
    }, 1500);
  };

  // toplam harcama ile cashback ver
  const handleGiveCashbackBySpend = async () => {
    if (!userId || !companyId) return;
    const spend = parseFloat(totalSpendInput);
    const percent = parseFloat(percentageInput || "3"); // Fallback to 3 if empty
    
    console.log("HandleGiveCashback:", { spend, percent, totalSpendInput, percentageInput });
    
    if (isNaN(spend) || spend <= 0 || isNaN(percent) || percent <= 0) {
      toast({
        title: "Hatalı giriş",
        description: "Lütfen geçerli değerler girin.",
        variant: "error",
      });
      return;
    }
    const cashbackToGive = Math.round(((spend * percent) / 100) * 100) / 100;
    setSaving(true);
    const res = await addPurchase(userId, companyId, [
      {
        productId: undefined,
        quantity: 1,
        totalPrice: spend,
        cashbackEarned: cashbackToGive,
      },
    ]);
    setSaving(false);
    if (res.success) {
      toast({
        title: "Nakit iade",
        description: `${formatCurrency(cashbackToGive)} iade verildi ✅`,
        variant: "success",
      });
      setTotalSpendInput("");
      const cashbackRes = await fetchUserCashback(userId, companyId);
      if (cashbackRes.success) setTotalCashback(cashbackRes.totalCashback);
      
      // Staff dashboard'a geri dön
      setTimeout(() => {
        router.push("/company/staff/dashboard");
      }, 1500);
    }
  };

  // manuel bakiye kullan
  const handleUseCashback = async () => {
    if (!userId || !companyId) return;
    const amount = parseFloat(useCashbackInput);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Hatalı giriş",
        description: "Geçerli bir tutar girin.",
        variant: "error",
      });
      return;
    }
    setSaving(true);
    const res = await spendCashback(userId, companyId, amount);
    setSaving(false);
    if (res.success) {
      toast({
        title: "Bakiye kullanıldı",
        description: `-${formatCurrency(amount)} bakiye düşüldü ✅`,
        variant: "success",
      });
      setUseCashbackInput("");
      setTotalCashback(res.totalCashback ?? totalCashback);
      
      // Staff dashboard'a geri dön
      setTimeout(() => {
        router.push("/company/staff/dashboard");
      }, 1500);
    } else {
      toast({ title: "Hata", description: res.message, variant: "error" });
    }
  };

  // Loading veya user yoksa skeleton göster
  if (loading || !user) {
    return <QRResultSkeleton />;
  }

  return (
    <div className="bg-gray-950 min-h-screen">
      <CompanyNavbar />
      <div className="flex flex-col items-center justify-start p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        <UserInfoCard user={user} totalCashback={totalCashback} />
        
        {/* Main Action Selection */}
        <div className="w-full max-w-2xl">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={() => setSelectedAction("cashback")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                selectedAction === "cashback"
                  ? "bg-green-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>💰</span>
                <span>İade Ver</span>
              </span>
            </button>
            <button
              onClick={() => setSelectedAction("points")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                selectedAction === "points"
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>🎯</span>
                <span>Para Puan Kullan</span>
              </span>
            </button>
          </div>
        </div>

        {/* Cashback Section */}
        {selectedAction === "cashback" && (
          <div className="w-full max-w-4xl space-y-6">
            {/* Total Cashback Give */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">💰</span>
                Toplam Nakit İade Ver
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Harcama Tutarı (₺)
                  </label>
                  <input
                    type="number"
                    value={totalSpendInput}
                    onChange={(e) => setTotalSpendInput(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
             
                {totalSpendInput && parseFloat(totalSpendInput) > 0 && (
                  <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
                    <p className="text-green-300 text-sm">
                      <strong>İade Tutarı:</strong> {formatCurrency(cashbackPreview)}
                    </p>
                    <p className="text-green-400 text-xs mt-1">
                      {parseFloat(percentageInput || "3")}% oranında iade verilecek
                    </p>
                  </div>
                )}
                <ConfirmDialog
                  trigger={
                    <button
                      disabled={saving || !totalSpendInput || parseFloat(totalSpendInput) <= 0}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      {saving ? "İşleniyor..." : "İade Ver"}
                    </button>
                  }
                  title="İade Verme Onayı"
                  description={`${formatCurrency(cashbackPreview)} tutarında iade vermek istediğinizden emin misiniz?`}
                  onConfirm={handleGiveCashbackBySpend}
                />
              </div>
            </div>

            {/* Product Search and Cart - Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Search */}
              <div className="order-2 lg:order-1">
                <ProductSelector products={products} onAdd={addToCart} />
              </div>

              {/* Cart */}
              <div className="order-1 lg:order-2">
                <Cart
                  cartItems={cartItems}
                  products={products}
                  onRemove={removeFromCart}
                  onSave={handleSave}
                  saving={saving}
                />
              </div>
            </div>
          </div>
        )}

        {/* Points Usage Section */}
        {selectedAction === "points" && (
          <div className="w-full max-w-md">
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                🎯 Para Puan Kullan
              </h3>
              <div className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                  <p className="text-blue-300 text-sm">
                    <strong>Mevcut Bakiye:</strong> {formatCurrency(totalCashback)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kullanılacak Tutar (₺)
                  </label>
                  <input
                    type="number"
                    value={useCashbackInput}
                    onChange={(e) => setUseCashbackInput(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <ConfirmDialog
                    trigger={
                      <button
                        disabled={saving || !useCashbackInput || parseFloat(useCashbackInput) <= 0}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                      >
                        {saving ? "İşleniyor..." : "Para Puan Kullan"}
                      </button>
                    }
                    title="Para Puan Kullanma Onayı"
                    description={`${formatCurrency(parseFloat(useCashbackInput || "0"))} tutarında para puan kullanmak istediğinizden emin misiniz?`}
                    onConfirm={handleUseCashback}
                  />
                  <ConfirmDialog
                    trigger={
                      <button
                        disabled={saving || totalCashback <= 0}
                        className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        💳 Tüm Bakiyeyi Kullan ({formatCurrency(totalCashback)})
                      </button>
                    }
                    title="Tüm Bakiye Kullanma Onayı"
                    description={`Tüm bakiyenizi (${formatCurrency(totalCashback)}) kullanmak istediğinizden emin misiniz?`}
                    onConfirm={async () => {
                      if (!userId || !companyId) return;
                      const amount = Math.round(totalCashback * 100) / 100;
                      console.log("Tüm bakiye kullanma - Debug:", {
                        totalCashback,
                        amount,
                        userId,
                        companyId
                      });
                      
                      if (isNaN(amount) || amount <= 0) {
                        toast({
                          title: "Hatalı giriş",
                          description: "Geçerli bir tutar girin.",
                          variant: "error",
                        });
                        return;
                      }
                      setSaving(true);
                      const res = await spendCashback(userId, companyId, amount);
                      setSaving(false);
                      if (res.success) {
                        toast({
                          title: "Bakiye kullanıldı",
                          description: `-${formatCurrency(amount)} bakiye düşüldü ✅`,
                          variant: "success",
                        });
                        setUseCashbackInput("");
                        setTotalCashback(res.totalCashback ?? totalCashback);
                        
                        // Staff dashboard'a geri dön
                        setTimeout(() => {
                          router.push("/company/staff/dashboard");
                        }, 1500);
                      } else {
                        console.error("Spend cashback error:", res);
                        toast({ title: "Hata", description: res.message, variant: "error" });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
