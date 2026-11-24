"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  }, []);

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
        {/* 1. INSTITUTIONAL HERO SECTION */}
        {/* ========================================================================= */}
        <section className="bg-white border-b border-slate-200/90 pt-8 pb-14 sm:pb-18">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Context Navigation Breadcrumb */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mb-6">
              <Link href="/" className="hover:text-[#0052CC] transition-colors">
                KemKendra Enterprise
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400">Procurement & Supply Operations</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="font-bold text-[#091E42]">Chemical Sourcing Desk</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Mission & Value Proposition */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#EFF6FF] text-[#0052CC] border border-[#BFDBFE]">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Institutional Procurement Clearinghouse</span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#091E42] tracking-tight leading-[1.12]">
                    Custom Chemical Sourcing & Factory Allocation
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                    Direct institutional allocation for unlisted active pharmaceutical ingredients, synthesis intermediates, and bulk chemical process inputs from pre-audited global manufacturers.
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={scrollToForm}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>Submit Sourcing Inquiry</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <Link
                    href="/sourcing/request"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-300 transition-colors shadow-2xs"
                  >
                    <FileText className="w-4 h-4 text-[#0052CC]" />
                    <span>Formal Procurement Dossier (RFQ)</span>
                  </Link>

                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 text-xs font-semibold text-slate-600 hover:text-[#0052CC] transition-colors"
                  >
                    <span>Browse Public Catalog</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Key Operating Guarantees */}
                <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Primary Synthesizers Only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Lot-Specific CoA & GHS SDS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>24–48h Dispatch Assessment</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Reference Tracker & Operational Telemetry Card */}
              <div className="lg:col-span-5 space-y-4">
                {/* Reference Tracker Card */}
                <div className="bg-[#091E42] text-white rounded-2xl border border-slate-800 shadow-tactile-card p-6 sm:p-7 space-y-5">
                  <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-blue-400" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                        Inquiry Tracking Console
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">Desk Online</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Have an existing inquiry reference code? Enter your identifier to inspect quotation options, technical proposals, or testing dossiers.
                  </p>

                  <form onSubmit={handleTrackLookup} className="space-y-3">
                    <div className="space-y-1">
                      <div className="relative">
                        <input
                          type="text"
                          value={trackCode}
                          onChange={(e) => {
                            setTrackCode(e.target.value);
                            if (trackError) setTrackError("");
                          }}
                          placeholder="e.g. SRC-2026-849201 or Inquiry ID"
                          className="w-full h-11 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#0052CC] transition-colors"
                        />
                      </div>
                      {trackError && (
                        <p className="text-[11px] text-rose-400 font-mono">{trackError}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full h-10 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs flex items-center justify-center gap-2"
                    >
                      <span>Locate Sourcing Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Telemetry Strip */}
                  <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-3 text-[11px] font-mono">
                    <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block uppercase">Network Reach</span>
                      <strong className="text-white text-xs font-bold">120+ Audited Plants</strong>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block uppercase">Escrow Protection</span>
                      <strong className="text-emerald-400 text-xs font-bold">100% Cleared</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. CHEMICAL SCOPE & SOURCING CAPACITY MATRIX */}
        {/* ========================================================================= */}
        <section className="py-14 sm:py-18 bg-[#F8F9FA] border-b border-slate-200/90">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <span className="text-xs font-mono font-bold uppercase text-[#0052CC] tracking-wider block">
                  Material Coverage & Technical Classification
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#091E42] tracking-tight">
                  Commercial Scope & Pharmacopeial Categories
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Our technical desk sources directly from validated chemical synthesizers across India, the European Union, the United States, and Japan.
                </p>
              </div>

              <button
                type="button"
                onClick={scrollToForm}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0052CC] hover:underline self-start md:self-auto cursor-pointer"
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
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-tactile-card space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        {item.code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-[#091E42] leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase">Pharmacopeial Standard</span>
                      <strong className="text-slate-800 text-[11px]">{item.monographs}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase">Typical Turnaround</span>
                      <span className="text-slate-700 text-[11px] font-semibold">{item.typicalLeadTime}</span>
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
        <section className="py-14 sm:py-18 bg-white border-b border-slate-200/90">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-[#0052CC] tracking-wider block">
                Standard Operating Procedure
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#091E42] tracking-tight">
                The KemKendra Sourcing & Allocation Protocol
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A structured, auditable procurement lifecycle ensuring technical compendial compliance, pricing transparency, and verified logistics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {protocolSteps.map((step) => (
                <div
                  key={step.step}
                  className="p-6 rounded-2xl border border-slate-200/90 bg-[#F8F9FA] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-2xl font-black text-[#0052CC] font-mono block">
                      {step.step}
                    </span>
                    <h3 className="text-xs font-bold uppercase text-[#091E42] tracking-wider">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-slate-400">Audited Milestone</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. TECHNICAL & REGULATORY ASSURANCE CLEARINGHOUSE */}
        {/* ========================================================================= */}
        <section className="py-14 sm:py-18 bg-[#F8F9FA] border-b border-slate-200/90">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-[#0052CC] tracking-wider block">
                Quality Governance Standards
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#091E42] tracking-tight">
                Regulatory Rigor for Every Chemical Batch
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We bridge the gap between chemical manufacturers and regulated industrial buyers through mandatory compliance documentation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {technicalAssurances.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-tactile-card space-y-2.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#091E42] flex items-center justify-center font-bold text-xs font-mono">
                    0{idx + 1}
                  </div>
                  <h3 className="text-xs font-bold text-[#091E42] uppercase tracking-wider">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. INTERACTIVE SOURCING INTAKE TERMINAL */}
        {/* ========================================================================= */}
        <section ref={formRef} id="sourcing-terminal" className="py-14 sm:py-20 bg-white">
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="bg-[#F8F9FA] border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-tactile-card space-y-8">
              <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#0052CC] tracking-wider block">
                    Direct Sourcing Intake Form
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#091E42] tracking-tight">
                    Submit Material Specifications
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Our technical desk will query verified manufacturers and deliver quotation proposals to your corporate email.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200">
                    Response: 24–48h
                  </span>
                </div>
              </div>

              {status === "success" ? (
                <div className="bg-white border border-emerald-200 rounded-2xl p-8 sm:p-10 text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-[#091E42]">
                      Sourcing Inquiry Formally Registered
                    </h3>
                    <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                      Your inquiry has been allocated to our technical chemical sourcing desk. We are querying primary synthesizers for batch availability and pricing.
                    </p>
                  </div>

                  {submittedRef && (
                    <div className="inline-flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800">
                      <span>Tracking Reference:</span>
                      <strong className="text-[#0052CC] font-bold">{submittedRef}</strong>
                    </div>
                  )}

                  <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStatus("idle");
                        setSubmittedRef(null);
                      }}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                    >
                      Submit Another Sourcing Request
                    </button>
                    <Link
                      href="/sourcing/request"
                      className="px-5 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                    >
                      Open Full Procurement RFQ Desk
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {status === "error" && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800 font-medium">
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

                  {/* Field Groups: 2 Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Column 1: Chemical & Product Specifications */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider border-b border-slate-200 pb-2">
                        1. Compound & Material Parameters
                      </h4>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Product / Chemical Compound Name <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={chemicalName}
                          onChange={(e) => setChemicalName(e.target.value)}
                          placeholder="e.g. 4-Hydroxycarbazole or Dimethyl Adipate (DBE)"
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            CAS Registry Number
                          </label>
                          <input
                            type="text"
                            value={casNumber}
                            onChange={(e) => setCasNumber(e.target.value)}
                            placeholder="e.g. 52602-39-8"
                            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Required Grade / Purity
                          </label>
                          <input
                            type="text"
                            value={gradePurity}
                            onChange={(e) => setGradePurity(e.target.value)}
                            placeholder="e.g. Pharma (USP), ≥ 99.0%"
                            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Target Batch Volume
                          </label>
                          <input
                            type="text"
                            value={targetQuantity}
                            onChange={(e) => setTargetQuantity(e.target.value)}
                            placeholder="e.g. 500, 2500"
                            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Unit
                          </label>
                          <select
                            value={quantityUnit}
                            onChange={(e) => setQuantityUnit(e.target.value)}
                            className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0052CC] transition-colors"
                          >
                            <option value="kg">Kilograms (kg)</option>
                            <option value="MT">Metric Tons (MT)</option>
                            <option value="L">Liters (L)</option>
                            <option value="drums">Drums (25/200kg)</option>
                            <option value="IBC">IBC Tanks (1000L)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Destination Plant / State
                        </label>
                        <input
                          type="text"
                          value={deliveryLocation}
                          onChange={(e) => setDeliveryLocation(e.target.value)}
                          placeholder="e.g. Ankleshwar, Gujarat / Hyderabad, Telangana"
                          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Column 2: Procurement Contact & Requirements */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider border-b border-slate-200 pb-2">
                        2. Procurement Officer & Specification Scope
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Full Name <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Vikram Sharma"
                            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Business Email <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="procurement@company.com"
                            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Corporate Entity / Company
                          </label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. ChemCorp Pharma Ltd"
                            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Telephone / Mobile
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Technical Specifications & Standards <span className="text-rose-600">*</span>
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Specify packaging preferences (e.g. UN-rated fiber drums, IBC tanks), testing requirements (HPLC, residual solvents), target delivery date, or commercial price expectations..."
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0052CC] transition-colors leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submission Action Bar */}
                  {isAuthenticated === false ? (
                    <div className="pt-4 border-t border-slate-200">
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-0.5 text-center sm:text-left">
                          <strong className="text-xs font-bold text-amber-950 block">
                            Buyer Sign-In Required to Submit Sourcing Inquiries
                          </strong>
                          <p className="text-[11px] text-amber-900 leading-relaxed">
                            To ensure confidential quotation delivery and direct supplier matching, sourcing requests require an active buyer account.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href="/login?redirect=/sourcing"
                            className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-2xs"
                          >
                            Sign In
                          </Link>
                          <Link
                            href="/register?redirect=/sourcing"
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
                          >
                            Register
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-[11px] font-mono text-slate-500">
                        Transmitted under institutional commercial confidentiality. Protected by KemKendra compliance NDA.
                      </p>

                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full sm:w-auto px-7 py-3 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Transmitting to Sourcing Desk...</span>
                          </>
                        ) : (
                          <>
                            <span>Transmit Sourcing Inquiry</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. ENTERPRISE DIRECT DESK FOOTER */}
        {/* ========================================================================= */}
        <section className="py-12 sm:py-16 bg-[#091E42] text-white">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] font-mono uppercase text-blue-300 font-bold tracking-wider">
                Dedicated Enterprise Procurement
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Require a Dedicated Sourcing Officer for High-Volume Contracts?
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                For long-term multi-MT supply contracts or custom CDMO projects, our senior chemical procurement partners provide on-site technical coordination.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/sourcing/request"
                className="px-5 py-3 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-2xs"
              >
                Launch Formal RFQ Dossier
              </Link>
              <Link
                href="/contact"
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-700 transition-colors"
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
