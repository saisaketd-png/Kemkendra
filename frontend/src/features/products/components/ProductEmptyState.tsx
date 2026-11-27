"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FlaskConical,
  FileText,
  PhoneCall,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building2,
  Clock,
} from "lucide-react";

interface ProductEmptyStateProps {
  searchQuery?: string;
}

export function ProductEmptyState({ searchQuery: propQuery }: ProductEmptyStateProps) {
  const searchParams = useSearchParams();
  const query = (propQuery || searchParams.get("search") || "").trim();

  const sourcingUrl = query
    ? `/sourcing?chemical=${encodeURIComponent(query)}`
    : "/sourcing";

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl shadow-tactile-card p-6 sm:p-10 space-y-8">
      {/* Top Hero Message */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#0052CC] shadow-2xs">
          <FlaskConical className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Unlisted Chemical Compound</span>
          </span>

          <h3 className="text-xl sm:text-2xl font-black text-[#091E42] tracking-tight">
            {query
              ? `Can’t find "${query}" in our instant catalog?`
              : "Can’t find your chemical compound or purity grade?"}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {query ? (
              <>
                Only a fraction of verified chemicals are listed in the public catalog. Let our dedicated{" "}
                <strong className="text-slate-800">KemKendra Sourcing Desk</strong> allocate{" "}
                <span className="font-semibold text-[#0052CC] font-mono">&quot;{query}&quot;</span> directly
                from pre-audited synthesis plants and primary manufacturers in 24 hours.
              </>
            ) : (
              "No approved supplier offerings match your current filter combination. You can reset filters or request direct factory allocation through our dedicated Sourcing Desk."
            )}
          </p>
        </div>

        {/* Primary Sourcing Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center pt-2">
          <Link
            href={sourcingUrl}
            className="w-full sm:w-auto h-11 px-6 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-2xs cursor-pointer press-tactile"
          >
            <span>{query ? `Source "${query}" via KemKendra` : "Submit Custom Sourcing Request"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto h-11 px-5 bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Search &amp; Filters</span>
          </Link>
        </div>
      </div>

      {/* Sourcing Desk Value Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-xs text-left">
        <div className="p-4 rounded-xl bg-[#F8F9FA] border border-slate-200/80 space-y-1.5">
          <div className="flex items-center gap-2 text-[#0052CC] font-bold">
            <Building2 className="w-4 h-4" />
            <span>120+ Audited Synthesis Plants</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Direct factory allocation across Gujarat, Maharashtra, and Telangana without middleman broker markups.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#F8F9FA] border border-slate-200/80 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <FileText className="w-4 h-4" />
            <span>Lot-Specific HPLC/GC COA</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Full analytical test dossiers, 16-section GHS SDS, and pharmacopeial monograph compliance verification.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#F8F9FA] border border-slate-200/80 space-y-1.5">
          <div className="flex items-center gap-2 text-purple-600 font-bold">
            <Clock className="w-4 h-4" />
            <span>24-Hour Quotation SLA</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Receive committed factory gate pricing, minimum order quantities (MOQ), and shipping schedules in 1 business day.
          </p>
        </div>
      </div>
    </div>
  );
}
