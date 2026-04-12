"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Plus, Search } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Skeleton } from "@/components/atoms/skeleton";
import { FilterTabBar } from "@/components/molecules/filter-tab-bar";
import { KBItemCard } from "@/components/molecules/kb-item-card";
import { KBUploadForm } from "@/components/organisms/kb-upload-form";
import { trpc } from "@/lib/trpc/client";
import type { KBItem, KBItemType } from "@/lib/types/proposal";

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

type DbKBItem = {
  id: string;
  type: string;
  title: string;
  isWin: boolean;
  metadata: unknown;
  createdAt: Date;
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
  };
}

export default function KnowledgeBasePage() {
  const [activeType, setActiveType] = useState<KBItemType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const utils = trpc.useUtils();
  const deleteMutation = trpc.kb.delete.useMutation({
    onSuccess: () => {
      void utils.kb.list.invalidate();
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };

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

  const allItems = useMemo(
    () => (listData?.items ?? []).map(mapDbItem),
    [listData],
  );

  const filterTabsWithCounts = TYPE_FILTERS.map((tab) => ({
    ...tab,
    count: !isSearching
      ? tab.value === "ALL"
        ? allItems.length
        : allItems.filter((i) => i.type === tab.value).length
      : undefined,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Knowledge Base
          </h1>
          <p className="text-sm text-foreground-muted">
            {allItems.length} documents · powers your AI generation
          </p>
        </div>
        <Button size="sm" onClick={() => setShowUpload((v) => !v)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Upload form */}
      {showUpload && (
        <KBUploadForm
          onSuccess={() => setShowUpload(false)}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your knowledge base…"
          className="pl-9"
        />
      </div>

      {/* Type filter tabs */}
      <FilterTabBar
        tabs={filterTabsWithCounts}
        activeTab={activeType}
        onTabChange={setActiveType}
        showCounts={!isSearching}
      />

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-lg border border-border bg-background-elevated p-4 shadow-sm"
            >
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="mt-1 h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-background-elevated px-6 py-16 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background-subtle">
            <BookOpen className="h-7 w-7 text-foreground-muted" />
          </div>
          <div>
            <p className="text-base font-semibold">
              {isSearching ? "No results found" : "Your knowledge base is empty"}
            </p>
            <p className="mt-1 text-sm text-foreground-muted">
              {isSearching
                ? "Try a different search term or browse all documents."
                : "Upload past proposals, case studies, and methodologies to boost AI generation accuracy."}
            </p>
          </div>
          {!isSearching && activeType === "ALL" && (
            <Button size="sm" onClick={() => setShowUpload(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Upload your first document
            </Button>
          )}
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <KBItemCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
