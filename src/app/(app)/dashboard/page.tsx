import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — ProposalPilot",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your proposal pipeline at a glance.
        </p>
      </div>

      {/* Stats row — placeholder */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Active Proposals", value: "—" },
          { label: "Win Rate", value: "—" },
          { label: "Avg. Time to Submit", value: "—" },
          { label: "This Month", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent proposals placeholder */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium">Recent Proposals</h2>
        <p className="text-sm text-muted-foreground">
          No proposals yet. Create your first proposal to get started.
        </p>
      </div>
    </div>
  );
}
