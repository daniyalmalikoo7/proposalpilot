"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Sidebar } from "@/components/organisms/sidebar";
import { ThemeToggle } from "@/components/molecules/theme-toggle";
import { Button } from "@/components/atoms/button";

export function AppShell({ children }: { readonly children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-11 shrink-0 items-center justify-between border-b border-border px-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          {/* Spacer so controls stay right-aligned on mobile */}
          <div className="flex-1 md:hidden" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserButton signInUrl="/sign-in" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
