import { NextResponse } from "next/server";

/**
 * GET /api/health
 *
 * Lightweight health check for uptime monitoring.
 * No DB connection — intentionally stateless so it's always fast.
 * Returns 200 as long as the Next.js runtime is alive.
 *
 * For external monitors (UptimeRobot, Vercel Cron, etc.) to hit.
 */
export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "0.1.0",
    },
    { status: 200 },
  );
}
