/** @format */
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import CompanyNavbar from "@/components/company/Navbar/Navbar";
import { UserInfoCard } from "@/components/UserInfoCard";
import { CashbackActions } from "@/components/CashbackActions";
import { Cart } from "@/components/Cart";
import { ProductSelector } from "@/components/ProductSelector";

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

  // Şirket cashback yüzdesini yükle
  useEffect(() => {
    if (companyId) {
      fetch("/api/company/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.settings) {
            setPercentageInput(data.settings.cashbackPercentage.toString());
          }
        })
        .catch(() => {
          // Hata durumunda varsayılan değer kullanılır
        });
    }
  }, [companyId]);

  // cashback preview hesapla
  useEffect(() => {
    const spend = parseFloat(totalSpendInput);
    const percent = parseFloat(percentageInput);
    if (!isNaN(spend) && spend > 0 && !isNaN(percent) && percent > 0) {
      setCashbackPreview((spend * percent) / 100);
    } else {
      setCashbackPreview(0);
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
    const percent = parseFloat(percentageInput);
    if (isNaN(spend) || spend <= 0 || isNaN(percent) || percent <= 0) {
      toast({
        title: "Hatalı giriş",
        description: "Lütfen geçerli değerler girin.",
        variant: "error",
      });
      return;
    }
    const cashbackToGive = (spend * percent) / 100;
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
    return (
      <div className="bg-gray-950 min-h-screen">
        <CompanyNavbar />
        <div className="flex flex-col items-center justify-start p-4 space-y-6">
          {/* User Info Card Skeleton */}
          <div className="w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-8 bg-gray-700 rounded w-full mt-4"></div>
          </div>

          {/* Cashback Actions Skeleton */}
          <div className="w-full max-w-md bg-gray-800 rounded-xl p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>

          {/* Product Selector Skeleton */}
          <div className="w-full max-w-md bg-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-24 bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-700 rounded"></div>
              <div className="h-24 bg-gray-700 rounded"></div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="text-center text-yellow-400 flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-semibold">Kullanıcı bilgileri yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen">
      <CompanyNavbar />
      <div className="flex flex-col items-center justify-start p-4 space-y-6">
        <UserInfoCard user={user} totalCashback={totalCashback} />
        <CashbackActions
          totalSpendInput={totalSpendInput}
          setTotalSpendInput={setTotalSpendInput}
          percentageInput={percentageInput}
          cashbackPreview={cashbackPreview}
          handleGiveCashbackBySpend={handleGiveCashbackBySpend}
          useCashbackInput={useCashbackInput}
          setUseCashbackInput={setUseCashbackInput}
          handleUseCashback={handleUseCashback}
          totalCashback={totalCashback}
          saving={saving}
        />
        <ProductSelector products={products} onAdd={addToCart} />
        <Cart
          cartItems={cartItems}
          products={products}
          onRemove={removeFromCart}
          onSave={handleSave}
          saving={saving}
        />
      </div>
    </div>
  );
}
