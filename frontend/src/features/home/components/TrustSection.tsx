import React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export function TrustSection() {
  return (
    <section className="py-12 sm:py-24 bg-slate-900 text-white border-b border-slate-800 relative w-full max-w-full overflow-hidden">
      {/* Subtle blueprint grid underlay */}
      <div className="absolute inset-0 bg-grid-blueprint opacity-10 pointer-events-none" />

      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Section Header (NO AI badge boxes) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Engineered for Audit-Ready Chemical Trade.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Every transaction on KemKendra operates under strict regulatory compliance, transparent analytical batch testing, and protected escrow settlement.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/resources"
              className="px-5 py-2.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-mono font-medium transition-all inline-flex items-center gap-2 press-tactile"
            >
              <span>View Audit Standards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 3 Real Technical Governance Artifacts with Card Elevation & Hover Glow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Artifact 1: Audited Supplier Dossier */}
          <div className="bg-slate-950/70 border border-slate-800 hover:border-slate-600 rounded-[14px] p-6 sm:p-7 shadow-xl flex flex-col justify-between space-y-6 card-elevation transition-all group">
            <div className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  Audited Supplier Vetting
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Suppliers must clear statutory KYC, production site validation, and current regulatory certifications before listing.
                </p>
              </div>

              {/* Data Table Specification Preview */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-[11px] group-hover:border-slate-700 transition-colors">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">WHO-GMP Certificate:</span>
                  <span className="text-emerald-400 font-semibold">VALID • 2024-2027</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Drug License 20B/21B:</span>
                  <span className="text-slate-200">MH-TZ1-482910</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">US-FDA FEI Registration:</span>
                  <span className="text-slate-200">#3002847192</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Cleanroom Classification:</span>
                  <span className="text-blue-400 font-semibold">ISO 7 (Grade C)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2 border-t border-slate-800/80">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero unvetted traders or shell broker entities permitted</span>
            </div>
          </div>

          {/* Artifact 2: Technical Certificate of Analysis (COA) Verification */}
          <div className="bg-slate-950/70 border border-slate-800 hover:border-slate-600 rounded-[14px] p-6 sm:p-7 shadow-xl flex flex-col justify-between space-y-6 card-elevation transition-all group">
            <div className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  Analytical Batch Release
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Every consignment requires verified HPLC/GC analytical reports, residual solvent screening, and manufacturer lot tracing.
                </p>
              </div>

              {/* Data Table Specification Preview */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-[11px] group-hover:border-slate-700 transition-colors">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">HPLC Assay (Dry Basis):</span>
                  <span className="text-emerald-400 font-semibold">99.85% (Limit: ≥ 99.0%)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Individual Related Substances:</span>
                  <span className="text-emerald-400 font-semibold">&lt; 0.05% (Limit: ≤ 0.10%)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Residual Solvents (GC-HS):</span>
                  <span className="text-slate-200">Complies with ICH Q3C</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Heavy Metal Contaminants:</span>
                  <span className="text-slate-200">&lt; 10 ppm (ICP-MS)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2 border-t border-slate-800/80">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full compendial COA available for every production lot</span>
            </div>
          </div>

          {/* Artifact 3: Bank-Secured Escrow & Custody */}
          <div className="bg-slate-950/70 border border-slate-800 hover:border-slate-600 rounded-[14px] p-6 sm:p-7 shadow-xl flex flex-col justify-between space-y-6 card-elevation transition-all group">
            <div className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  Commercial Escrow Settlement
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Funds are secured in bank escrow. Manufacturer payment is released only after pre-dispatch sample and weight confirmation.
                </p>
              </div>

              {/* Data Table Specification Preview */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-[11px] group-hover:border-slate-700 transition-colors">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">PO Contract Execution:</span>
                  <span className="text-emerald-400 font-semibold">Legally Binding In Transit</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Pre-Shipment Inspection:</span>
                  <span className="text-slate-200">Batch Sampling Approved</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Incoterms Support:</span>
                  <span className="text-slate-200">Ex-Works • CIF • FOB • DDP</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Escrow Release Condition:</span>
                  <span className="text-blue-400 font-semibold">Customs Out of Charge</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2 border-t border-slate-800/80">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Independent bank settlement protection for buyers & suppliers</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
