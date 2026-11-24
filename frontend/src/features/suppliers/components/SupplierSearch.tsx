"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState, FormEvent } from "react";

export function SupplierSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/suppliers?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    router.push(`/suppliers?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
        <Search className="w-4 h-4 text-slate-400" />
      </div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-white border border-slate-300 text-[#0F172A] text-xs sm:text-sm rounded-lg focus:ring-1 focus:ring-blue-500/20 focus:border-[#0052CC] block w-full pl-10 pr-24 py-2.5 shadow-2xs placeholder-slate-400 transition-colors"
        placeholder="Search suppliers by name, region, or capability..."
      />
      {search && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-20 flex items-center pr-2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        type="submit"
        className="absolute inset-y-1 right-1 flex items-center px-4 text-xs font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] rounded-md transition-colors shadow-2xs press-tactile cursor-pointer"
      >
        Search
      </button>
    </form>
  );
}
