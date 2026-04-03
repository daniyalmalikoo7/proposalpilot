import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack workspace-root fix: without this, Next.js 16 infers the wrong
  // root when the project lives inside a directory with sibling projects,
  // causing it to look for next/package.json from src/app instead of the repo root.
  turbopack: {
    root: process.cwd(),
  },
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
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.clerk.io https://*.clerk.accounts.dev https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https: https://img.clerk.com; font-src 'self' data:; connect-src 'self' https://api.clerk.io https://*.clerk.accounts.dev https://api.clerk.com https://clerk.com https://*.clerk.com https://clerk-telemetry.com https://*.clerk.io https://api.stripe.com https://api.anthropic.com https://api.voyageai.com https://generativelanguage.googleapis.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.clerk.accounts.dev https://challenges.cloudflare.com; worker-src 'self' blob: https://*.clerk.accounts.dev; frame-ancestors 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
