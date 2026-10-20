"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/catalog";

export type CategoryFilter = "all" | Category;
export type TagFilter = "all" | "mixed-ip";

export const categoryOptions: Array<{ value: CategoryFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "figures", label: "Figures" },
  { value: "plush", label: "Plush" },
  { value: "accessories", label: "Accessories" },
  { value: "collaborations", label: "Collaborations" },
];

export function FilterPill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`chunky-button flex h-11 min-w-[92px] shrink-0 items-center justify-center px-4 text-[11px] uppercase ${
        active ? "border-ink bg-ink text-canvas" : "border-hairline-strong bg-surface text-body hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function FilterRail({ label, children }: { label: string; children: React.ReactNode }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const updateEdges = () => {
      setCanScrollLeft(rail.scrollLeft > 1);
      setCanScrollRight(rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 1);
    };
    updateEdges();
    const observer = new ResizeObserver(updateEdges);
    observer.observe(rail);
    window.addEventListener("resize", updateEdges);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateEdges);
    };
  }, []);

  return (
    <div className="relative w-full min-w-0 overflow-hidden">
      <span className={`filter-rail-fade filter-rail-fade-left ${canScrollLeft ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
      <div ref={railRef} onScroll={() => {
        const rail = railRef.current;
        if (!rail) return;
        setCanScrollLeft(rail.scrollLeft > 1);
        setCanScrollRight(rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 1);
      }} className="no-scrollbar flex w-full min-w-0 gap-2 overflow-x-auto overflow-y-hidden pb-1" aria-label={label}>
        {children}
      </div>
      <span className={`filter-rail-fade filter-rail-fade-right ${canScrollRight ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
    </div>
  );
}
