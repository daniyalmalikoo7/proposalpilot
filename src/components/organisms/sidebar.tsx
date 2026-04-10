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

interface SidebarProps {
  readonly mobileOpen?: boolean;
  readonly onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "flex h-full w-60 shrink-0 flex-col border-r border-pp-border bg-pp-background-card",
          // On mobile: fixed overlay; on desktop: static in the flex layout
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out",
          "md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-11 items-center gap-2 border-b border-pp-border px-5">
          <Zap className="h-5 w-5 text-pp-accent" />
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
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-pp-accent/10 text-pp-accent"
                    : "text-pp-foreground-muted hover:bg-pp-background-elevated",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Get started CTA */}
        <div className="border-t border-pp-border p-2">
          <Link
            href="/onboarding"
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/onboarding")
                ? "bg-pp-accent/10 text-pp-accent"
                : "text-pp-foreground-muted hover:bg-pp-background-elevated",
            )}
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            Get started
          </Link>
          <p className="mt-2 px-3 text-[11px] text-pp-foreground-muted">
            v0.1.0
          </p>
        </div>
      </aside>
    </>
  );
}
