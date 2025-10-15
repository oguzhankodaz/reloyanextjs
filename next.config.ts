import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // ✅ Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=()'
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "media-src 'self' data: blob:",
              "connect-src 'self' https:",
              "frame-src https://www.paytr.com https://paytr.com",
              "child-src https://www.paytr.com https://paytr.com", // eski tarayıcılar için
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self' https://www.paytr.com https://paytr.com"
            ].join('; ')
          },
          // X-Frame-Options SAMEORIGIN, CSP frame-src ile çakışabilir; PayTR iFrame için kaldırıyoruz
          // Alternatif: Sadece belirli rotalarda header override edilir
          // { key: 'X-Frame-Options', value: 'SAMEORIGIN' }
        ],
      },
    ];
  },
};

export default nextConfig;
