/** @format */

import { BadgeLevel, Badge, UserBadge } from "./types";

/**
 * Rozet seviyelerinin tanımları
 */
export const BADGE_DEFINITIONS: Badge[] = [
  {
    level: BadgeLevel.BRONZE,
    name: "Bronz",
    minAmount: 0,
    maxAmount: 2499,
    color: "#CD7F32",
    bgColor: "from-amber-600 to-amber-800",
    icon: "🥉"
  },
  {
    level: BadgeLevel.SILVER,
    name: "Gümüş", 
    minAmount: 2500,
    maxAmount: 7499,
    color: "#C0C0C0",
    bgColor: "from-gray-400 to-gray-600",
    icon: "🥈"
  },
  {
    level: BadgeLevel.GOLD,
    name: "Altın",
    minAmount: 7500,
    maxAmount: 19999,
    color: "#FFD700",
    bgColor: "from-yellow-400 to-yellow-600",
    icon: "🥇"
  },
  {
    level: BadgeLevel.PLATINUM,
    name: "Platin",
    minAmount: 20000,
    maxAmount: null,
    color: "#E5E4E2",
    bgColor: "from-purple-400 to-purple-600",
    icon: "💎"
  }
];

/**
 * Toplam kazanca göre rozet seviyesi hesaplar
 */
export function calculateUserBadge(totalEarnings: number): UserBadge {
  // Mevcut rozeti bul
  const currentBadge = BADGE_DEFINITIONS.find(badge => {
    if (badge.maxAmount === null) {
      return totalEarnings >= badge.minAmount;
    }
    return totalEarnings >= badge.minAmount && totalEarnings <= badge.maxAmount;
  }) || BADGE_DEFINITIONS[0];

  // Bir sonraki rozeti bul
  const currentIndex = BADGE_DEFINITIONS.findIndex(b => b.level === currentBadge.level);
  const nextBadge = currentIndex < BADGE_DEFINITIONS.length - 1 
    ? BADGE_DEFINITIONS[currentIndex + 1] 
    : null;

  // Bir sonraki seviyeye ilerleme yüzdesini hesapla
  let progressToNext = 0;
  if (nextBadge) {
    const currentMin = currentBadge.minAmount;
    const nextMin = nextBadge.minAmount;
    const progress = totalEarnings - currentMin;
    const total = nextMin - currentMin;
    progressToNext = Math.min(100, Math.max(0, (progress / total) * 100));
  } else {
    // Platin seviyesindeyse %100
    progressToNext = 100;
  }

  return {
    currentBadge,
    totalEarnings,
    nextBadge,
    progressToNext: Math.round(progressToNext)
  };
}

/**
 * Rozet seviyesine göre özel stil döndürür
 */
export function getBadgeStyles(badge: Badge) {
  return {
    gradient: `bg-gradient-to-r ${badge.bgColor}`,
    color: badge.color,
    shadow: `shadow-lg shadow-${badge.level.toLowerCase()}/20`
  };
}

/**
 * Rozet seviyesine göre QR kod stil teması döndürür
 */
export function getQRTheme(badge: Badge) {
  const themes = {
    [BadgeLevel.BRONZE]: {
      background: "from-amber-50 to-amber-100",
      border: "border-amber-300",
      accent: "from-amber-600 to-amber-800",
      text: "text-amber-900"
    },
    [BadgeLevel.SILVER]: {
      background: "from-gray-50 to-gray-100", 
      border: "border-gray-300",
      accent: "from-gray-400 to-gray-600",
      text: "text-gray-900"
    },
    [BadgeLevel.GOLD]: {
      background: "from-yellow-50 to-yellow-100",
      border: "border-yellow-300", 
      accent: "from-yellow-400 to-yellow-600",
      text: "text-yellow-900"
    },
    [BadgeLevel.PLATINUM]: {
      background: "from-purple-50 to-purple-100",
      border: "border-purple-300",
      accent: "from-purple-400 to-purple-600", 
      text: "text-purple-900"
    }
  };

  return themes[badge.level];
}
