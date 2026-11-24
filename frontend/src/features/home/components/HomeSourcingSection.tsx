"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  FileCheck2,
  Clock,
  Building2,
  Search,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { SimplifiedSourcingForm } from "@/features/sourcing/components/SimplifiedSourcingForm";

export function HomeSourcingSection() {
  const router = useRouter();
  const [trackCode, setTrackCode] = useState("");
  const [trackError, setTrackError] = useState("");

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = trackCode.trim();
    if (!cleaned) {
      setTrackError("Please enter your reference code.");
      return;
    }
    setTrackError("");
    router.push(`/sourcing/track/${encodeURIComponent(cleaned)}`);
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E4E4E7]">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Editorial Value Proposition & Tracking */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0052CC] bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-md inline-block">
                Custom Chemical Sourcing Desk
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] tracking-tight mt-3">
                Can’t Find Your Compound? We Source It Direct.
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-3 leading-relaxed">
                If your required pharmaceutical active, intermediate, or specialty reagent is not in the instant catalog, submit your specification below. Our technical desk matches your volume with primary audited synthesizers within 24 hours.
              </p>
            </div>

            {/* Core Verification Features */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F9FA] border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-[#0052CC] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Primary Synthesizers Only</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                    Zero unverified brokers. Sourced directly from cGMP and ISO-certified chemical synthesis facilities.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F9FA] border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-[#0052CC] flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Batch CoA & Compendial Release</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                    Lot-specific HPLC/NMR titration, 16-section GHS SDS, and technical release documents provided with every quotation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F9FA] border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-[#0052CC] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">24-Hour Commercial Quotation SLA</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                    Receive competitive factory-gate pricing, committed dispatch lead time, and payment terms in under one business day.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Tracking Box */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-[#F8F9FA] space-y-2.5">
              <span className="text-xs font-bold text-[#0F172A] block">
                Track Existing Sourcing Request
              </span>
              <p className="text-[11px] text-[#64748B]">
                Enter your reference code (e.g. <span className="font-mono text-slate-700">SRQ-2026-XXXX</span> or <span className="font-mono text-slate-700">SRC-XXXXXX</span>) to inspect live supplier matching status.
              </p>
              <form onSubmit={handleTrackSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  placeholder="Enter Reference Code"
                  className="flex-1 h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-[#0F172A] font-mono focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
                />
                <button
                  type="submit"
                  className="h-9 px-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-[#0F172A] text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs press-tactile"
                >
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>Track</span>
                </button>
              </form>
              {trackError && <p className="text-[11px] text-red-600">{trackError}</p>}
            </div>
          </div>

          {/* Right Column: Simplified Sourcing Form */}
          <div className="lg:col-span-7">
            <SimplifiedSourcingForm variant="card" />
          </div>
        </div>
      </div>
    </section>
  );
}
