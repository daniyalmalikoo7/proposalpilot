import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — ProposalPilot",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization, brand voice, and integrations.
        </p>
      </div>

      <div className="grid gap-6">
        {[
          {
            title: "Brand Voice",
            description:
              "Analyze your past proposals to configure the AI's writing style.",
          },
          {
            title: "Team Members",
            description: "Invite colleagues and manage access.",
          },
          {
            title: "Billing & Plan",
            description: "Manage your subscription and usage limits.",
          },
          {
            title: "Integrations",
            description: "Connect CRM, document storage, and other tools.",
          },
        ].map((section) => (
          <div
            key={section.title}
            className="rounded-lg border border-border bg-card p-6"
          >
            <h2 className="text-sm font-medium">{section.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {section.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
