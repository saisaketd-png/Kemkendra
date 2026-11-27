"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ArrowRight,
  X,
  ShieldCheck,
  CheckCircle2,
  FlaskConical,
  Hash,
  Layers,
  Building2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { getSearchSuggestions } from "@/features/search/api/searchApi";
import { SearchSuggestionResponse } from "@/features/search/types/searchTypes";

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
  const [suggestions, setSuggestions] = useState<SearchSuggestionResponse[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);

  // Click outside listener for suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced search suggestion query
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 1) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await getSearchSuggestions(trimmed, 8);
        setSuggestions(results);
        setIsDropdownOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 200);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const executeSearch = (queryOverride?: string) => {
    const term = queryOverride !== undefined ? queryOverride : searchQuery;
    const params = new URLSearchParams(searchParams.toString());

    if (term.trim()) {
      params.set("search", term.trim());
    } else {
      params.delete("search");
    }

    if (selectedCategory) {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }

    params.set("page", "0");
    setIsDropdownOpen(false);
    router.push(`/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const handleSelectSuggestion = (item: SearchSuggestionResponse) => {
    setSearchQuery(item.title);
    setIsDropdownOpen(false);
    executeSearch(item.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || suggestions.length === 0) {
      if (e.key === "Enter") {
        executeSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else {
          executeSearch();
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsDropdownOpen(false);
        break;
    }
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

  const getIconForType = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return <FlaskConical className="w-3.5 h-3.5 text-[#0052CC]" />;
      case "CAS":
        return <Hash className="w-3.5 h-3.5 text-[#00875A]" />;
      case "CATEGORY":
        return <Layers className="w-3.5 h-3.5 text-[#6554C0]" />;
      case "SUPPLIER":
        return <Building2 className="w-3.5 h-3.5 text-[#D97706]" />;
      default:
        return <Search className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="relative overflow-visible rounded-2xl bg-[#091E42] text-white shadow-xl border border-[#1E293B]">
      {/* Subtle architectural coordinate grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl overflow-hidden" 
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

          {/* Quick Assurance Badges */}
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

        {/* High-Performance Search & Category Filter Bar with Smart Autocomplete */}
        <div ref={containerRef} className="relative z-30">
          <form onSubmit={handleSearchSubmit} className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/15 shadow-inner">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 1) setIsDropdownOpen(true);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search chemical name, CAS number (e.g. 103-90-2), formula, or synonym..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full h-12 pl-10 pr-12 bg-white text-slate-900 placeholder:text-slate-400 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {isLoadingSuggestions && (
                    <Loader2 className="w-4 h-4 text-[#0052CC] animate-spin shrink-0" />
                  )}
                  {searchQuery && !isLoadingSuggestions && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSuggestions([]);
                        setIsDropdownOpen(false);
                        inputRef.current?.focus();
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
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
                className="h-12 px-7 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-sm font-semibold rounded-lg transition-all inline-flex items-center justify-center gap-2 shrink-0 shadow-md press-tactile cursor-pointer"
              >
                <span>Search Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-tactile-modal z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in-50 zoom-in-98 duration-100">
              {suggestions.length > 0 ? (
                <div className="py-1">
                  <div className="px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between bg-slate-50 border-b border-slate-100">
                    <span>Chemical Matches</span>
                    <span className="hidden sm:inline">Use ↑↓ to navigate, Enter to select</span>
                  </div>

                  <ul className="max-h-[300px] overflow-y-auto divide-y divide-slate-50">
                    {suggestions.map((item, idx) => {
                      const isSelected = idx === selectedIndex;
                      return (
                        <li key={`${item.type}-${item.title}-${idx}`}>
                          <button
                            type="button"
                            onClick={() => handleSelectSuggestion(item)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                              isSelected ? "bg-blue-50/80 text-[#0052CC]" : "hover:bg-slate-50 text-slate-900"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="p-1 rounded bg-slate-100 shrink-0">
                                {getIconForType(item.type)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-bold block truncate text-xs text-slate-900">
                                  {item.title}
                                </span>
                                {item.subtitle && (
                                  <span className="text-[10px] text-slate-500 font-mono block truncate">
                                    {item.subtitle}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {item.badge && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold uppercase">
                                  {item.badge}
                                </span>
                              )}
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Bottom Direct Sourcing Links */}
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 space-y-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => executeSearch()}
                      className="w-full text-left text-[#0052CC] hover:underline font-semibold inline-flex items-center gap-1.5 py-1 px-1"
                    >
                      <Search className="w-3.5 h-3.5 shrink-0" />
                      <span>Search catalog for &quot;{searchQuery.trim()}&quot; &rarr;</span>
                    </button>

                    <Link
                      href={`/sourcing?chemical=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left text-emerald-700 hover:text-emerald-800 hover:underline font-semibold inline-flex items-center gap-1.5 py-1 px-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      <span>Didn&apos;t find your exact chemical? Source via KemKendra Desk &rarr;</span>
                    </Link>
                  </div>
                </div>
              ) : searchQuery.trim().length >= 1 && !isLoadingSuggestions ? (
                /* NO CHEMICAL FOUND IN DROPDOWN -> INSTANT SOURCING OPTION */
                <div className="p-4 bg-white space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0052CC] flex items-center justify-center shrink-0 mt-0.5">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-xs font-bold text-[#091E42] block">
                        Didn&apos;t find &quot;{searchQuery.trim()}&quot; in catalog?
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Don’t worry! We source unlisted APIs, custom synthesis compounds, and bulk solvents directly from 120+ audited factories.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Link
                      href={`/sourcing?chemical=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full flex-1 h-9 px-4 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>Source &quot;{searchQuery.trim()}&quot; Through KemKendra Desk</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => executeSearch()}
                      className="w-full sm:w-auto h-9 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Search anyway
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Clean Category Quick-Tabs & Sourcing Link */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1 border-t border-white/10 relative z-10">
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
            href={
              searchQuery.trim()
                ? `/sourcing?chemical=${encodeURIComponent(searchQuery.trim())}`
                : "/sourcing/request"
            }
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
