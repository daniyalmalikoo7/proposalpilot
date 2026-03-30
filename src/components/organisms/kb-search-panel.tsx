"use client";

// KBSearchPanel — right panel of the proposal editor.
// Allows semantic search over the knowledge base and selecting KB items for AI context.

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
  /** Called when user submits a search query — returns items to display */
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
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-l border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          Knowledge Base
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {selectedKbItemIds.size} selected for context
        </p>
      </div>

      {/* Search input */}
      <div className="border-b border-border p-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search knowledge base…"
              className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">
              Search past proposals, case studies, and capabilities.
            </p>
          </div>
        )}

        {hasSearched && results.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground">No results found.</p>
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
                    className={cn(
                      "w-full rounded-md border px-3 py-2 text-left text-xs transition-colors",
                      isSelected
                        ? "border-primary/40 bg-primary/5"
                        : "border-transparent hover:border-border hover:bg-accent",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="shrink-0 text-[10px]"
                          >
                            {KB_TYPE_LABELS[item.type] ?? item.type}
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 font-medium text-foreground">
                          {item.title}
                        </p>
                        {item.content && (
                          <p className="mt-0.5 line-clamp-2 text-muted-foreground">
                            {item.content.slice(0, 120)}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
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
