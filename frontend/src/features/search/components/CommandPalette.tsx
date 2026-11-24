"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FlaskConical,
  Building2,
  FileText,
  Layers,
  ArrowRight,
  Command,
  X,
  ExternalLink,
  ShieldCheck,
  Send,
  Clock,
  ChevronRight,
} from "lucide-react";

interface CommandItem {
  id: string;
  category: "Actions" | "Navigation" | "Chemicals & Raw Materials";
  title: string;
  subtitle?: string;
  badge?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string[];
  action?: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform));
    }
  }, []);

  // Static commands catalog
  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: "sourcing-request",
        category: "Actions",
        title: "Request Custom Chemical Sourcing",
        subtitle: "Can't find a chemical? Let our sourcing team procure it from verified manufacturers",
        href: "/sourcing/request",
        icon: FlaskConical,
        keywords: ["custom", "sourcing", "find", "procure", "specialty", "rare"],
      },
      {
        id: "rfq-submit",
        category: "Actions",
        title: "Submit Instant Marketplace RFQ",
        subtitle: "Request competitive bulk quotations for catalog chemicals",
        href: "/rfq",
        icon: Send,
        keywords: ["rfq", "quote", "bulk", "price", "quotation"],
      },
      {
        id: "sourcing-landing",
        category: "Navigation",
        title: "KemKendra Sourcing",
        subtitle: "Dedicated procurement assistance for hard-to-find chemicals & APIs",
        href: "/sourcing",
        icon: FlaskConical,
        keywords: ["sourcing", "desk", "broker", "brokerage"],
      },
      {
        id: "catalog-all",
        category: "Navigation",
        title: "Chemical Product Catalog",
        subtitle: "Explore 10,000+ verified raw materials, solvents, and APIs",
        href: "/products",
        icon: Layers,
        keywords: ["products", "catalog", "directory", "materials"],
      },
      {
        id: "suppliers-all",
        category: "Navigation",
        title: "Verified Supplier Directory",
        subtitle: "Audited ISO and WHO-GMP certified manufacturers across India & global hubs",
        badge: "Audited",
        href: "/suppliers",
        icon: Building2,
        keywords: ["suppliers", "manufacturers", "distributors", "vendors"],
      },
      {
        id: "categories-all",
        category: "Navigation",
        title: "Browse Categories & Pharmacopeial Grades",
        subtitle: "APIs, Excipients, Intermediates, Industrial Solvents, Reagents",
        href: "/categories",
        icon: FileText,
        keywords: ["categories", "grades", "ip", "bp", "usp", "ep"],
      },
      // Popular Chemical Shortcuts
      {
        id: "chem-paracetamol",
        category: "Chemicals & Raw Materials",
        title: "Paracetamol (Acetaminophen) • IP / BP / USP",
        subtitle: "CAS 103-90-2 • Micronized & DC 90 Grades",
        badge: "API",
        href: "/search?q=Paracetamol",
        icon: FlaskConical,
        keywords: ["paracetamol", "acetaminophen", "103-90-2", "api"],
      },
      {
        id: "chem-ibuprofen",
        category: "Chemicals & Raw Materials",
        title: "Ibuprofen • IP / BP / EP",
        subtitle: "CAS 15687-27-1 • 25 / 50 Mesh Ready Stock",
        badge: "API",
        href: "/search?q=Ibuprofen",
        icon: FlaskConical,
        keywords: ["ibuprofen", "15687-27-1", "api", "anti-inflammatory"],
      },
      {
        id: "chem-ipa",
        category: "Chemicals & Raw Materials",
        title: "Isopropyl Alcohol (IPA) • Pharma & Electronic Grade",
        subtitle: "CAS 67-63-0 • Purity ≥ 99.8% • Drums & IBC",
        badge: "Solvent",
        href: "/search?q=Isopropyl+Alcohol",
        icon: FlaskConical,
        keywords: ["ipa", "isopropanol", "isopropyl", "67-63-0", "solvent"],
      },
      {
        id: "chem-methanol",
        category: "Chemicals & Raw Materials",
        title: "Methanol • Industrial & Analytical Grade",
        subtitle: "CAS 67-56-1 • Purity ≥ 99.85%",
        badge: "Industrial",
        href: "/search?q=Methanol",
        icon: FlaskConical,
        keywords: ["methanol", "methyl alcohol", "67-56-1", "solvent"],
      },
      {
        id: "chem-metformin",
        category: "Chemicals & Raw Materials",
        title: "Metformin Hydrochloride • IP / BP / USP",
        subtitle: "CAS 1115-70-4 • Antidiabetic API",
        badge: "API",
        href: "/search?q=Metformin",
        icon: FlaskConical,
        keywords: ["metformin", "1115-70-4", "api"],
      },
      {
        id: "chem-caustic-soda",
        category: "Chemicals & Raw Materials",
        title: "Caustic Soda (Sodium Hydroxide) • Flakes & Lye",
        subtitle: "CAS 1310-73-2 • Purity 98% - 99%",
        badge: "Inorganic",
        href: "/search?q=Caustic+Soda",
        icon: FlaskConical,
        keywords: ["caustic", "soda", "sodium hydroxide", "naoh", "1310-73-2"],
      },
    ],
    []
  );

  // Filter commands by user query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase().trim();
    return commands.filter((cmd) => {
      const titleMatch = cmd.title.toLowerCase().includes(q);
      const subMatch = cmd.subtitle?.toLowerCase().includes(q);
      const kwMatch = cmd.keywords?.some((k) => k.toLowerCase().includes(q));
      return titleMatch || subMatch || kwMatch;
    });
  }, [commands, query]);

  // Open / Close via keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard navigation within list
  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredCommands.length + 1)) % (filteredCommands.length + 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex === filteredCommands.length && query.trim()) {
        // Fallback: search marketplace for custom query
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
      } else if (filteredCommands[selectedIndex]) {
        const item = filteredCommands[selectedIndex];
        if (item.action) {
          item.action();
        } else if (item.href) {
          router.push(item.href);
        }
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4 animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleListKeyDown}
      >
        {/* Search Input Header */}
        <div className="relative border-b border-slate-100 flex items-center px-4 py-3.5 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a chemical name, CAS number, formula, or action..."
            className="w-full bg-transparent px-3 text-sm sm:text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg mr-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-white border border-slate-200 rounded-md shadow-xs">
              {isMac ? "⌘K" : "Ctrl+K"}
            </kbd>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-white border border-slate-200 rounded-md shadow-xs">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto flex-1 p-2 space-y-1 divide-y divide-slate-50">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const isSelected = selectedIndex === idx;
              const Icon = cmd.icon;

              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    if (cmd.action) cmd.action();
                    else if (cmd.href) router.push(cmd.href);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-blue-50/80 text-blue-900 shadow-xs"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-slate-500 border-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold truncate text-slate-900">
                          {cmd.title}
                        </span>
                        {cmd.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      {cmd.subtitle && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? "text-blue-600 translate-x-0.5" : "text-slate-300"
                    }`}
                  />
                </button>
              );
            })
          ) : query.trim() ? (
            <div className="p-8 text-center">
              <FlaskConical className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
              <p className="text-sm font-semibold text-slate-800">
                No direct match for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Press Enter to run a full marketplace catalog search, or request a custom chemical sourcing quote.
              </p>
            </div>
          ) : null}

          {/* Dynamic "Search Marketplace for..." footer item when query is entered */}
          {query.trim() && (
            <button
              onClick={() => {
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                setIsOpen(false);
              }}
              onMouseEnter={() => setSelectedIndex(filteredCommands.length)}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                selectedIndex === filteredCommands.length
                  ? "bg-blue-50 text-blue-900 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm">
                  Search marketplace for &ldquo;<strong className="text-slate-900">{query.trim()}</strong>&rdquo;
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                Enter <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-xs">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-xs">↵</kbd> select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-xs">esc</kbd> close
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>KemKendra Direct B2B Exchange</span>
          </div>
        </div>
      </div>
    </div>
  );
}
