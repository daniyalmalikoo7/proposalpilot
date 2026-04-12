"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FilterTab<T extends string> {
  label: string;
  value: T;
  count?: number;
}

interface FilterTabBarProps<T extends string> {
  readonly tabs: ReadonlyArray<FilterTab<T>>;
  readonly activeTab: T;
  readonly onTabChange: (value: T) => void;
  readonly showCounts?: boolean;
  readonly className?: string;
}

export function FilterTabBar<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  showCounts = true,
  className,
}: FilterTabBarProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]',
    );
    if (!buttons) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = buttons[(index + 1) % buttons.length];
      next?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = buttons[(index - 1 + buttons.length) % buttons.length];
      prev?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      buttons[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      buttons[buttons.length - 1]?.focus();
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Filter tabs"
      className={cn(
        "flex flex-wrap items-center gap-0.5",
        className,
      )}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "relative flex min-h-[44px] items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-1",
              isActive
                ? "text-[hsl(var(--accent-foreground))]"
                : "text-foreground-muted hover:bg-background-elevated hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="filter-tab-active"
                className="absolute inset-0 rounded-md bg-[hsl(var(--accent))]"
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              />
            )}
            <span className="relative">{tab.label}</span>
            {showCounts && tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 font-mono text-2xs",
                  isActive
                    ? "relative bg-[hsl(var(--accent-foreground))]/20"
                    : "bg-background-subtle",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
