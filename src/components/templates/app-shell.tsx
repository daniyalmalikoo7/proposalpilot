"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/organisms/sidebar";
import { ThemeToggle } from "@/components/molecules/theme-toggle";
import { ThemedUserButton } from "@/components/molecules/themed-user-button";
import { Button } from "@/components/atoms/button";

export function AppShell({ children }: { readonly children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Skip-to-content — first focusable element on every app route */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background-elevated px-4 shadow-sticky">
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
              <ThemedUserButton />
            </div>
          </header>
          <main id="main-content" className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
