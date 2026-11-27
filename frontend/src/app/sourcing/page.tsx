"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
import { getAuthToken, getAuthUser } from "@/features/auth/api/auth";
import {
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Clock,
  Building2,
  Send,
  AlertCircle,
  Loader2,
  FlaskConical,
  Layers,
  ChevronRight,
  ClipboardList,
  Network,
  Scale,
  BadgeCheck,
  FileText,
  Lock,
  Package,
  MapPin,
  ExternalLink,
  Check,
  Copy,
} from "lucide-react";
import { resolveApiUrl } from "@/lib/apiUrl";

export default function SourcingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLDivElement>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [chemicalName, setChemicalName] = useState("");
  const [casNumber, setCasNumber] = useState("");
  const [targetQuantity, setTargetQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("kg");
  const [gradePurity, setGradePurity] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [message, setMessage] = useState("");
  const [botTrap, setBotTrap] = useState("");

  // Tracking Lookup State
  const [trackCode, setTrackCode] = useState("");
  const [trackError, setTrackError] = useState("");

  const [isPending, startTransition] = useTransition();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    const user = getAuthUser();
    setIsAuthenticated(Boolean(token && user));
    if (user?.email) {
      setEmail(user.email);
    }

    const chemicalParam = searchParams.get("chemical");
    if (chemicalParam) {
      setChemicalName(chemicalParam);
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 400);
    }
  }, [searchParams]);

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      const firstInput = formRef.current.querySelector("input");
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 400);
      }
    }
  };

  const handleTrackLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = trackCode.trim();
    if (!cleaned) {
      setTrackError("Please enter a valid sourcing reference code or inquiry ID.");
      return;
    }
    setTrackError("");
    router.push(`/sourcing/track/${encodeURIComponent(cleaned)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    const token = getAuthToken();
    if (!token || !isAuthenticated) {
      setStatus("error");
      setErrorMessage("Buyer authentication is required to submit a sourcing request. Please sign in or register.");
      setIsAuthenticated(false);
      return;
    }

    if (!fullName.trim() || !email.trim() || !chemicalName.trim() || !message.trim()) {
      setStatus("error");
      setErrorMessage("Please complete all required fields (Your Name, Business Email, Chemical Name, and Specifications).");
      return;
    }

    startTransition(async () => {
      try {
        const generatedReference = `SRC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

        const fullDetails = [
          `[SOURCING DESK INTAKE - REFERENCE: ${generatedReference}]`,
          `Chemical / Compound: ${chemicalName.trim()}`,
          casNumber.trim() ? `CAS Registry Number: ${casNumber.trim()}` : null,
          targetQuantity.trim() ? `Target Volume: ${targetQuantity.trim()} ${quantityUnit}` : null,
          gradePurity.trim() ? `Required Pharmacopeia / Grade: ${gradePurity.trim()}` : null,
          deliveryLocation.trim() ? `Destination Facility: ${deliveryLocation.trim()}` : null,
          `---`,
          `Technical Specifications & Standards:\n${message.trim()}`
        ].filter(Boolean).join("\n");

        const payload = {
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          companyName: companyName.trim() || null,
          chemicalInterest: chemicalName.trim(),
          casNumber: casNumber.trim() || null,
          targetQuantity: targetQuantity.trim() ? `${targetQuantity.trim()} ${quantityUnit}` : null,
          message: fullDetails,
          honeypot: botTrap || null,
        };

        const res = await fetch(resolveApiUrl("/api/v1/public/contact"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message || "Failed to register sourcing request. Please try again.");
        }

        setSubmittedRef(generatedReference);
        setStatus("success");
        setChemicalName("");
        setCasNumber("");
        setTargetQuantity("");
        setGradePurity("");
        setDeliveryLocation("");
        setMessage("");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "An unexpected network error occurred. Please contact the sourcing desk directly.");
      }
    });
  };

  // Structured Sourcing Scope Categories
  const sourceCategories = [
    {
      code: "API-01",
      title: "Active Pharmaceutical Ingredients (APIs)",
      description: "Commercial and clinical batch APIs synthesized under cGMP conditions. Full regulatory support with CEP, DMF, and ASMF documentation.",
      tag: "cGMP Synthesized",
      monographs: "USP, EP, BP, IP",
      typicalLeadTime: "2 to 3 weeks",
    },
    {
      code: "INT-02",
      title: "Advanced Chemical Intermediates & KSMs",
      description: "Key Starting Materials and penultimate reaction intermediates for complex multi-step organic synthesis pipelines.",
      tag: "Custom Synthesis",
      monographs: "Assay ≥ 98.5% (HPLC/GC)",
      typicalLeadTime: "1 to 2 weeks",
    },
    {
      code: "SOL-03",
      title: "High-Purity Solvents & Analytical Reagents",
      description: "Ultra-pure polar aprotic, chlorinated, and anhydrous solvents with strictly controlled moisture thresholds (< 0.01%) and minimal non-volatile residue.",
      tag: "Chromatography Grade",
      monographs: "HPLC, Spectrophotometric, ACS",
      typicalLeadTime: "3 to 5 business days",
    },
    {
      code: "EXC-04",
      title: "Pharmaceutical Excipients & Binders",
      description: "Direct-compression binders, disintegrants, lubricants, solubilizing polymers, and antioxidant stabilizers complying with pharmacopeial standards.",
      tag: "Formulation Inputs",
      monographs: "NF, Ph. Eur., JP",
      typicalLeadTime: "5 to 7 business days",
    },
    {
      code: "IND-05",
      title: "Specialty & Fine Industrial Chemicals",
      description: "Polymer catalysts, photoinitiators, electronic-grade chemicals, corrosion inhibitors, and specialized chelating compounds.",
      tag: "Industrial Scale",
      monographs: "ISO 9001, REACH Registered",
      typicalLeadTime: "1 to 2 weeks",
    },
    {
      code: "CDM-06",
      title: "Custom Contract Synthesis & CDMO",
      description: "Dedicated bench-to-pilot synthesis campaigns for proprietary compounds, custom esterifications, chiral separations, and hazardous chemistries.",
      tag: "Contract Manufacturing",
      monographs: "Custom Specifications / CoA",
      typicalLeadTime: "Allocation on Scope",
    },
  ];

  // 4-Stage Audited Protocol
  const protocolSteps = [
    {
      step: "01",
      title: "Specification & Compliance Intake",
      description: "Buyer submits chemical structure, CAS registry identifier, pharmacopeial grade, target volume, and technical acceptance thresholds.",
    },
    {
      step: "02",
      title: "Primary Manufacturer Pre-Screening",
      description: "Desk queries our pre-audited network of primary synthesizers to filter out brokers, validating license status and facility inspections.",
    },
    {
      step: "03",
      title: "Competitive Quotation & Technical Audit",
      description: "We secure direct factory pricing with validated Certificates of Analysis (CoA), minimum order quantities, and committed dispatch schedules.",
    },
    {
      step: "04",
      title: "Milestone Contract & Quality Clearance",
      description: "Buyer evaluates transparent proposals, locks in pricing via escrow clearinghouse, and receives pre-shipment lot verification.",
    },
  ];

  // Technical Deliverables
  const technicalAssurances = [
    {
      title: "Lot-Specific Certificate of Analysis",
      description: "Complete analytical dossier including HPLC/GC chromatograms, water content by Karl Fischer, and heavy metals ICP-OES limits.",
    },
    {
      title: "16-Section GHS Safety Data Sheets",
      description: "Fully compliant regulatory documentation with REACH, OSHA, and transport classification for hazardous cargo.",
    },
    {
      title: "Primary Manufacturer Direct Allocation",
      description: "No middlemen or unverified secondary traders. Contracts are placed directly with audited synthesis plants.",
    },
    {
      title: "Escrow-Guaranteed Commercial Protection",
      description: "Funds remain safeguarded in KemKendra's institutional escrow until technical acceptance criteria are fulfilled at destination.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#0F172A] antialiased">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 1. INSTITUTIONAL HERO SECTION WITH DIRECT SOURCING INTAKE TERMINAL */}
        {/* ========================================================================= */}
        <section className="bg-white border-b border-slate-200/80 pt-6 pb-12 sm:pb-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Context Navigation Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#0052CC] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Procurement</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-900">Chemical Sourcing Desk</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Left Column (5 cols): Editorial Statement, Guarantees & Inquiry Tracker */}
              <div className="lg:col-span-5 space-y-7">
                <div className="space-y-3.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-blue-50/80 text-[#0052CC] border border-blue-200/60">
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Direct Factory Allocation Desk</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#091E42] tracking-tight leading-tight">
                    Custom chemical sourcing &amp; contract synthesis.
                  </h1>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Direct manufacturer allocation for compendial APIs, pharmaceutical intermediates, and high-purity industrial solvents from 120+ audited chemical plants across Dahej, Ankleshwar, Vapi, and Hyderabad.
                  </p>
                </div>

                {/* Key Operating Guarantees */}
                <div className="space-y-3 p-4.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-700">
                      <strong className="font-bold text-slate-900 block">Primary Synthesizers Only</strong>
                      Direct plant allocations with zero intermediary broker markups.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-700">
                      <strong className="font-bold text-slate-900 block">Audited Batch Documentation</strong>
                      Every lot includes full Certificate of Analysis, HPLC assay spectra, and 16-section GHS SDS.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-700">
                      <strong className="font-bold text-slate-900 block">Institutional Escrow Protection</strong>
                      Funds remain safeguarded until destination laboratory analytical release.
                    </div>
                  </div>
                </div>

                {/* Tracking Console Card (Clean, High-Contrast & Professional) */}
                <div className="bg-[#0A1128] text-white rounded-2xl border border-slate-800 p-5 space-y-4 shadow-tactile-card">
                  <div className="border-b border-slate-800/80 pb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white tracking-wide">
                        Track Existing Inquiry
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Desk Active
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Have an inquiry reference code? Enter it below to review factory quotations, analytical testing, and dispatch timelines.
                  </p>

                  <form onSubmit={handleTrackLookup} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={trackCode}
                        onChange={(e) => {
                          setTrackCode(e.target.value);
                          if (trackError) setTrackError("");
                        }}
                        placeholder="e.g. SRC-2026-849201"
                        className="flex-1 h-10 px-3.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#0052CC] transition-colors"
                      />
                      <button
                        type="submit"
                        className="h-10 px-4 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <span>Track</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {trackError && (
                      <p className="text-xs text-rose-400 font-medium">{trackError}</p>
                    )}
                  </form>

                  {/* Network Telemetry Metrics */}
                  <div className="pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Network Capacity</span>
                      <strong className="text-white font-bold">120+ Audited Plants</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">SLA Commitment</span>
                      <strong className="text-emerald-400 font-bold">24–48h Factory Quotes</strong>
                    </div>
                  </div>
                </div>

                {/* Additional Quick Link */}
                <div>
                  <Link
                    href="/sourcing/request"
                    className="text-xs font-semibold text-[#0052CC] hover:underline inline-flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Need multi-item contract procurement? Open Full RFQ Desk &rarr;</span>
                  </Link>
                </div>
              </div>

              {/* Right Column (7 cols): DIRECT SOURCING INTAKE TERMINAL */}
              <div ref={formRef} id="sourcing-terminal" className="lg:col-span-7">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-tactile-card space-y-6">
                  
                  <div className="border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-[#091E42] tracking-tight">
                        Submit Chemical Specifications
                      </h2>
                      <p className="text-xs text-slate-600">
                        Our technical procurement desk will match your purity and batch volume directly with primary synthesis plants.
                      </p>
                    </div>

                    <div className="shrink-0">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Response: 24–48h
                      </span>
                    </div>
                  </div>

                  {status === "success" ? (
                    <div className="bg-slate-50 border border-emerald-200 rounded-xl p-8 text-center space-y-5">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-base font-bold text-[#091E42]">
                          Sourcing Inquiry Formally Registered
                        </h3>
                        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                          Your compound specifications have been routed to our chemical engineering desk. We are contacting primary synthesis plants for lot availability and factory pricing.
                        </p>
                      </div>

                      {submittedRef && (
                        <div className="inline-flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800">
                          <span className="text-slate-500 font-sans">Reference:</span>
                          <strong className="text-[#0052CC] font-bold">{submittedRef}</strong>
                        </div>
                      )}

                      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setStatus("idle");
                            setSubmittedRef(null);
                          }}
                          className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                        >
                          Submit Another Inquiry
                        </button>
                        <Link
                          href="/sourcing/request"
                          className="px-4 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                        >
                          Open Full Procurement RFQ
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {status === "error" && (
                        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800 font-medium">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      {/* Honeypot field */}
                      <div className="hidden" aria-hidden="true">
                        <input
                          type="text"
                          name="honeypot_sourcing_field"
                          tabIndex={-1}
                          autoComplete="off"
                          value={botTrap}
                          onChange={(e) => setBotTrap(e.target.value)}
                        />
                      </div>

                      {/* Chemical Compound Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                          Chemical / Compound Name <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={chemicalName}
                          onChange={(e) => setChemicalName(e.target.value)}
                          placeholder="e.g. Paracetamol IP, 4-Hydroxycarbazole, Dimethyl Adipate..."
                          className="w-full h-10 px-3.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 transition-colors shadow-2xs"
                        />
                      </div>

                      {/* CAS & Grade */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                            CAS Registry Number
                          </label>
                          <input
                            type="text"
                            value={casNumber}
                            onChange={(e) => setCasNumber(e.target.value)}
                            placeholder="e.g. 103-90-2"
                            className="w-full h-10 px-3.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                            Required Grade / Purity
                          </label>
                          <input
                            type="text"
                            value={gradePurity}
                            onChange={(e) => setGradePurity(e.target.value)}
                            placeholder="e.g. IP / USP / BP, ≥ 99.5%"
                            className="w-full h-10 px-3.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                          />
                        </div>
                      </div>

                      {/* Volume & Destination */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                        <div className="sm:col-span-5">
                          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                            Target Batch Volume
                          </label>
                          <input
                            type="text"
                            value={targetQuantity}
                            onChange={(e) => setTargetQuantity(e.target.value)}
                            placeholder="e.g. 500, 2000"
                            className="w-full h-10 px-3.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                            Unit
                          </label>
                          <select
                            value={quantityUnit}
                            onChange={(e) => setQuantityUnit(e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0052CC] transition-colors"
                          >
                            <option value="kg">Kilograms (kg)</option>
                            <option value="MT">Metric Tons (MT)</option>
                            <option value="L">Liters (L)</option>
                            <option value="drums">Drums (200L)</option>
                            <option value="IBC">IBC Tanks (1000L)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                            Destination City / Port
                          </label>
                          <input
                            type="text"
                            value={deliveryLocation}
                            onChange={(e) => setDeliveryLocation(e.target.value)}
                            placeholder="e.g. Ankleshwar / Dahej"
                            className="w-full h-10 px-3.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                          />
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                            Your Name <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Dr. Rajesh Patel"
                            className="w-full h-10 px-3.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                            Business Email <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="procurement@pharma.com"
                            className="w-full h-10 px-3.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                            Company Name
                          </label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. ChemCorp Pharma Ltd"
                            className="w-full h-10 px-3.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                            Phone / Mobile
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full h-10 px-3.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                          />
                        </div>
                      </div>

                      {/* Technical Specs Textarea */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                          Technical Specifications &amp; Requirements <span className="text-rose-600">*</span>
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Specify packaging (e.g. UN fiber drums, IBC tanks), testing requirements (HPLC, residual solvents), target delivery date, or target price..."
                          className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors leading-relaxed"
                        />
                      </div>

                      {/* Submission / Auth Banner */}
                      {isAuthenticated === false ? (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="space-y-0.5 text-center sm:text-left">
                            <strong className="text-xs font-bold text-slate-900 block">
                              Sign in to submit your sourcing inquiry
                            </strong>
                            <p className="text-xs text-slate-500">
                              A buyer account is required to deliver confidential factory pricing.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              href="/login?redirect=/sourcing"
                              className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs"
                            >
                              Sign In
                            </Link>
                            <Link
                              href="/register?redirect=/sourcing"
                              className="px-4 py-2 bg-white border border-slate-300 text-slate-800 font-semibold text-xs rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              Register
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>Protected by non-disclosure protocols and escrow clearing.</span>
                          </p>

                          <button
                            type="submit"
                            disabled={isPending}
                            className="w-full sm:w-auto px-6 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2"
                          >
                            {isPending ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Allocating Sourcing Desk...</span>
                              </>
                            ) : (
                              <>
                                <span>Submit Sourcing Inquiry</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </form>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. CHEMICAL SCOPE & SOURCING CAPACITY MATRIX */}
        {/* ========================================================================= */}
        <section className="py-14 sm:py-18 bg-[#F8F9FA] border-b border-slate-200">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Material Coverage &amp; Technical Classification
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Commercial Scope &amp; Compendial Categories
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Our technical desk sources directly from validated chemical synthesizers across India, the European Union, the United States, and Japan.
                </p>
              </div>

              <button
                type="button"
                onClick={scrollToForm}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0052CC] hover:text-[#0747A6] hover:underline self-start md:self-auto cursor-pointer"
              >
                <span>Request unlisted chemical compound</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* High-density Classification Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sourceCategories.map((item) => (
                <div
                  key={item.code}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs hover:border-[#0052CC]/40 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-semibold text-slate-400">
                        {item.code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block uppercase tracking-wider">Compendial Standard</span>
                      <strong className="text-slate-800 text-xs font-semibold">{item.monographs}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block uppercase tracking-wider">Typical Turnaround</span>
                      <span className="text-slate-700 text-xs font-medium">{item.typicalLeadTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. FOUR-STAGE PROCUREMENT PROTOCOL */}
        {/* ========================================================================= */}
        <section className="py-14 sm:py-18 bg-white border-b border-slate-200">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Standard Operating Procedure
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Structured Chemical Sourcing &amp; Allocation Protocol
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A structured, auditable procurement lifecycle ensuring technical compendial compliance, factory pricing transparency, and verified logistics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {protocolSteps.map((step, idx) => (
                <div
                  key={step.step}
                  className="p-6 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0052CC] uppercase tracking-wider">
                        Stage 0{idx + 1}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-200/60">
                    <span className="text-[11px] text-slate-400 font-medium">Audited Milestone</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. TECHNICAL & REGULATORY ASSURANCE CLEARINGHOUSE */}
        {/* ========================================================================= */}
        <section className="py-14 sm:py-18 bg-[#F8F9FA] border-b border-slate-200">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Quality Governance Standards
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Regulatory Rigor for Every Chemical Batch
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We bridge the gap between chemical manufacturers and regulated industrial buyers through mandatory compliance documentation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {technicalAssurances.map((item, idx) => {
                const icons = [FileCheck2, FileText, Building2, ShieldCheck];
                const IconComponent = icons[idx] || ShieldCheck;
                return (
                  <div
                    key={idx}
                    className="p-6 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0052CC] flex items-center justify-center">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. ENTERPRISE CLEARINGHOUSE ASSURANCES */}
        {/* ========================================================================= */}
        <section className="py-12 bg-white border-b border-slate-200">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#0B192C] text-white rounded-xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-slate-800">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 block">
                  Institutional Contracting
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  High-volume commercial contracts or custom CMO synthesis?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Our senior procurement directors provide dedicated single-window SLA contracting, custom CMO audits, and milestone-based escrow clearing.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="px-5 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center gap-2"
                >
                  <span>Submit Inquiry Above</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <Link
                  href="/sourcing/request"
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors"
                >
                  <span>Formal RFQ Dossier</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5.5. SOURCING KNOWLEDGE BASE, BULK PACKAGING & REGULATORY FAQS */}
        {/* ========================================================================= */}
        <section className="py-14 sm:py-18 bg-white border-b border-slate-200">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Technical Specifications &amp; Logistics Standards
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Chemical Procurement Specifications, Bulk Packaging &amp; Logistics
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every sourcing inquiry routed through KemKendra is processed under strict compliance with international chemical safety standards, UN packaging certifications, and pharmacopeial monographs.
              </p>
            </div>

            {/* Packaging & Transport Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center gap-2 text-[#0052CC] font-semibold text-xs">
                  <Package className="w-4 h-4 text-[#0052CC]" />
                  <span>ISO Tank Containers</span>
                </div>
                <strong className="text-sm font-bold text-slate-900 block">20,000L to 26,000L</strong>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bulk solvent transit for Isopropyl Alcohol, Methanol, Acetone, DCM, and industrial alcohols with top and bottom discharge valves.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center gap-2 text-[#0052CC] font-semibold text-xs">
                  <Package className="w-4 h-4 text-[#0052CC]" />
                  <span>IBC Totes (UN-Certified)</span>
                </div>
                <strong className="text-sm font-bold text-slate-900 block">1,000 Liters Capacity</strong>
                <p className="text-xs text-slate-600 leading-relaxed">
                  HDPE intermediate bulk containers encased in galvanized steel cages for chemical liquid intermediates and specialty reagents.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center gap-2 text-[#0052CC] font-semibold text-xs">
                  <Package className="w-4 h-4 text-[#0052CC]" />
                  <span>Tight-Head Drums</span>
                </div>
                <strong className="text-sm font-bold text-slate-900 block">200L MS / HDPE Drums</strong>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Epoxy-lined mild steel and high-density polyethylene drums with tamper-evident caps for compendial excipients and solvents.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center gap-2 text-[#0052CC] font-semibold text-xs">
                  <Package className="w-4 h-4 text-[#0052CC]" />
                  <span>UN-Rated Fiber Drums</span>
                </div>
                <strong className="text-sm font-bold text-slate-900 block">25kg to 50kg Net Weight</strong>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Double-polyethylene lined fiber drums with silica desiccant pouches for crystalline APIs, powdered intermediates, and excipients.
                </p>
              </div>
            </div>

            {/* Sourcing FAQs */}
            <div className="space-y-6 pt-4 border-t border-slate-100">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Frequently Asked Questions (Chemical Sourcing Desk)
                </h3>
                <p className="text-xs text-slate-600">
                  Detailed guidance on supplier allocation, analytical validation, pilot trials, and commercial execution.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-600 leading-relaxed">
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    How does KemKendra source hard-to-find or custom synthesis chemicals?
                  </h4>
                  <p>
                    When you submit a sourcing inquiry with chemical structure, CAS number, purity threshold, and batch volume, our chemical engineering team cross-references our verified manufacturing network across Dahej, Ankleshwar, Vapi, and Hyderabad to match primary synthesizers capable of reaction execution without multi-tier broker markups.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    What is the typical Minimum Order Quantity (MOQ)?
                  </h4>
                  <p>
                    MOQs depend on compound classification. Commercial solvents typically require 200L drums or 1,000L IBC totes. For Active Pharmaceutical Ingredients (APIs) and advanced intermediates, MOQs start from 1kg–5kg for pilot trial batches up to commercial metric-ton allocations.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    How are Certificates of Analysis (COA) validated?
                  </h4>
                  <p>
                    All supplier quotations must include batch-specific COAs featuring HPLC/GC purity assays, Karl Fischer moisture content, residual solvent profiling (ICH Q3C), and heavy metal limits. Third-party NABL-accredited laboratory pre-shipment retesting is available upon request.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    How does institutional escrow protect buyer funds?
                  </h4>
                  <p>
                    Funds deposited for sourcing orders remain safeguarded in an institutional clearing escrow account. Payment is only disbursed to the manufacturing plant once pre-shipment quality inspection and destination goods receipt verification pass technical acceptance.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. ENTERPRISE DIRECT DESK FOOTER */}
        {/* ========================================================================= */}
        <section className="py-12 sm:py-14 bg-[#0B192C] text-white">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs uppercase text-blue-400 font-semibold tracking-wider">
                Dedicated Enterprise Procurement
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Require a Dedicated Sourcing Officer for High-Volume Contracts?
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                For long-term multi-MT supply contracts or custom CDMO projects, our senior chemical procurement partners provide on-site technical coordination.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/sourcing/request"
                className="px-5 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
              >
                Launch Formal RFQ Dossier
              </Link>
              <Link
                href="/contact"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              >
                Contact Enterprise Desk
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
