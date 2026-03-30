"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { KBItemCard } from "@/components/molecules/kb-item-card";
import { UploadDropzone } from "@/components/organisms/upload-dropzone";
import type { KBItem, KBItemType } from "@/lib/types/proposal";
import { cn } from "@/lib/utils";

const KB = 1024;
const MB = 1024 * 1024;

const MOCK_ITEMS: KBItem[] = [
  {
    id: "1",
    title: "Smart City Digital Transformation — Apex Case Study 2023",
    type: "CASE_STUDY",
    fileSize: 2.4 * MB,
    uploadedAt: new Date("2024-11-12"),
    isWin: true,
  },
  {
    id: "2",
    title: "Cloud Migration Strategy Template v3",
    type: "METHODOLOGY",
    fileSize: 156 * KB,
    uploadedAt: new Date("2024-12-01"),
    isWin: false,
  },
  {
    id: "3",
    title: "Harbor Manufacturing ERP Proposal (Won)",
    type: "PAST_PROPOSAL",
    fileSize: 4.1 * MB,
    uploadedAt: new Date("2025-01-08"),
    isWin: true,
  },
  {
    id: "4",
    title: "Executive Team Bios — Updated Q1 2025",
    type: "TEAM_BIO",
    fileSize: 89 * KB,
    uploadedAt: new Date("2025-01-15"),
    isWin: false,
  },
  {
    id: "5",
    title: "Cybersecurity Practice Capabilities Deck",
    type: "CAPABILITY",
    fileSize: 3.2 * MB,
    uploadedAt: new Date("2025-02-03"),
    isWin: false,
  },
  {
    id: "6",
    title: "Pacific Retail Portal Proposal (Lost)",
    type: "PAST_PROPOSAL",
    fileSize: 2.8 * MB,
    uploadedAt: new Date("2025-02-20"),
    isWin: false,
  },
  {
    id: "7",
    title: "Data Analytics Services Overview",
    type: "CAPABILITY",
    fileSize: 1.5 * MB,
    uploadedAt: new Date("2025-03-01"),
    isWin: false,
  },
  {
    id: "8",
    title: "Agile Delivery Methodology — Internal Guide",
    type: "METHODOLOGY",
    fileSize: 445 * KB,
    uploadedAt: new Date("2025-03-10"),
    isWin: false,
  },
];

const TYPE_FILTERS: ReadonlyArray<{
  label: string;
  value: KBItemType | "ALL";
}> = [
  { label: "All", value: "ALL" },
  { label: "Case Studies", value: "CASE_STUDY" },
  { label: "Past Proposals", value: "PAST_PROPOSAL" },
  { label: "Methodology", value: "METHODOLOGY" },
  { label: "Team Bios", value: "TEAM_BIO" },
  { label: "Capabilities", value: "CAPABILITY" },
];

export default function KnowledgeBasePage() {
  const [activeType, setActiveType] = useState<KBItemType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const filtered = MOCK_ITEMS.filter((item) => {
    const matchesType = activeType === "ALL" || item.type === activeType;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = q === "" || item.title.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Knowledge Base
          </h1>
          <p className="text-sm text-muted-foreground">
            {MOCK_ITEMS.length} documents · powers your AI generation
          </p>
        </div>
        <Button size="sm" onClick={() => setShowUpload((v) => !v)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Upload (togglable) */}
      {showUpload && <UploadDropzone />}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your knowledge base…"
          className="pl-9"
        />
      </div>

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {TYPE_FILTERS.map((tab) => {
          const count =
            tab.value === "ALL"
              ? MOCK_ITEMS.length
              : MOCK_ITEMS.filter((i) => i.type === tab.value).length;
          const isActive = activeType === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveType(tab.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 font-mono text-[10px]",
                  isActive ? "bg-primary-foreground/20" : "bg-background",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? "No results match your search."
              : "No documents in this category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <KBItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
