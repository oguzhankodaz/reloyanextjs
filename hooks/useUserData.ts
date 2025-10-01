// hooks/useUserData.ts
"use client";

import { useEffect, useState } from "react";
import { getUserByIdAction } from "@/actions/users";
import { getUserCashbackAction } from "@/actions/purchases";
import { getProductsByCompanyAction } from "@/actions/product";
import { User } from "@/types/user";
import { Product } from "@/types/product";

export function useUserData(userId: string | null, companyId: string | null) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCashback, setTotalCashback] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !companyId) {
      setLoading(false);
      return;
    }

    (async () => {
      const userRes = await getUserByIdAction(userId);
      if (userRes.success) {
        setUser(userRes.user);

        const cashbackRes = await getUserCashbackAction(userId, companyId);
        if (cashbackRes.success) {
          setTotalCashback(cashbackRes.totalCashback);
        }

        const prodRes = await getProductsByCompanyAction(companyId);
        if (prodRes.success) {
          setProducts(prodRes.products);
        }
      }
      setLoading(false);
    })();
  }, [userId, companyId]);

  return { user, products, totalCashback, setTotalCashback, loading };
}
