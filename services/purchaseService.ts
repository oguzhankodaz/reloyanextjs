// services/purchaseService.ts
import {
    addPurchaseAction,
    getUserCashbackAction,
    spendCashbackAction,
  } from "@/actions/purchases";
  
  export async function addPurchase(userId: string, companyId: string, data: { productId?: number; quantity: number; totalPrice: number; cashbackEarned: number }[]) {
    return await addPurchaseAction(userId, companyId, data);
  }
  
  export async function fetchUserCashback(userId: string, companyId: string) {
    return await getUserCashbackAction(userId, companyId);
  }
  
  export async function spendCashback(userId: string, companyId: string, amount: number) {
    return await spendCashbackAction(userId, companyId, amount);
  }
  