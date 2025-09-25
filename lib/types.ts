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
export type ReportData = {
  success: true;
  totalCustomers: number;
  totalPointsGiven: number;
  mostActiveCompany: {
    id: string;
    name: string;
    _count: { purchases: number };
  } | null;
  customerPoints: CustomerPoints[];
  monthlyPoints: { month: string; points: number }[];
  pointsUsageTotal: number;
};



export type CustomerPoints = {
  id: number;
  totalPoints: number;
  userId: string;
  user: {
    name: string;
    surname: string | null;
  };
  lastAction?: string | null;
};

export type MostActiveCompany = {
  id: string;
  name: string;
  email: string;
  password: string;
  address: string | null;
  createdAt: Date;
  _count: {
    purchases: number;
  };
};

export type UserDashboardData = {
  totalPoints: number;
  companyPoints: {
    companyId: string;
    companyName: string;
    points: number;
  }[];
  lastPurchases: {
    id: number;
    product: string;
    company: string;
    points: number;
    date: Date;
  }[];
  campaigns: {
    id: number;
    title: string;
    detail?: string | null;
    company: {
      id: string;
      name: string;
    };
    startDate: Date;
    endDate: Date;
  }[];
};
