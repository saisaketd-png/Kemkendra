"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Filter,
  X,
  RotateCcw,
  Check,
  ChevronDown,
  ShieldCheck,
  PackageCheck,
} from "lucide-react";
import { SearchQueryParams } from "../types/searchTypes";

interface SearchFilterSidebarProps {
  currentFilters: SearchQueryParams;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const CATEGORIES = [
  { label: "All Categories", value: "" },
  { label: "Active Pharmaceutical Ingredients (APIs)", value: "API" },
  { label: "Chemical Intermediates", value: "INTERMEDIATE" },
  { label: "Industrial & Pharma Solvents", value: "SOLVENT" },
  { label: "Specialty & Fine Chemicals", value: "SPECIALTY_CHEMICAL" },
  { label: "Pharmaceutical Excipients", value: "EXCIPIENT" },
  { label: "Laboratory & Analytical Reagents", value: "LAB_CHEMICAL" },
];

const COMMON_GRADES = [
  "USP",
  "EP",
  "BP",
  "CP",
  "Tech Grade",
  "ACS",
  "HPLC",
  "Food Grade",
];

export function SearchFilterSidebar({
  currentFilters,
  isMobileOpen = false,
  onCloseMobile,
}: SearchFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local filter states for inputs that benefit from form submission
  const [minPurity, setMinPurity] = useState(currentFilters.minPurity ? String(currentFilters.minPurity) : "");
  const [maxPurity, setMaxPurity] = useState(currentFilters.maxPurity ? String(currentFilters.maxPurity) : "");
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice ? String(currentFilters.minPrice) : "");
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice ? String(currentFilters.maxPrice) : "");
  const [country, setCountry] = useState(currentFilters.country || "");

  const updateParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value !== undefined && value !== "" && value !== null) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Always reset page to 0 on filter update
    params.delete("page");
    router.push(`/search?${params.toString()}`);
  };

  const applyNumericFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (minPurity) params.set("minPurity", minPurity); else params.delete("minPurity");
    if (maxPurity) params.set("maxPurity", maxPurity); else params.delete("maxPurity");
    if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice");
    if (country.trim()) params.set("country", country.trim()); else params.delete("country");
    params.delete("page");
    router.push(`/search?${params.toString()}`);
    if (onCloseMobile) onCloseMobile();
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (currentFilters.q) {
      params.set("q", currentFilters.q);
    }
    setMinPurity("");
    setMaxPurity("");
    setMinPrice("");
    setMaxPrice("");
    setCountry("");
    router.push(`/search?${params.toString()}`);
    if (onCloseMobile) onCloseMobile();
  };

  const hasActiveFilters = Boolean(
    currentFilters.category ||
    currentFilters.minPurity ||
    currentFilters.maxPurity ||
    currentFilters.supplierName ||
    currentFilters.country ||
    currentFilters.verifiedOnly ||
    currentFilters.inStockOnly ||
    currentFilters.minPrice ||
    currentFilters.maxPrice ||
    currentFilters.grade
  );

  const filterContent = (
    <div className="space-y-6">
      {/* Header with Clear All */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#0052CC]" />
          <span className="text-sm font-bold text-[#0F172A]">Refine Catalog</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-[#0052CC] hover:underline inline-flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. Category Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
          Chemical Category
        </label>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isSelected = (!currentFilters.category && cat.value === "") || currentFilters.category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => updateParam("category", cat.value || undefined)}
                className={`w-full text-left px-2.5 py-1.5 rounded-[6px] text-xs transition-colors flex items-center justify-between ${
                  isSelected
                    ? "bg-[#EFF6FF] text-[#0052CC] font-semibold"
                    : "text-[#334155] hover:bg-[#F8FAFC]"
                }`}
              >
                <span className="truncate">{cat.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Verification & Stock Toggles */}
      <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
        <label className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
          Supplier & Stock Status
        </label>
        
        <label className="flex items-center gap-2 text-xs text-[#1E293B] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(currentFilters.verifiedOnly)}
            onChange={(e) => updateParam("verifiedOnly", e.target.checked ? "true" : undefined)}
            className="rounded border-[#CBD5E1] text-[#0052CC] focus:ring-[#0052CC]"
          />
          <ShieldCheck className="w-3.5 h-3.5 text-[#00875A]" />
          <span>Verified Suppliers Only</span>
        </label>

        <label className="flex items-center gap-2 text-xs text-[#1E293B] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(currentFilters.inStockOnly)}
            onChange={(e) => updateParam("inStockOnly", e.target.checked ? "true" : undefined)}
            className="rounded border-[#CBD5E1] text-[#0052CC] focus:ring-[#0052CC]"
          />
          <PackageCheck className="w-3.5 h-3.5 text-[#0052CC]" />
          <span>In Stock / Ready to Ship</span>
        </label>
      </div>

      {/* 3. Purity Range & Price Range Form */}
      <form onSubmit={applyNumericFilters} className="space-y-4 pt-2 border-t border-[#E2E8F0]">
        {/* Purity (%) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
            Purity (% min - max)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={minPurity}
              onChange={(e) => setMinPurity(e.target.value)}
              placeholder="Min %"
              className="h-8 px-2 text-xs bg-white border border-[#CBD5E1] rounded-[6px] focus:outline-none focus:border-[#0052CC]"
            />
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={maxPurity}
              onChange={(e) => setMaxPurity(e.target.value)}
              placeholder="Max %"
              className="h-8 px-2 text-xs bg-white border border-[#CBD5E1] rounded-[6px] focus:outline-none focus:border-[#0052CC]"
            />
          </div>
        </div>

        {/* Indicative Benchmark Price ($/kg) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
            Indicative Price ($ / kg)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="1"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min $"
              className="h-8 px-2 text-xs bg-white border border-[#CBD5E1] rounded-[6px] focus:outline-none focus:border-[#0052CC]"
            />
            <input
              type="number"
              step="1"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max $"
              className="h-8 px-2 text-xs bg-white border border-[#CBD5E1] rounded-[6px] focus:outline-none focus:border-[#0052CC]"
            />
          </div>
        </div>

        {/* Origin Country */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
            Origin Country
          </label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. India, Germany, China"
            className="w-full h-8 px-2 text-xs bg-white border border-[#CBD5E1] rounded-[6px] focus:outline-none focus:border-[#0052CC]"
          />
        </div>

        <button
          type="submit"
          className="w-full h-8 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-[6px] transition-colors"
        >
          Apply Ranges
        </button>
      </form>

      {/* 4. Grade Filter */}
      <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
        <label className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
          Product Grade
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_GRADES.map((g) => {
            const isSelected = currentFilters.grade === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => updateParam("grade", isSelected ? undefined : g)}
                className={`text-xs px-2.5 py-1 rounded-[6px] border transition-colors ${
                  isSelected
                    ? "bg-[#0052CC] text-white border-[#0052CC] font-semibold"
                    : "bg-white text-[#334155] border-[#CBD5E1] hover:bg-slate-50"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visible lg+) */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-4 shadow-xs sticky top-24">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer content */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
                <span className="font-bold text-sm text-[#0F172A]">Filter Results</span>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {filterContent}
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] mt-6">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full h-10 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[6px] transition-colors"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
