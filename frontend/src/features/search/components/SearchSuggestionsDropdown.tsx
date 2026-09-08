"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FlaskConical,
  Hash,
  Layers,
  Building2,
  ShieldCheck,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import { getSearchSuggestions } from "../api/searchApi";
import { SearchSuggestionResponse } from "../types/searchTypes";

interface GlobalSearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  size?: "sm" | "md" | "lg";
  autoFocus?: boolean;
  onSearchSubmitted?: (query: string) => void;
}

export function GlobalSearchBar({
  initialQuery = "",
  placeholder = "Search chemical name, CAS # (e.g. 103-90-2), formula or supplier...",
  className = "",
  inputClassName = "",
  size = "md",
  autoFocus = false,
  onSearchSubmitted,
}: GlobalSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestionResponse[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced suggestion fetch
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await getSearchSuggestions(trimmed, 8);
        setSuggestions(results);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsOpen(false);
    if (onSearchSubmitted) {
      onSearchSubmitted(trimmed);
    }
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    });
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestionResponse) => {
    setIsOpen(false);
    setQuery(suggestion.title);
    if (onSearchSubmitted) {
      onSearchSubmitted(suggestion.title);
    }
    startTransition(() => {
      router.push(suggestion.url);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSubmit();
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
          handleSubmit();
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

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
        return <Search className="w-3.5 h-3.5 text-[#64748B]" />;
    }
  };

  const sizeClasses = {
    sm: "h-8 text-xs pl-8 pr-7",
    md: "h-9 text-xs sm:text-sm pl-9 pr-8",
    lg: "h-11 sm:h-12 text-sm sm:text-base pl-11 pr-10",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5 left-2.5",
    md: "w-4 h-4 left-3",
    lg: "w-5 h-5 left-3.5",
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative w-full flex items-center">
        <Search
          className={`absolute top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none ${iconSizes[size]}`}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          className={`w-full bg-[#FAFAFA] hover:bg-white focus:bg-white border border-[#E4E4E7] rounded-[8px] focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-colors text-[#0F172A] placeholder:text-[#94A3B8] font-normal shadow-xs ${sizeClasses[size]} ${inputClassName}`}
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-[#0052CC] animate-spin shrink-0" />
          )}
          {query && !isLoading && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-full hover:bg-slate-100 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete suggestions dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-[8px] border border-[#E4E4E7] shadow-tactile-modal z-50 overflow-hidden divide-y divide-[#F1F5F9] animate-in fade-in-50 zoom-in-98 duration-100">
          {suggestions.length > 0 ? (
            <div className="py-1">
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-semibold flex items-center justify-between">
                <span>Suggestions</span>
                <span>Use ↑↓ to navigate, Enter to select</span>
              </div>
              <ul className="max-h-[340px] overflow-y-auto">
                {suggestions.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <li key={`${item.type}-${item.title}-${idx}`}>
                      <button
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between gap-3 text-xs transition-colors ${
                          isSelected ? "bg-[#EFF6FF] text-[#0052CC]" : "hover:bg-[#F8FAFC] text-[#0F172A]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className={`w-6 h-6 rounded-[4px] flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-white" : "bg-[#F1F5F9]"
                            }`}
                          >
                            {getIconForType(item.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold truncate leading-tight">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-[#475569] border border-[#E2E8F0] uppercase">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.subtitle && (
                              <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 text-[#94A3B8]">
                          <span className="text-[10px] font-mono uppercase">
                            {item.matchedField || item.type}
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="p-2 bg-[#FAFAFA] border-t border-[#E4E4E7] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="text-[#0052CC] hover:underline font-medium inline-flex items-center gap-1"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>See all catalog results for &quot;{query.trim()}&quot;</span>
                </button>
              </div>
            </div>
          ) : query.trim().length >= 2 && !isLoading ? (
            <div className="p-4 text-center">
              <p className="text-xs text-[#64748B]">
                No direct keyword matches found for &quot;{query.trim()}&quot;
              </p>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="mt-2 text-xs text-[#0052CC] font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>Search catalog for &quot;{query.trim()}&quot; anyway</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
