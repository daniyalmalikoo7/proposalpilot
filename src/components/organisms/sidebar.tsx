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
import { motion } from "framer-motion";
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
          "flex h-full w-64 shrink-0 flex-col border-r border-border bg-background-subtle",
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out",
          "md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-border px-5">
          <Zap className="h-5 w-5 text-[hsl(var(--accent))]" />
          <span className="text-sm font-semibold tracking-tight">
            ProposalPilot
          </span>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2"
        >
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
                  "relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-1",
                  isActive
                    ? "text-[hsl(var(--accent))]"
                    : "text-foreground-muted hover:bg-background-elevated hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-md bg-accent-muted"
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  />
                )}
                <Icon className="relative h-4 w-4 shrink-0" />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Get started CTA */}
        <div className="border-t border-border p-2">
          <Link
            href="/onboarding"
            onClick={onMobileClose}
            className={cn(
              "relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-1",
              pathname.startsWith("/onboarding")
                ? "text-[hsl(var(--accent))]"
                : "text-foreground-muted hover:bg-background-elevated hover:text-foreground",
            )}
          >
            {pathname.startsWith("/onboarding") && (
              <motion.span
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-md bg-accent-muted"
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              />
            )}
            <Sparkles className="relative h-4 w-4 shrink-0" />
            <span className="relative">Get started</span>
          </Link>
          <p className="mt-2 px-3 text-xs text-foreground-dim">v0.1.0</p>
        </div>
      </aside>
    </>
  );
}
