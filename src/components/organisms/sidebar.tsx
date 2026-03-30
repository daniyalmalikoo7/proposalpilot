"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Settings,
  Zap,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Proposals", href: "/proposals", icon: FileText },
  { label: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-11 items-center gap-2 border-b border-border px-5">
        <Zap className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold tracking-tight">
          ProposalPilot
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Get started CTA */}
      <div className="border-t border-border p-2">
        <Link
          href="/onboarding"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith("/onboarding")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          Get started
        </Link>
        <p className="mt-2 px-3 text-[11px] text-muted-foreground">v0.1.0</p>
      </div>
    </aside>
  );
}
