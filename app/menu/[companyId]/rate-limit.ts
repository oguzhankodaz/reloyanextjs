import { NextRequest } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * Menu sayfası için rate limiting
 * Aşırı yüklenmeyi önlemek için
 */
export function checkMenuRateLimit(request: NextRequest) {
  const ip = getClientIp(request);
  const identifier = `menu:${ip}`;
  
  // Menu sayfası için: 30 istek/dakika
  const rateLimit = checkRateLimit(identifier, "menu");
  
  if (!rateLimit.allowed) {
    return {
      allowed: false,
      retryAfter: rateLimit.retryAfter,
      message: "Çok fazla istek gönderildi. Lütfen biraz bekleyin."
    };
  }
  
  return {
    allowed: true,
    remaining: rateLimit.remaining
  };
}
