import { AppShell } from "@/components/templates/app-shell";

export default function AppLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
