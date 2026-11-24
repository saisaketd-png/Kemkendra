"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { X, RotateCcw, ArrowUpDown, Rows } from "lucide-react";

interface ProductToolbarProps {
  totalResults: number;
}

const CATEGORY_NAMES: Record<string, string> = {
  API: "API & Actives",
  INTERMEDIATE: "Pharma Intermediates",
  EXCIPIENT: "Excipients",
  SOLVENT: "Solvents & Reagents",
  SPECIALTY_CHEMICAL: "Specialty Chemicals",
  LAB_CHEMICAL: "Lab Chemicals",
};

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "25", label: "25 per page" },
  { value: "50", label: "50 per page" },
];

export function ProductToolbar({ totalResults }: ProductToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSize = searchParams.get("size") || "20";
  const currentSort = searchParams.get("sort") || "";

  const updateParam = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.set("page", "0");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const removeParam = useCallback(
    (name: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(name);
      params.set("page", "0");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const clearAll = () => {
    router.push(pathname);
  };

  // Build active filter badges
  const activeChips: { key: string; label: string }[] = [];

  const search = searchParams.get("search");
  if (search) activeChips.push({ key: "search", label: `Search: "${search}"` });

  const category = searchParams.get("category");
  if (category) {
    activeChips.push({
      key: "category",
      label: `Category: ${CATEGORY_NAMES[category] || category.replace(/_/g, " ")}`,
    });
  }

  const casNumber = searchParams.get("casNumber");
  if (casNumber) activeChips.push({ key: "casNumber", label: `CAS: ${casNumber}` });

  const purityMin = searchParams.get("purityMin");
  if (purityMin) activeChips.push({ key: "purityMin", label: `Min Purity: ${purityMin}%` });

  const purityMax = searchParams.get("purityMax");
  if (purityMax) activeChips.push({ key: "purityMax", label: `Max Purity: ${purityMax}%` });

  const grade = searchParams.get("grade");
  if (grade) activeChips.push({ key: "grade", label: `Grade: ${grade}` });

  const maxPrice = searchParams.get("maxPrice");
  if (maxPrice) activeChips.push({ key: "maxPrice", label: `Max Price: ${maxPrice}` });

  const moqMax = searchParams.get("moqMax");
  if (moqMax) activeChips.push({ key: "moqMax", label: `Max MOQ: ${moqMax} kg` });

  const maxLeadTime = searchParams.get("maxLeadTime");
  if (maxLeadTime) activeChips.push({ key: "maxLeadTime", label: `Lead Time: ≤ ${maxLeadTime}d` });

  if (searchParams.get("inStock") === "true") {
    activeChips.push({ key: "inStock", label: "In Stock Only" });
  }

  if (searchParams.get("verified") === "true") {
    activeChips.push({ key: "verified", label: "Verified Suppliers Only" });
  }

  if (searchParams.get("coa") === "true") {
    activeChips.push({ key: "coa", label: "COA Available" });
  }

  if (searchParams.get("msds") === "true") {
    activeChips.push({ key: "msds", label: "MSDS / SDS" });
  }

  if (searchParams.get("exportReady") === "true") {
    activeChips.push({ key: "exportReady", label: "Export Ready" });
  }

  return (
    <div className="bg-white px-4 sm:px-6 py-4 rounded-xl border border-slate-200/90 shadow-tactile-card space-y-3.5">
      {/* Top Header Row: Count + Controls (Results Per Page & Sort) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
            {totalResults} {totalResults === 1 ? "Chemical Listing" : "Chemical Listings"} Found
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Verified pharmaceutical APIs, intermediates, and industrial materials
          </p>
        </div>

        {/* Controls: Page Size + Sort Selector */}
        <div className="flex items-center flex-wrap gap-2.5 self-start sm:self-auto">
          {/* Show N Results Selector */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="catalog-size-select"
              className="text-xs font-semibold text-[#64748B] flex items-center gap-1"
            >
              <Rows className="w-3.5 h-3.5 text-slate-400" />
              <span>Show:</span>
            </label>
            <select
              id="catalog-size-select"
              value={currentSize}
              onChange={(e) => updateParam("size", e.target.value)}
              className="h-8.5 px-2.5 bg-[#F8F9FA] hover:bg-white border border-slate-200 focus:border-[#0052CC] text-[#0F172A] text-xs font-semibold rounded-lg focus:outline-none cursor-pointer transition-all shadow-2xs"
              aria-label="Number of results per page"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="catalog-sort-select"
              className="text-xs font-semibold text-[#64748B] flex items-center gap-1"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
            </label>
            <select
              id="catalog-sort-select"
              value={currentSort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="h-8.5 px-2.5 bg-[#F8F9FA] hover:bg-white border border-slate-200 focus:border-[#0052CC] text-[#0F172A] text-xs font-semibold rounded-lg focus:outline-none cursor-pointer transition-all shadow-2xs"
              aria-label="Sort chemicals"
            >
              <option value="">Best Match</option>
              <option value="name,asc">Chemical Name (A–Z)</option>
              <option value="name,desc">Chemical Name (Z–A)</option>
              <option value="createdAt,desc">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Strip */}
      {activeChips.length > 0 && (
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-[#64748B] mr-1">
            Active filters:
          </span>

          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-[#0F172A] border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={() => removeParam(chip.key)}
                className="p-0.5 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
                aria-label={`Remove filter ${chip.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#64748B] hover:text-[#0052CC] transition-colors ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset all</span>
          </button>
        </div>
      )}
    </div>
  );
}