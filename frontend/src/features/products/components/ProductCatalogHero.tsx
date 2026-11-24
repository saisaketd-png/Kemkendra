"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowRight, X, ShieldCheck, FileText, CheckCircle2, SlidersHorizontal } from "lucide-react";

interface ProductCatalogHeroProps {
  categories?: string[];
}

const CANONICAL_CATEGORIES = [
  { value: "API", label: "Active Pharmaceutical Ingredients", short: "APIs" },
  { value: "INTERMEDIATE", label: "Pharma Intermediates", short: "Intermediates" },
  { value: "EXCIPIENT", label: "Pharmaceutical Excipients", short: "Excipients" },
  { value: "SOLVENT", label: "Solvents & Reagents", short: "Solvents" },
  { value: "SPECIALTY_CHEMICAL", label: "Specialty Chemicals", short: "Specialties" },
  { value: "LAB_CHEMICAL", label: "Laboratory Chemicals", short: "Lab Chemicals" },
];

export function ProductCatalogHero({ categories = [] }: ProductCatalogHeroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }

    if (selectedCategory) {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }

    params.set("page", "0");
    router.push(`/products?${params.toString()}`);
  };

  const handleQuickCategorySelect = (categoryKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!categoryKey || categoryKey === selectedCategory) {
      params.delete("category");
      setSelectedCategory("");
    } else {
      params.set("category", categoryKey);
      setSelectedCategory(categoryKey);
    }
    params.set("page", "0");
    router.push(`/products?${params.toString()}`);
  };

  const activeCategoryParam = searchParams.get("category") || "";
  const categoryOptions = CANONICAL_CATEGORIES;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#091E42] text-white shadow-xl border border-[#1E293B]">
      {/* Subtle architectural coordinate grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }} 
      />

      <div className="relative p-6 sm:p-8 lg:p-10 space-y-7">
        {/* Top Header & Context */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Chemical Catalog &amp; Procurement
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              Source verified pharmaceutical APIs, intermediates, and high-purity industrial excipients. Direct access to certified cGMP manufacturers with active compliance records and validated test specifications.
            </p>
          </div>

          {/* Quick Assurance Badges - Clean minimalist typography, not AI pills */}
          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2.5 text-xs text-slate-300">
            <div className="inline-flex items-center gap-1.5 font-medium text-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>100% Quality &amp; COA Verified</span>
            </div>
            <div className="inline-flex items-center gap-1.5 font-medium text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>cGMP &amp; ISO Audited Suppliers</span>
            </div>
          </div>
        </div>

        {/* High-Performance Search & Category Filter Bar */}
        <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/15 shadow-inner">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chemical name, CAS number (e.g. 103-90-2), formula, or synonym..."
                className="w-full h-12 pl-10 pr-9 bg-white text-slate-900 placeholder:text-slate-400 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="sm:w-64 hidden sm:block">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by chemical category"
                className="w-full h-12 px-3.5 bg-white text-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all cursor-pointer"
              >
                <option value="">All Categories</option>
                {categoryOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="h-12 px-7 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-sm font-semibold rounded-lg transition-all inline-flex items-center justify-center gap-2 shrink-0 shadow-md press-tactile"
            >
              <span>Search Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Clean Category Quick-Tabs & Sourcing Link */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1 border-t border-white/10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
            <button
              type="button"
              onClick={() => handleQuickCategorySelect("")}
              className={`h-7 px-3 rounded-md text-xs font-medium shrink-0 transition-colors ${
                !activeCategoryParam
                  ? "bg-white text-slate-950 font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              All Chemicals
            </button>
            {categoryOptions.map((cat) => {
              const isSelected = activeCategoryParam.toUpperCase() === cat.value.toUpperCase();
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleQuickCategorySelect(cat.value)}
                  className={`h-7 px-3 rounded-md text-xs font-medium shrink-0 transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cat.short}
                </button>
              );
            })}
          </div>

          <Link
            href="/sourcing/request"
            className="text-xs font-medium text-slate-300 hover:text-white inline-flex items-center gap-1.5 transition-colors shrink-0 group self-end sm:self-center"
          >
            <span>Can&apos;t find your chemical? Request Sourcing</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-blue-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}