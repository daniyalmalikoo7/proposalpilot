"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

type SettingsTab = "organization" | "team" | "billing";

const TABS: ReadonlyArray<{ value: SettingsTab; label: string }> = [
  { value: "organization", label: "Organization" },
  { value: "team", label: "Team" },
  { value: "billing", label: "Billing" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("organization");
  const [orgName, setOrgName] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: org, isLoading: orgLoading } = trpc.settings.getOrg.useQuery();

  // Sync fetched org name into local state once loaded.
  useEffect(() => {
    if (org?.name) setOrgName(org.name);
  }, [org?.name]);

  const utils = trpc.useUtils();

  const updateOrg = trpc.settings.updateOrg.useMutation({
    onSuccess: () => {
      void utils.settings.getOrg.invalidate();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    },
  });

  const createPortal = trpc.billing.createPortalSession.useMutation({
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
    },
  });

  function handleSaveOrg() {
    if (!orgName.trim()) return;
    updateOrg.mutate({ name: orgName.trim() });
  }

  function handleManageBilling() {
    createPortal.mutate({ returnUrl: window.location.href });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organisation, team, and billing.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.value
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Organization */}
      {tab === "organization" && (
        <div className="max-w-lg space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">
              Organisation name
            </label>
            <Input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              disabled={orgLoading || updateOrg.isPending}
              placeholder={orgLoading ? "Loading…" : "Your organisation name"}
            />
          </div>

          {updateOrg.error && (
            <p className="text-sm text-destructive">
              {updateOrg.error.message}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleSaveOrg}
              disabled={
                !orgName.trim() ||
                orgLoading ||
                updateOrg.isPending ||
                orgName.trim() === (org?.name ?? "")
              }
            >
              {updateOrg.isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Save changes
            </Button>
            {saveSuccess && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                Saved!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Team (display-only for now — Clerk manages invitations) */}
      {tab === "team" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Team members are managed through Clerk.
            </p>
            <Button size="sm" disabled>
              <Plus className="mr-1.5 h-4 w-4" />
              Invite member
            </Button>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Use your Clerk organisation dashboard to invite and manage team
              members.
            </p>
          </div>
        </div>
      )}

      {/* Billing */}
      {tab === "billing" && (
        <div className="max-w-lg space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Current plan
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold capitalize tracking-tight">
                  {orgLoading ? "—" : (org?.plan ?? "starter")}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {org?.monthlyProposalLimit
                    ? `${org.monthlyProposalLimit} proposals / month`
                    : ""}
                </p>
              </div>
              {org?.stripeCustomerId && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  Active
                </span>
              )}
            </div>

            {createPortal.error && (
              <p className="mt-3 text-sm text-destructive">
                {createPortal.error.message}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <Button
                size="sm"
                onClick={handleManageBilling}
                disabled={createPortal.isPending || !org?.stripeCustomerId}
              >
                {createPortal.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                )}
                Manage billing
              </Button>
              <Button variant="outline" size="sm" disabled>
                Upgrade plan
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Billing is managed through Stripe. Click &quot;Manage
              billing&quot; to update your payment method, download invoices, or
              cancel your subscription.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
