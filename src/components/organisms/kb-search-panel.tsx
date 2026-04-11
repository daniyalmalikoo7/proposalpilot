"use client";

import { useState, useCallback } from "react";
import { Search, BookOpen, Check } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

const KB_TYPE_LABELS: Record<string, string> = {
  CASE_STUDY: "Case Study",
  PAST_PROPOSAL: "Past Proposal",
  METHODOLOGY: "Methodology",
  TEAM_BIO: "Team Bio",
  PRICING: "Pricing",
  CERTIFICATE: "Certificate",
  OTHER: "Other",
};

export interface KBItem {
  id: string;
  type: string;
  title: string;
  content?: string;
}

interface KBSearchPanelProps {
  readonly selectedKbItemIds: ReadonlySet<string>;
  readonly onToggleKbItem: (id: string) => void;
  readonly onSearch: (query: string) => Promise<KBItem[]>;
}

export function KBSearchPanel({
  selectedKbItemIds,
  onToggleKbItem,
  onSearch,
}: KBSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KBItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearching(true);
    try {
      const items = await onSearch(trimmed);
      setResults(items);
      setHasSearched(true);
    } finally {
      setSearching(false);
    }
  }, [query, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") void handleSearch();
    },
    [handleSearch],
  );

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-l border-border bg-background-subtle">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Knowledge Base</h2>
        <p className="mt-0.5 text-xs text-foreground-muted">
          {selectedKbItemIds.size} selected for context
        </p>
      </div>

      {/* Search input */}
      <div className="border-b border-border p-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search knowledge base…"
              aria-label="Search knowledge base"
              className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-2 text-xs placeholder:text-foreground-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void handleSearch()}
            disabled={searching || !query.trim()}
            className="h-7 px-2 text-xs"
          >
            {searching ? "…" : "Go"}
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {!hasSearched && (
          <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
            <BookOpen className="h-8 w-8 text-foreground-dim" />
            <p className="text-xs text-foreground-muted">
              Search past proposals, case studies, and capabilities.
            </p>
          </div>
        )}

        {hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
            <Search className="h-6 w-6 text-foreground-dim" />
            <p className="text-xs font-medium">No results found</p>
            <p className="text-xs text-foreground-muted">
              Try different keywords or upload more documents.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <ul className="space-y-1 p-2">
            {results.map((item) => {
              const isSelected = selectedKbItemIds.has(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onToggleKbItem(item.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "w-full rounded-md border px-3 py-2 text-left text-xs transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]",
                      isSelected
                        ? "border-[hsl(var(--accent))]/40 bg-accent-muted"
                        : "border-transparent hover:border-border hover:bg-background-elevated",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="shrink-0 text-2xs"
                          >
                            {KB_TYPE_LABELS[item.type] ?? item.type}
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 font-medium">
                          {item.title}
                        </p>
                        {item.content && (
                          <p className="mt-0.5 line-clamp-2 text-foreground-muted">
                            {item.content.slice(0, 120)}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--accent))]" />
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
