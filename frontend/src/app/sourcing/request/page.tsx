"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
import { ChevronRight, ShieldCheck, Clock, FileCheck2 } from "lucide-react";
import { SimplifiedSourcingForm } from "@/features/sourcing/components/SimplifiedSourcingForm";

export default function SourcingRequestPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#0F172A] font-sans antialiased">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-[1020px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-[#64748B]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#0052CC] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/sourcing" className="hover:text-[#0052CC] transition-colors">Sourcing</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#0F172A] font-bold">Submit Sourcing Request</span>
          </nav>

          {/* Header Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-tactile-card space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0052CC] bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-md inline-block">
              Procurement Clearinghouse
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Submit Chemical Sourcing Requirement
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
              Specify your chemical or active pharmaceutical raw material parameters. Our procurement desk coordinates with audited manufacturers, verifies compendial standards, and returns firm factory-direct quotations in under 24 hours.
            </p>
          </div>

          {/* Simplified Form */}
          <SimplifiedSourcingForm variant="card" />

          {/* Institutional Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Audited Synthesizers</span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Direct procurement from certified manufacturers. Zero unverified brokers or middlemen.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                <FileCheck2 className="w-4 h-4 text-[#0052CC]" />
                <span>Batch CoA Verification</span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Every dispatch includes compendial monograph compliance (IP/USP/BP/EP) and titration testing.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                <Clock className="w-4 h-4 text-[#0052CC]" />
                <span>24-Hour Turnaround</span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Receive commercial pricing, lead time, and payment terms in under one business day.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
