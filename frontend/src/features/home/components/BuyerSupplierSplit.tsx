import Link from "next/link";
import { ArrowRight, ShieldCheck, FileCheck, Building2, CheckCircle2 } from "lucide-react";

export function BuyerSupplierSplit() {
  return (
    <section className="py-20 sm:py-28 bg-[#FAFAFA] border-b border-[#E4E4E7] relative overflow-hidden">
      {/* Subtle blueprint grid backdrop */}
      <div className="absolute inset-0 bg-grid-blueprint opacity-60 pointer-events-none" />

      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F172A] leading-tight">
            Built for enterprise buyers. <br className="hidden sm:block" />
            Engineered for certified manufacturers.
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-2xl">
            Eliminate broker opacity with direct manufacturer monographs, auditable batch COA certificates, and milestone-backed commercial contracts.
          </p>
        </div>

        {/* 2-Column High-Density Terminals with Animated Hover State */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          
          {/* ========================================================= */}
          {/* LEFT: INSTITUTIONAL BUYER PROCUREMENT DESK                */}
          {/* ========================================================= */}
          <div className="bg-white border border-[#E4E4E7] hover:border-[#0052CC] rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-tactile-card card-elevation transition-all group">
            <div className="space-y-6">
              {/* Header Title (NO AI badge boxes) */}
              <div className="border-b border-[#F1F5F9] pb-4">
                <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight group-hover:text-[#0052CC] transition-colors">
                  For Institutional Buyers
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mt-1.5">
                  Procure pharmacopeial raw materials with direct factory accountability, audited compendial assays, and escrow protection.
                </p>
              </div>

              {/* Bespoke RFQ Dossier Terminal Widget */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 space-y-3 text-xs transition-colors group-hover:border-blue-200">
                {/* Active RFQ Header */}
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-[#64748B] border-b border-[#E2E8F0] pb-2 font-mono">
                  <span className="font-bold text-[#0F172A] truncate">REQ-2024-8842 // PARACETAMOL IP</span>
                  <span className="text-[#0052CC] font-semibold shrink-0">3 BINDING OFFERS</span>
                </div>

                {/* Chemical Target Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-1 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CAS REGISTRY</span>
                    <strong className="text-[#0F172A] font-mono">103-90-2</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">LOT REQUIREMENT</span>
                    <strong className="text-[#0F172A]">25 Metric Tons</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">TARGET SPEC</span>
                    <strong className="text-[#059669]">≥ 99.8% IP/BP</strong>
                  </div>
                </div>

                {/* Live Comparison Matrix Mini-Deck */}
                <div className="space-y-1.5 pt-1">
                  <div className="p-3 bg-white border border-[#CBD5E1] rounded-lg flex items-center justify-between hover:border-[#0052CC] transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-[#0F172A] text-xs font-bold">Apex BioPharma</strong>
                        <span className="text-[10px] text-[#059669] font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">WHO-GMP</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Batch COA Verified · 14-day dispatch</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-[#0F172A] block font-mono">$6.15 / kg</span>
                      <span className="text-[10px] text-[#0052CC] font-semibold">Top Ranked</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white/70 border border-[#E2E8F0] rounded-lg flex items-center justify-between hover:border-[#0052CC] transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-[#0F172A] text-xs font-bold">EuroPharm Synthetics</strong>
                        <span className="text-[10px] text-[#0052CC] font-semibold bg-blue-50 px-1.5 py-0.5 rounded">US-FDA FEI</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">DMF #02941 · In Stock Consignment</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-[#0F172A] block font-mono">$6.30 / kg</span>
                      <span className="text-[10px] text-slate-400">Competitive</span>
                    </div>
                  </div>
                </div>

                {/* Institutional Security Bar */}
                <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5 text-[#059669] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Escrow Custody Protection
                  </span>
                  <span>Port Inspection Clearance</span>
                </div>
              </div>

              {/* Feature Highlights */}
              <ul className="space-y-2.5 text-xs text-[#0F172A]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
                  <span>Filter by official compendial monographs (USP, BP, IP, EP) with verified CAS identity.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
                  <span>Inspect analytical chromatography (HPLC/GC) and batch COA documents prior to contract sign-off.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
                  <span>Execute binding purchase orders with funds locked securely until quality clearance.</span>
                </li>
              </ul>
            </div>

            {/* Bottom Actions */}
            <div className="pt-8 border-t border-[#F1F5F9] flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="h-10 px-5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-2 shadow-xs"
              >
                <span>Browse Chemical Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/sourcing/request"
                className="h-10 px-4 bg-white hover:bg-slate-50 border border-[#E4E4E7] text-[#0F172A] text-xs font-medium rounded-lg transition-all inline-flex items-center gap-2"
              >
                <span>Submit Sourcing RFQ</span>
              </Link>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: CERTIFIED CHEMICAL MANUFACTURER DESK               */}
          {/* ========================================================= */}
          <div className="bg-white border border-[#E4E4E7] hover:border-[#059669] rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-tactile-card card-elevation transition-all group">
            <div className="space-y-6">
              {/* Header Title (NO AI badge boxes) */}
              <div className="border-b border-[#F1F5F9] pb-4">
                <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight group-hover:text-[#059669] transition-colors">
                  For Chemical Manufacturers
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mt-1.5">
                  Connect directly with enterprise pharmaceutical formulation plants, receive structured RFQs, and secure export volumes.
                </p>
              </div>

              {/* Bespoke Manufacturer Batch Desk Terminal Widget */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 space-y-3 text-xs transition-colors group-hover:border-emerald-200">
                {/* Simulated Batch Release Header */}
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-[#64748B] border-b border-[#E2E8F0] pb-2 font-mono">
                  <span className="font-bold text-[#0F172A] truncate">PLANT 04 // GUJARAT SYNTHETICS</span>
                  <span className="text-[#059669] font-semibold shrink-0">QA APPROVED</span>
                </div>

                {/* Analytical Release Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-1 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">PRODUCTION LOT</span>
                    <strong className="text-[#0F172A] font-mono">#PCM-2411-B</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ASSAY PURITY</span>
                    <strong className="text-[#059669]">99.91% HPLC</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">BATCH CAPACITY</span>
                    <strong className="text-[#0F172A]">120 MT / Month</strong>
                  </div>
                </div>

                {/* Active Inbound Purchase Tenders */}
                <div className="space-y-1.5 pt-1">
                  <div className="p-3 bg-white border border-[#CBD5E1] rounded-lg flex items-center justify-between hover:border-[#059669] transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-[#0F172A] text-xs font-bold">European Formulation Lab</strong>
                        <span className="text-[10px] text-[#0052CC] font-semibold bg-blue-50 px-1.5 py-0.5 rounded">LC Verified</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Tender: 50 MT (USP Grade) · Target CIF Hamburg</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#059669] block">Ready to Quote</span>
                      <span className="text-[10px] text-slate-400">48h remaining</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white/70 border border-[#E2E8F0] rounded-lg flex items-center justify-between hover:border-[#059669] transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-[#0F172A] text-xs font-bold">Domestic Pharma Group</strong>
                        <span className="text-[10px] text-[#059669] font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">PO Issued</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Contract: 25 MT · Milestone 1 Escrow Locked</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#0F172A] block">Dispatched</span>
                      <span className="text-[10px] text-slate-400">Bill of Lading #914</span>
                    </div>
                  </div>
                </div>

                {/* Plant Regulatory Compliance Bar */}
                <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5 text-[#0F172A] font-medium">
                    <FileCheck className="w-3.5 h-3.5 text-[#0052CC]" /> DMF &amp; CEP Dossier Linked
                  </span>
                  <span>ISO 9001:2015 &amp; WHO-GMP</span>
                </div>
              </div>

              {/* Feature Highlights */}
              <ul className="space-y-2.5 text-xs text-[#0F172A]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <span>Receive high-intent, technically vetted RFQs from pre-qualified corporate pharmaceutical procurement teams.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <span>Publish your facility&apos;s verified monographs, Drug Master Files (DMF), and active capacity allocations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <span>Automate commercial agreements, milestone disbursements, and cross-border customs declarations.</span>
                </li>
              </ul>
            </div>

            {/* Bottom Actions */}
            <div className="pt-8 border-t border-[#F1F5F9] flex flex-wrap items-center gap-3">
              <Link
                href="/register/supplier"
                className="h-10 px-5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-2 shadow-xs"
              >
                <span>Register Production Facility</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/login"
                className="h-10 px-4 bg-white hover:bg-slate-50 border border-[#E4E4E7] text-[#0F172A] text-xs font-medium rounded-lg transition-all inline-flex items-center gap-2"
              >
                <span>Supplier Portal</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
