"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw, ShieldCheck, Globe2 } from "lucide-react";

export function SupplierFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isVerified = searchParams.get("verified") === "true";
  const isExportReady = searchParams.get("exportReady") === "true";
  const hasActiveFilters = isVerified || isExportReady;

  const handleCheckboxChange = (key: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set(key, "true");
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/suppliers?${params.toString()}`);
  };

  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("verified");
    params.delete("exportReady");
    params.delete("page");
    router.push(`/suppliers?${params.toString()}`);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-tactile-card space-y-4 lg:sticky lg:top-20 lg:self-start">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#0052CC]" />
          <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">Supplier Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0052CC] hover:text-[#0747A6] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F8F9FA] transition-colors cursor-pointer border border-transparent hover:border-slate-200/60">
          <input
            type="checkbox"
            checked={isVerified}
            onChange={(e) => handleCheckboxChange("verified", e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[#0052CC] focus:ring-[#0052CC]"
          />
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-[#0F172A]">Verified Manufacturers</span>
          </div>
        </label>
        
        <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F8F9FA] transition-colors cursor-pointer border border-transparent hover:border-slate-200/60">
          <input
            type="checkbox"
            checked={isExportReady}
            onChange={(e) => handleCheckboxChange("exportReady", e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[#0052CC] focus:ring-[#0052CC]"
          />
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-[#0052CC]" />
            <span className="text-xs font-semibold text-[#0F172A]">Export Compliant</span>
          </div>
        </label>
      </div>

      <div className="pt-3 border-t border-slate-100">
        <p className="text-[11px] text-[#64748B] leading-relaxed">
          All listed manufacturers maintain documented ISO or GMP quality control systems.
        </p>
      </div>
    </div>
  );
}
