"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileCheck2,
  Truck,
  ArrowUpRight,
  Copy,
  Check,
  Scale,
  Building2,
} from "lucide-react";
import { KemKendraLogo } from "@/shared/components/KemkendraLogo";

export function Footer() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <footer className="bg-[#091E42] text-slate-300 pt-12 pb-10 text-xs border-t border-slate-800 antialiased">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* ========================================================================= */}
        {/* TOP CLEARINGHOUSE TRUST STRIP */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10 border-b border-slate-800/80">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800/80 text-blue-400 border border-slate-700/60 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <strong className="text-white text-xs font-bold block uppercase tracking-wider">
                Audited Synthesizers
              </strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Primary chemical manufacturers and cGMP production facilities. Zero unverified brokers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800/80 text-blue-400 border border-slate-700/60 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <strong className="text-white text-xs font-bold block uppercase tracking-wider">
                Compendial Monograph Compliance
              </strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Lot-specific CoA, Karl Fischer titration, and 16-section GHS SDS with every dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800/80 text-blue-400 border border-slate-700/60 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <strong className="text-white text-xs font-bold block uppercase tracking-wider">
                Escrow Settlement Security
              </strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Commercial payment escrow safeguarding capital until quality acceptance at destination.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800/80 text-blue-400 border border-slate-700/60 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <strong className="text-white text-xs font-bold block uppercase tracking-wider">
                Dangerous Goods & Cold Chain
              </strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                UN-certified packaging, temperature logging, and ADR/IMDG cross-border freight.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN 12-COLUMN DIRECTORY GRID */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-slate-800/80">

          {/* Column 1 (4 cols): Brand identity & direct procurement contact channels */}
          <div className="lg:col-span-4 space-y-4">
            <KemKendraLogo
              href="/"
              variant="dark"
              size="md"
              subtitle="Enterprise Chemical Sourcing"
            />

            <p className="text-slate-400 leading-relaxed max-w-sm text-xs">
              Institutional digital clearinghouse for active pharmaceutical ingredients, fine synthesis intermediates, and bulk chemical inputs. Built for regulated manufacturing enterprises globally.
            </p>

            {/* Procurement Desk Direct Channels */}
            <div className="pt-2 space-y-2 text-[11px] font-mono text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 max-w-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <a href="tel:+917676447077" className="hover:text-white transition-colors">
                    +91 7676447077
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard("+917676447077", "phone")}
                  className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                  title="Copy Phone"
                >
                  {copiedKey === "phone" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 max-w-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <a href="mailto:kemkendra1@gmail.com" className="hover:text-white transition-colors">
                    kemkendra1@gmail.com
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard("kemkendra1@gmail.com", "email")}
                  className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                  title="Copy Email"
                >
                  {copiedKey === "email" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <div className="flex items-center gap-2 px-2 py-1 text-slate-400 text-[10px]">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Headquarters: Bengaluru, Karnataka, India</span>
              </div>
            </div>
          </div>

          {/* Directory Columns (8 cols, 4 sub-columns) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">

            {/* Column 1: Marketplace */}
            <div className="space-y-3">
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono border-b border-slate-800 pb-2">
                Marketplace
              </h3>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li>
                  <Link href="/products" className="hover:text-white transition-colors">
                    Browse Chemicals
                  </Link>
                </li>
                <li>
                  <Link href="/sourcing" className="hover:text-white transition-colors">
                    Sourcing Desk
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=PHARMACEUTICAL_APIS" className="hover:text-white transition-colors">
                    Active Ingredients (APIs)
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=INTERMEDIATES" className="hover:text-white transition-colors">
                    Penultimate Intermediates
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=SOLVENTS" className="hover:text-white transition-colors">
                    HPLC & Reagent Solvents
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="hover:text-white transition-colors">
                    Chemical Categories
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Buyers */}
            <div className="space-y-3">
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono border-b border-slate-800 pb-2">
                For Buyers
              </h3>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Create Buyer Account
                  </Link>
                </li>
                <li>
                  <Link href="/sourcing/request" className="hover:text-blue-400 text-blue-300 font-bold transition-colors">
                    Request Sourcing (RFQ)
                  </Link>
                </li>
                <li>
                  <Link href="/rfq" className="hover:text-white transition-colors">
                    Submit Batch RFQ
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Procurement Desk
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="hover:text-white transition-colors">
                    Specification Guides
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Suppliers */}
            <div className="space-y-3">
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono border-b border-slate-800 pb-2">
                For Suppliers
              </h3>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li>
                  <Link href="/register/supplier" className="hover:text-white transition-colors">
                    Sell on KemKendra
                  </Link>
                </li>
                <li>
                  <Link href="/register/supplier" className="hover:text-white transition-colors">
                    Supplier Registration
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Supplier Operations Portal
                  </Link>
                </li>
                <li>
                  <Link href="/suppliers" className="hover:text-white transition-colors">
                    Verified Manufacturers
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    Verification Protocol
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Governance & Legal */}
            <div className="space-y-3">
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono border-b border-slate-800 pb-2">
                Governance & Trust
              </h3>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of B2B Trade
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Sourcing Support
                  </Link>
                </li>
                <li>
                  <span className="text-[10px] font-mono text-slate-500 block pt-1">
                    MCA & GST Registered
                  </span>
                </li>
                <li>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    TLS 1.3 Strict Transport
                  </span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM METRICS & COMPLIANCE BAR */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-400 pt-2">
          <div className="flex flex-wrap items-center gap-3">
            <span>&copy; {new Date().getFullYear()} KemKendra Technologies Ltd. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-slate-500">ISO 9001:2015 & cGMP Quality Framework</span>
          </div>

          <div className="flex items-center gap-3 self-center sm:self-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>All Systems Operational</span>
            </div>
            <span className="text-slate-500">v1.0.0 (Prod)</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
