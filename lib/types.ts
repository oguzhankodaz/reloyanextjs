/** @format */

import { User } from "@prisma/client";

export type ActionResponse = {
  success: boolean;
  message: string;
};

/**
 * Şirket müşterisi (artık totalPoints yerine toplam cashback)
 */
export type CompanyCustomer = {
  user: {
    id: string;
    name: string;
    surname: string | null;
    email: string;
  };
  totalCashback: number; // ✅ artık puan değil cashback
};

/**
 * Satın alma geçmişi
 */
export type PurchaseHistory = {
  type: "purchase";
  id: number;
  product: string;
  quantity: number;
  totalPrice: number;
  cashbackEarned: number;
  date: Date;
  company: string; // ✅ eklendi
};

/**
 * Cashback harcama geçmişi
 */
export type UsageHistory = {
  type: "usage";
  id: number;
  product: string;
  quantity: number;
  totalPrice: number;
  amount: number;
  cashbackEarned: number;
  date: Date;
  company: string; // ✅ eklendi
};

export type UserHistory = PurchaseHistory | UsageHistory;

/**
 * Sepette seçilen ürün
 */
export type SelectedItem = {
  id: number;
  quantity: number;
  useCashback?: boolean; // ✅ artık puan değil, nakit iade ile mi alındı?
};

/**
 * Raporlar (puan yerine cashback üzerinden)
 */
export type ReportData = {
  success: boolean;
  totalCustomers: number;
  totalCashbackGiven: number; // ✅ tüm müşterilere verilen toplam nakit iade
  customerCashback: CustomerCashback[];
  monthlyCashback: { month: string; cashback: number }[];
  cashbackUsageTotal: number; // ✅ toplam kullanılan cashback
};

export type CustomerCashback = {
  id: string; // prisma.groupBy → userId olduğu için string olmalı
  totalCashback: number;
  userId: string;
  user: {
    name: string;
    surname: string | null;
  };
  lastAction?: string | null;
};

/**
 * En aktif şirket bilgisi
 */
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

/**
 * Kullanıcı paneli (dashboard)
 */
export type UserDashboardData = {
  totalCashback: number;
  companyCashback: {
    companyId: string;
    companyName: string;
    cashback: number;
  }[];
  lastPurchases: UserHistory[]; // ✅ artık hem purchase hem usage destekler
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

/**
 * Ürün tipi
 */
export type Product = {
  id: number;
  name: string;
  price: number;
  cashback: number; // ✅ ürün başına verilecek iade
  createdAt?: Date;
  companyId?: string;
  categoryId?: number | null;
};
export type ReportFilter = "day" | "month" | "year" | "all";