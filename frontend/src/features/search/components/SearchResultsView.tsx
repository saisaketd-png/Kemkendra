"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  FileQuestion,
  PlusCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { PaginatedSearchResponse, SearchQueryParams } from "../types/searchTypes";
import { SearchProductCard } from "./SearchProductCard";
import { SearchFilterSidebar } from "./SearchFilterSidebar";
import { GlobalSearchBar } from "./SearchSuggestionsDropdown";

interface SearchResultsViewProps {
  initialResults: PaginatedSearchResponse;
  filters: SearchQueryParams;
}

export function SearchResultsView({ initialResults, filters }: SearchResultsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const updateParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/search?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", String(newPage));
    router.push(`/search?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Count active filters (excluding query and pagination/sort)
  const activeFilterList: { label: string; key: string }[] = [];
  if (filters.category) activeFilterList.push({ label: `Category: ${filters.category}`, key: "category" });
  if (filters.minPurity) activeFilterList.push({ label: `Min Purity: ${filters.minPurity}%`, key: "minPurity" });
  if (filters.maxPurity) activeFilterList.push({ label: `Max Purity: ${filters.maxPurity}%`, key: "maxPurity" });
  if (filters.verifiedOnly) activeFilterList.push({ label: "Verified Suppliers Only", key: "verifiedOnly" });
  if (filters.inStockOnly) activeFilterList.push({ label: "In Stock Only", key: "inStockOnly" });
  if (filters.minPrice) activeFilterList.push({ label: `Min Price: $${filters.minPrice}`, key: "minPrice" });
  if (filters.maxPrice) activeFilterList.push({ label: `Max Price: $${filters.maxPrice}`, key: "maxPrice" });
  if (filters.grade) activeFilterList.push({ label: `Grade: ${filters.grade}`, key: "grade" });
  if (filters.country) activeFilterList.push({ label: `Country: ${filters.country}`, key: "country" });

  const totalElements = initialResults.totalElements || 0;
  const currentPage = initialResults.number || 0;
  const totalPages = initialResults.totalPages || 0;
  const pageSize = initialResults.size || 20;
  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="space-y-6">
      {/* Top Search Hero Banner */}
      <div className="bg-[#091E42] text-white rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              {filters.q
                ? `Search Results for "${filters.q}"`
                : "Explore Global Chemical & Pharma Catalog"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Query multi-attribute chemical database by chemical name, CAS registry number, molecular synonyms, purity, or verified manufacturer.
            </p>
          </div>

          <div className="pt-2">
            <GlobalSearchBar
              initialQuery={filters.q || ""}
              size="lg"
              placeholder="Search by chemical name, CAS # (e.g. 103-90-2), formula or supplier..."
            />
          </div>
        </div>
      </div>

      {/* Main Layout: Filter Sidebar + Products Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Filter Sidebar */}
        <SearchFilterSidebar
          currentFilters={filters}
          isMobileOpen={isMobileFiltersOpen}
          onCloseMobile={() => setIsMobileFiltersOpen(false)}
        />

        {/* Results Container */}
        <main className="flex-1 w-full space-y-4">
          {/* Controls Bar: Result Count, Mobile Filter Trigger, and Sort */}
          <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden h-9 px-3 bg-white border border-[#CBD5E1] text-[#0F172A] font-semibold text-xs rounded-[6px] flex items-center gap-1.5 shadow-2xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#0052CC]" />
                <span>Filters</span>
                {activeFilterList.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#0052CC] text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFilterList.length}
                  </span>
                )}
              </button>

              <div className="text-xs sm:text-sm text-[#475569]">
                Showing <strong className="text-[#0F172A] font-bold">{startItem} - {endItem}</strong> of{" "}
                <strong className="text-[#0F172A] font-bold">{totalElements}</strong> products
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs text-[#64748B] hidden sm:inline flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort by:</span>
              </label>
              <select
                id="sort-select"
                value={filters.sort || "relevance"}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="h-9 px-2.5 text-xs font-semibold bg-[#FAFAFA] border border-[#CBD5E1] rounded-[6px] text-[#0F172A] focus:outline-none focus:border-[#0052CC] cursor-pointer"
              >
                <option value="relevance">Most Relevant</option>
                <option value="newest">Newest Additions</option>
                <option value="price_asc">Lowest Starting Price</option>
                <option value="price_desc">Highest Starting Price</option>
                <option value="purity">Highest Purity First</option>
                <option value="supplier">Supplier Name (A - Z)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterList.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-[#64748B] mr-1">Active filters:</span>
              {activeFilterList.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => updateParam(chip.key, undefined)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#0052CC] font-medium hover:bg-blue-100 transition-colors"
                >
                  <span>{chip.label}</span>
                  <X className="w-3 h-3 text-[#0052CC]" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (filters.q) params.set("q", filters.q);
                  router.push(`/search?${params.toString()}`);
                }}
                className="text-xs text-[#64748B] hover:text-[#0F172A] hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Cards List */}
          {initialResults.content && initialResults.content.length > 0 ? (
            <div className="space-y-3">
              {initialResults.content.map((product) => (
                <SearchProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-8 sm:p-12 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-[#0052CC] flex items-center justify-center mx-auto">
                <FileQuestion className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-bold text-[#0F172A]">
                  No chemical products matched your search
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  We couldn&apos;t find matching records for{" "}
                  {filters.q ? <strong>&quot;{filters.q}&quot;</strong> : "the selected criteria"}.
                </p>
              </div>

              <div className="bg-[#FAFAFA] border border-[#E2E8F0] rounded-lg p-4 max-w-lg mx-auto text-left text-xs text-[#475569] space-y-2">
                <p className="font-semibold text-[#0F172A]">Suggestions for finding your chemical:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Check spelling or try common chemical synonyms (e.g. Paracetamol / Acetaminophen / APAP).</li>
                  <li>Search directly by standard CAS Registry Number (e.g. <code>103-90-2</code>).</li>
                  <li>Broaden your category or purity filters to view all available grades.</li>
                  <li>If the chemical is custom or not listed, submit a custom RFQ directly to verified suppliers.</li>
                </ul>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/rfq"
                  className="h-10 px-5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-semibold text-xs rounded-[6px] transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit Sourcing RFQ</span>
                </Link>
                <Link
                  href="/products"
                  className="h-10 px-4 bg-white hover:bg-[#FAFAFA] border border-[#CBD5E1] text-[#0F172A] font-medium text-xs rounded-[6px] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Browse Full Catalog</span>
                </Link>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-3 sm:p-4 flex items-center justify-between gap-2 shadow-xs">
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
                className="h-9 px-3 border border-[#CBD5E1] rounded-[6px] text-xs font-semibold text-[#0F172A] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-xs text-[#64748B] font-medium">
                Page <strong className="text-[#0F172A]">{currentPage + 1}</strong> of{" "}
                <strong className="text-[#0F172A]">{totalPages}</strong>
              </div>

              <button
                type="button"
                disabled={currentPage >= totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
                className="h-9 px-3 border border-[#CBD5E1] rounded-[6px] text-xs font-semibold text-[#0F172A] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Indicative Price Legal Footnote Disclaimer */}
          <div className="bg-[#FAFAFA] border border-[#E2E8F0] rounded-[8px] p-3 flex items-start gap-2.5 text-[11px] text-[#64748B] leading-relaxed">
            <Info className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
            <p>
              * All prices displayed across KemKendra are indicative starting benchmarks provided for market estimation and comparison. Final commercial pricing, MOQ tiers, packaging specifications, freight logistics, and GST/VAT terms are confirmed exclusively through formal verified supplier quotations.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
