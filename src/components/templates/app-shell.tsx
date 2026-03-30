import { Sidebar } from "@/components/organisms/sidebar";
import { ThemeToggle } from "@/components/molecules/theme-toggle";

export function AppShell({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-11 shrink-0 items-center justify-end border-b border-border px-4">
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
