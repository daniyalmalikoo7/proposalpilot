import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse and mammoth require Node.js native APIs — must not be bundled
  serverExternalPackages: [
    "pdf-parse",
    "mammoth",
    "docx",
    "@react-pdf/renderer",
  ],
  poweredByHeader: false,
  typedRoutes: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.clerk.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://api.clerk.io https://*.clerk.accounts.dev https://api.stripe.com https://api.anthropic.com https://api.voyageai.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.clerk.accounts.dev; frame-ancestors 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
