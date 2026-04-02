"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { KBItemCard } from "@/components/molecules/kb-item-card";
import { KBUploadForm } from "@/components/organisms/kb-upload-form";
import { trpc } from "@/lib/trpc/client";
import type { KBItem, KBItemType } from "@/lib/types/proposal";
import { cn } from "@/lib/utils";

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

// Map DB row to the KBItem display type.
type DbKBItem = {
  id: string;
  type: string;
  title: string;
  content: string;
  isWin: boolean;
  metadata: unknown;
  createdAt: Date;
  _count: { chunks: number };
};

function mapDbItem(item: DbKBItem): KBItem {
  const meta = (item.metadata ?? {}) as Record<string, unknown>;
  const fileSize = typeof meta.fileSize === "number" ? meta.fileSize : 0;
  return {
    id: item.id,
    title: item.title,
    type: item.type as KBItemType,
    fileSize,
    uploadedAt: item.createdAt,
    isWin: item.isWin,
    contentPreview: item.content.slice(0, 200),
    chunkCount: item._count.chunks,
  };
}

export default function KnowledgeBasePage() {
  const [activeType, setActiveType] = useState<KBItemType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const utils = trpc.useUtils();
  const deleteKbItem = trpc.kb.delete.useMutation({
    onSuccess: () => void utils.kb.list.invalidate(),
  });

  // Debounce search input by 300 ms.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isSearching = debouncedQuery.trim() !== "";

  const { data: listData, isLoading: listLoading } = trpc.kb.list.useQuery(
    {
      type: activeType !== "ALL" ? (activeType as KBItemType) : undefined,
      limit: 100,
    },
    { enabled: !isSearching },
  );

  const { data: searchData, isLoading: searchLoading } =
    trpc.kb.search.useQuery(
      {
        query: debouncedQuery.trim(),
        type: activeType !== "ALL" ? (activeType as KBItemType) : undefined,
        limit: 20,
      },
      { enabled: isSearching },
    );

  const isLoading = isSearching ? searchLoading : listLoading;

  const items = useMemo((): KBItem[] => {
    if (isSearching) {
      return (searchData ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        type: r.type as KBItemType,
        fileSize: 0,
        uploadedAt: new Date(),
        isWin: false,
      }));
    }
    return (listData?.items ?? []).map(mapDbItem);
  }, [isSearching, listData, searchData]);

  // Counts for type filter tabs (only meaningful in list mode).
  const allItems = useMemo(
    () => (listData?.items ?? []).map(mapDbItem),
    [listData],
  );
  const getCount = (t: KBItemType | "ALL") =>
    t === "ALL" ? allItems.length : allItems.filter((i) => i.type === t).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Knowledge Base
          </h1>
          <p className="text-sm text-muted-foreground">
            {allItems.length} documents · powers your AI generation
          </p>
        </div>
        <Button size="sm" onClick={() => setShowUpload((v) => !v)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Upload form (togglable) */}
      {showUpload && (
        <KBUploadForm
          onSuccess={() => setShowUpload(false)}
          onCancel={() => setShowUpload(false)}
        />
      )}

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
          const count = getCount(tab.value);
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
              {!isSearching && (
                <span
                  className={cn(
                    "rounded-full px-1.5 font-mono text-[10px]",
                    isActive ? "bg-primary-foreground/20" : "bg-background",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {isSearching ? "Searching…" : "Loading…"}
        </div>
      )}

      {/* Grid */}
      {!isLoading && items.length === 0 && (
        <div className="rounded-lg border border-border bg-card px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {isSearching
              ? "No results match your search."
              : "No documents in this category."}
          </p>
          {!isSearching && activeType === "ALL" && (
            <Button
              size="sm"
              className="mt-4"
              onClick={() => setShowUpload(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Upload your first document
            </Button>
          )}
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <KBItemCard
              key={item.id}
              item={item}
              onDelete={() => deleteKbItem.mutate({ id: item.id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
