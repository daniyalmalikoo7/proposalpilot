import { AppShell } from "@/components/templates/app-shell";
import { PageTransition } from "@/components/atoms/page-transition";

export default function AppLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <AppShell>
      <PageTransition>{children}</PageTransition>
    </AppShell>
  );
}
