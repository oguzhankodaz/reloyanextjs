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
    amount: number;
    points: number; // negatif değer
    date: Date;
  };
  
  export type UserHistory = PurchaseHistory | UsageHistory;
  