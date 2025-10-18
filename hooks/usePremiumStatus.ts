/** @format */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useCompanyAuth } from "@/context/CompanyAuthContext";

interface SubscriptionData {
  planType: string;
  expiresAt: string;
  status: string;
  amount: number;
  createdAt: string;
  orderId: string;
}

interface TrialData {
  isActive: boolean;
  daysLeft: number;
  startDate: string;
  endDate: string;
  hasExpired: boolean;
}

interface PremiumStatus {
  hasActiveSubscription: boolean;
  hasActiveTrial: boolean;
  isPremium: boolean;
  subscription: SubscriptionData | null;
  trial: TrialData | null;
  isLoading: boolean;
  isError: boolean;
}

export function usePremiumStatus(): PremiumStatus {
  const { company } = useCompanyAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["premium-status", company?.companyId],
    queryFn: async () => {
      if (!company) return null;
      
      const response = await fetch(`/api/company/subscription?companyId=${company.companyId}`, {
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch subscription status");
      }
      
      const data = await response.json();
      return data.success ? data : null;
    },
    enabled: !!company,
    staleTime: 1000 * 60 * 2, // 2 dakika cache
    retry: 2,
  });

  if (isLoading) {
    return {
      hasActiveSubscription: false,
      hasActiveTrial: false,
      isPremium: false,
      subscription: null,
      trial: null,
      isLoading: true,
      isError: false,
    };
  }

  if (isError || !data) {
    return {
      hasActiveSubscription: false,
      hasActiveTrial: false,
      isPremium: false,
      subscription: null,
      trial: null,
      isLoading: false,
      isError: true,
    };
  }

  const subscription = data.subscription as SubscriptionData | null;
  const trial = data.trial as TrialData | null;

  // Aktif abonelik kontrolü - süresi de kontrol edilir
  const hasActiveSubscription = subscription && 
    subscription.status === 'completed' && 
    new Date(subscription.expiresAt) > new Date();

  // Aktif deneme süresi kontrolü
  const hasActiveTrial = trial && 
    trial.isActive && 
    !trial.hasExpired && 
    trial.daysLeft > 0;

  // Premium durumu: aktif abonelik VEYA aktif deneme süresi
  const isPremium = hasActiveSubscription || hasActiveTrial;

  return {
    hasActiveSubscription,
    hasActiveTrial,
    isPremium,
    subscription,
    trial,
    isLoading: false,
    isError: false,
  };
}
