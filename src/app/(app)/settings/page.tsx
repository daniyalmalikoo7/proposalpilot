"use client";

import { useState } from "react";
import { ExternalLink, Plus, Mail, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { cn } from "@/lib/utils";

type SettingsTab = "organization" | "team" | "billing";

interface TeamMember {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: "Owner" | "Admin" | "Member";
  readonly joinedAt: string;
}

const MOCK_TEAM: ReadonlyArray<TeamMember> = [
  {
    id: "1",
    name: "Alex Torres",
    email: "alex@meridiangroup.com",
    role: "Owner",
    joinedAt: "Jan 2025",
  },
  {
    id: "2",
    name: "Jordan Lee",
    email: "jordan@meridiangroup.com",
    role: "Admin",
    joinedAt: "Jan 2025",
  },
  {
    id: "3",
    name: "Sam Patel",
    email: "sam@meridiangroup.com",
    role: "Member",
    joinedAt: "Feb 2025",
  },
];

const ROLE_STYLES: Readonly<Record<TeamMember["role"], string>> = {
  Owner: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  Admin: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  Member: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const TABS: ReadonlyArray<{ value: SettingsTab; label: string }> = [
  { value: "organization", label: "Organization" },
  { value: "team", label: "Team" },
  { value: "billing", label: "Billing" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("organization");
  const [orgName, setOrgName] = useState("Meridian Consulting Group");
  const [website, setWebsite] = useState("https://meridiangroup.com");
  const [industry, setIndustry] = useState("Professional Services");

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
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Website</label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              type="url"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Industry</label>
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe what your organisation does and who your typical clients are."
            />
          </div>
          <Button size="sm">Save changes</Button>
        </div>
      )}

      {/* Team */}
      {tab === "team" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {MOCK_TEAM.length} members
            </p>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Invite member
            </Button>
          </div>
          <div className="rounded-lg border border-border">
            {MOCK_TEAM.map((member, i) => (
              <div
                key={member.id}
                className={cn(
                  "flex items-center gap-4 px-4 py-3",
                  i < MOCK_TEAM.length - 1 && "border-b border-border",
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {getInitials(member.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3 shrink-0" />
                    {member.email}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium",
                    ROLE_STYLES[member.role],
                  )}
                >
                  {member.role}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {member.joinedAt}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            ))}
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
                <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">
                  Pro
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  $149 / month · billed monthly
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                Active
              </span>
            </div>

            <div className="mt-4 space-y-2.5 border-t border-border pt-4">
              {[
                { label: "Proposals this month", value: "4 / 20" },
                { label: "Knowledge base storage", value: "14.2 MB / 1 GB" },
                { label: "Team members", value: "3 / 10" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-mono font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <Button size="sm">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Manage billing
              </Button>
              <Button variant="outline" size="sm">
                Upgrade plan
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm font-medium">Next invoice</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              April 30, 2026 · $149.00
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
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
