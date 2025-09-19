/** @format */

import { User, UserPoints } from "@prisma/client";

export type ActionResponse = {
  success: boolean;
  message: string;
};

export type CompanyCustomer = UserPoints & {
  user: Pick<User, "id" | "name" | "surname" | "email">;
};

export type PurchaseHistory = {
  type: "purchase";
  id: number;
  product: string;
  quantity: number;
  totalPrice: number;
  points: number;
  date: Date;
};

export type UsageHistory = {
  type: "usage";
  id: number;
  product: string; // 🎯 puanla alınan ürün ismi
  quantity: number; // 🎯 kaç adet
  totalPrice: number; // 🎯 fiyat
  amount: number; // kullanılan puan miktarı
  points: number; // negatif değer
  date: Date;
};

export type UserHistory = PurchaseHistory | UsageHistory;

export type SelectedItem = {
  id: number;
  quantity: number;
  usePoints?: boolean; // ✅ ekstra alan (puanla alındı mı?)
};
