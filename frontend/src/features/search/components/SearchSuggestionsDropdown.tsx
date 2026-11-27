"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Sparkles,
  AlertCircle,
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
  showShortcut?: boolean;
  targetUrl?: string; // e.g. "/products" or "/search"
  onSearchSubmitted?: (query: string) => void;
  onSelectSuggestion?: (item: SearchSuggestionResponse) => void;
}

export function GlobalSearchBar({
  initialQuery = "",
  placeholder = "Search chemical name, CAS # (e.g. 103-90-2), formula or supplier...",
  className = "",
  inputClassName = "",
  size = "md",
  autoFocus = false,
  showShortcut = false,
  targetUrl = "/products",
  onSearchSubmitted,
  onSelectSuggestion,
}: GlobalSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestionResponse[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isPending, startTransition] = useTransition();
  const [isMac, setIsMac] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform));
    }
  }, []);

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
    if (trimmed.length < 1) {
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
    }, 200);

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
      if (targetUrl === "/products") {
        router.push(`/products?search=${encodeURIComponent(trimmed)}`);
      } else {
        router.push(`${targetUrl}?q=${encodeURIComponent(trimmed)}`);
      }
    });
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestionResponse) => {
    setIsOpen(false);
    setQuery(suggestion.title);
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    } else if (onSearchSubmitted) {
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
    sm: `h-8 text-xs pl-8 ${showShortcut ? "pr-14" : "pr-7"}`,
    md: `h-9 text-xs sm:text-sm pl-9 ${showShortcut ? "pr-16" : "pr-8"}`,
    lg: `h-11 sm:h-12 text-sm sm:text-base pl-11 ${showShortcut ? "pr-20" : "pr-10"}`,
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
            if (query.trim().length >= 1) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          className={`w-full bg-[#FAFAFA] hover:bg-white focus:bg-white border border-[#E4E4E7] rounded-xl focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-colors text-[#0F172A] placeholder:text-[#94A3B8] font-normal shadow-xs ${sizeClasses[size]} ${inputClassName}`}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
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
              className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {!query && !isLoading && showShortcut && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent("open-command-palette"));
              }}
              className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/90 rounded transition-all cursor-pointer select-none group"
              title={isMac ? "Command Console (⌘K)" : "Command Console (Ctrl+K)"}
            >
              <span className="text-[10px] text-slate-400 group-hover:text-slate-600 font-sans">
                {isMac ? "⌘" : "Ctrl"}
              </span>
              <span className="text-[10px] font-bold">K</span>
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete suggestions dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200/90 shadow-tactile-modal z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in-50 zoom-in-98 duration-100">
          {suggestions.length > 0 ? (
            <div className="py-1">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between bg-slate-50 border-b border-slate-100">
                <span>Matching Chemical Suggestions</span>
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
                          isSelected ? "bg-blue-50/80 text-[#0052CC]" : "hover:bg-slate-50 text-[#0F172A]"
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

              {/* Bottom Direct Actions */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 space-y-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="w-full text-left text-[#0052CC] hover:underline font-semibold inline-flex items-center gap-1.5 py-1 px-1"
                >
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span>See all catalog results for &quot;{query.trim()}&quot; &rarr;</span>
                </button>

                <Link
                  href={`/sourcing?chemical=${encodeURIComponent(query.trim())}`}
                  onClick={() => setIsOpen(false)}
                  className="w-full text-left text-emerald-700 hover:text-emerald-800 hover:underline font-semibold inline-flex items-center gap-1.5 py-1 px-1"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>Didn&apos;t find your exact chemical? Source via KemKendra Desk &rarr;</span>
                </Link>
              </div>
            </div>
          ) : query.trim().length >= 1 && !isLoading ? (
            /* NO CHEMICALS FOUND IN DROPDOWN -> INSTANT SOURCING OPTION */
            <div className="p-4 bg-white space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0052CC] flex items-center justify-center shrink-0 mt-0.5">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <span className="text-xs font-bold text-[#091E42] block">
                    No catalog match for &quot;{query.trim()}&quot;
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Don’t worry! We can source custom synthesis compounds, rare CAS numbers, and bulk volumes directly from 120+ audited factories.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Link
                  href={`/sourcing?chemical=${encodeURIComponent(query.trim())}`}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex-1 h-9 px-4 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>Source &quot;{query.trim()}&quot; with KemKendra</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="w-full sm:w-auto h-9 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Search anyway
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
