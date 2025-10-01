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

  // ek state’ler
  const [saving, setSaving] = useState(false);
  const [totalSpendInput, setTotalSpendInput] = useState("");
  const [percentageInput, setPercentageInput] = useState("3");
  const [cashbackPreview, setCashbackPreview] = useState(0);
  const [useCashbackInput, setUseCashbackInput] = useState("");

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
      setPercentageInput("3");
      const cashbackRes = await fetchUserCashback(userId, companyId);
      if (cashbackRes.success) setTotalCashback(cashbackRes.totalCashback);
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
    } else {
      toast({ title: "Hata", description: res.message, variant: "error" });
    }
  };

  if (loading) return <p className="text-center mt-10">⏳ Yükleniyor...</p>;
  if (!user) return null;

  return (
    <div className="bg-gray-950 min-h-screen">
      <CompanyNavbar />
      <div className="flex flex-col items-center justify-start p-4 space-y-6">
        <UserInfoCard user={user} totalCashback={totalCashback} />
        <CashbackActions
          totalSpendInput={totalSpendInput}
          setTotalSpendInput={setTotalSpendInput}
          percentageInput={percentageInput}
          setPercentageInput={setPercentageInput}
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
