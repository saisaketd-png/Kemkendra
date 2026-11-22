"use client";

import React, { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
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
  Sparkles,
  ClipboardList,
  Network,
  Scale,
  BadgeCheck,
  HelpCircle,
} from "lucide-react";
import { resolveApiUrl } from "@/lib/apiUrl";

export default function SourcingPage() {
  const formRef = useRef<HTMLDivElement>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [chemicalName, setChemicalName] = useState("");
  const [casNumber, setCasNumber] = useState("");
  const [targetQuantity, setTargetQuantity] = useState("");
  const [gradePurity, setGradePurity] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [message, setMessage] = useState("");
  const [botTrap, setBotTrap] = useState("");

  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      const firstInput = formRef.current.querySelector("input");
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 500);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    if (!fullName.trim() || !email.trim() || !chemicalName.trim() || !message.trim()) {
      setStatus("error");
      setErrorMessage("Please complete all required fields (Your Name, Email, Chemical Name, and Specifications).");
      return;
    }

    startTransition(async () => {
      try {
        const fullDetails = [
          `[SOURCING REQUEST]`,
          `Chemical/Ingredient: ${chemicalName.trim()}`,
          casNumber.trim() ? `CAS Number: ${casNumber.trim()}` : null,
          targetQuantity.trim() ? `Target Volume: ${targetQuantity.trim()}` : null,
          gradePurity.trim() ? `Grade/Purity: ${gradePurity.trim()}` : null,
          deliveryLocation.trim() ? `Destination: ${deliveryLocation.trim()}` : null,
          `---`,
          `Specifications & Requirements:\n${message.trim()}`
        ].filter(Boolean).join("\n");

        const payload = {
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          companyName: companyName.trim() || null,
          chemicalInterest: chemicalName.trim(),
          casNumber: casNumber.trim() || null,
          targetQuantity: targetQuantity.trim() || null,
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
          throw new Error(errData?.message || "Failed to submit sourcing request. Please try again.");
        }

        setStatus("success");
        setChemicalName("");
        setCasNumber("");
        setTargetQuantity("");
        setGradePurity("");
        setDeliveryLocation("");
        setMessage("");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "An unexpected error occurred. Please contact us directly.");
      }
    });
  };

  // What We Source Categories
  const sourceCategories = [
    {
      title: "Industrial Chemicals",
      description: "Bulk basic chemicals, mineral acids, alkalis, inorganic salts, and foundational process inputs for manufacturing.",
      tag: "Bulk & Process",
      examples: "Sulfuric acid, Caustic soda, Adipic acid, Cyclohexanedione derivatives",
    },
    {
      title: "Specialty Chemicals",
      description: "High-performance additives, specialty polymers, fine organic chemicals, electronic chemicals, and formulation compounds.",
      tag: "Performance & Fine",
      examples: "Dibasic esters, Plasticizers, Coating coalescents, Monomethyl adipate",
    },
    {
      title: "Pharmaceutical Ingredients",
      description: "Pharmacopoeia-grade raw materials, nutraceutical inputs, mineral complexes, and regulated raw materials.",
      tag: "Pharma & Nutra",
      examples: "Tocopherols, CoQ10, Phytosterols, DHA Omega-3 oils, Vanillin",
    },
    {
      title: "APIs and Intermediates",
      description: "Active Pharmaceutical Ingredients, Key Starting Materials (KSMs), and advanced penultimate intermediates.",
      tag: "APIs & KSMs",
      examples: "4-Hydroxycarbazole, Tetrahydrocarbazolones, Epoxy propoxy carbazole",
    },
    {
      title: "Excipients",
      description: "Binders, disintegrants, lubricants, solubilizers, natural antioxidants, and modified-release carriers.",
      tag: "Formulation",
      examples: "Mixed tocopherols powder, Natural sterols, Stabilizers, Binders",
    },
    {
      title: "Solvents and Reagents",
      description: "High-purity laboratory reagents, analytical HPLC-grade solvents, and environmentally friendly green solvents.",
      tag: "High Purity",
      examples: "Dimethyl adipate (DBE), Fischer reagents, Reagent-grade hydrazines",
    },
  ];

  // How It Works Steps
  const steps = [
    {
      number: "01",
      title: "Submit your requirements.",
      description: "Specify the chemical compound name, CAS number, required purity, target quantity, and delivery destination in our procurement form.",
      icon: ClipboardList,
    },
    {
      number: "02",
      title: "Our team finds suitable suppliers.",
      description: "Our chemical sourcing specialists screen verified domestic and global manufacturers from our audited chemical supply network.",
      icon: Network,
    },
    {
      number: "03",
      title: "We collect quotations.",
      description: "We gather competitive pricing, minimum order quantities (MOQs), delivery lead times, and regulatory evidence (COA/MSDS).",
      icon: Scale,
    },
    {
      number: "04",
      title: "You compare options and connect with suppliers.",
      description: "Review transparent quotation options, select the supplier that matches your requirements, and finalize your order seamlessly.",
      icon: BadgeCheck,
    },
  ];

  // Why Choose KemKendra Points
  const benefits = [
    {
      title: "Dedicated sourcing assistance.",
      description: "A hands-on chemical procurement desk working directly on your specific requirements, eliminating unverified brokers.",
      icon: ShieldCheck,
    },
    {
      title: "Access to a wider supplier network.",
      description: "Direct connections with primary chemical manufacturers, certified API synthesizers, and vetted importers.",
      icon: Building2,
    },
    {
      title: "Multiple quotation options where available.",
      description: "Receive transparent comparison of unit pricing, MOQs, purity grades, and delivery schedules to maximize commercial leverage.",
      icon: FileCheck2,
    },
    {
      title: "Reduced time spent searching for suppliers.",
      description: "Avoid days of cold-calling, broken supply chains, and regulatory validation delays. We do the heavy diligence for you.",
      icon: Clock,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] font-sans text-[#0F172A] antialiased">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 1. BREADCRUMBS & HERO SECTION */}
        {/* ========================================================================= */}
        <section className="bg-white border-b border-[#E2E8F0] pt-6 pb-12 sm:pb-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mb-8">
              <Link href="/" className="hover:text-[#0052CC] transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="text-[#0F172A] font-extrabold">KemKendra Sourcing</span>
            </nav>

            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] text-xs font-bold bg-[#EFF6FF] text-[#0052CC] border border-[#BFDBFE] mb-5">
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Custom Procurement Service</span>
              </div>

              {/* Hero Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.15] mb-5">
                Can&apos;t Find the Chemical You Need?
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-[#475569] leading-relaxed mb-8">
                Let KemKendra help you source the right chemicals and pharmaceutical ingredients from suitable suppliers.
              </p>

              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={scrollToForm}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-sm font-semibold rounded-[6px] transition-colors shadow-xs active:scale-[0.99] cursor-pointer"
                >
                  <span>Request Sourcing Assistance</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-[#F8FAFC] text-[#334155] border border-[#CBD5E1] text-sm font-semibold rounded-[6px] transition-colors shadow-2xs"
                >
                  <span>Browse Current Catalog</span>
                </Link>
              </div>

              {/* Industrial Trust Badges */}
              <div className="mt-8 pt-6 border-t border-[#F1F5F9] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold text-[#475569]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>Verified Manufacturers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>COA & MSDS Compliance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>Competitive Quotes</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. HOW IT WORKS */}
        {/* ========================================================================= */}
        <section className="py-14 sm:py-18 bg-[#F7F9FC]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0052CC] block mb-2">
                Structured Procurement Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                How It Works
              </h2>
              <p className="text-sm text-[#475569] mt-2">
                A transparent, step-by-step process designed to simplify industrial raw material sourcing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step) => {
                const IconComponent = step.icon;
                return (
                  <div
                    key={step.number}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs flex flex-col justify-between relative hover:border-[#CBD5E1] transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-black font-mono text-[#CBD5E1]">
                          {step.number}
                        </span>
                        <div className="w-10 h-10 rounded-[8px] bg-[#EFF6FF] text-[#0052CC] flex items-center justify-center">
                          <IconComponent className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-[#0F172A] mb-2 leading-snug">
                        {step.title}
                      </h3>
                      <p className="text-xs text-[#475569] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. WHAT WE SOURCE */}
        {/* ========================================================================= */}
        <section className="py-14 sm:py-18 bg-white border-y border-[#E2E8F0]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div className="max-w-xl">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0052CC] block mb-2">
                  Chemical Scope & Capabilities
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  What We Source
                </h2>
                <p className="text-sm text-[#475569] mt-2">
                  From commercial bulk reagents to high-purity pharmaceutical compounds, our sourcing desk handles:
                </p>
              </div>
              <button
                onClick={scrollToForm}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0052CC] hover:text-[#0747A6] self-start md:self-auto cursor-pointer"
              >
                <span>Have a custom inquiry? Submit specifications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sourceCategories.map((cat, idx) => (
                <div
                  key={idx}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-6 hover:bg-white hover:border-[#CBD5E1] hover:shadow-2xs transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-white border border-[#CBD5E1] text-[#334155]">
                      {cat.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A] mb-2">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed mb-4">
                    {cat.description}
                  </p>
                  <div className="pt-3 border-t border-[#E2E8F0]">
                    <span className="text-[11px] font-semibold text-[#64748B] block mb-1">
                      Examples sourced:
                    </span>
                    <span className="text-xs font-medium text-[#0F172A]">
                      {cat.examples}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. WHY CHOOSE KEMKENDRA */}
        {/* ========================================================================= */}
        <section className="py-14 sm:py-18 bg-[#F7F9FC]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0052CC] block mb-2">
                Procurement Advantage
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Why Choose KemKendra
              </h2>
              <p className="text-sm text-[#475569] mt-2">
                We combine industry expertise with verified manufacturing relationships to protect your supply chain.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, idx) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-2xs hover:border-[#CBD5E1] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-[8px] bg-[#EFF6FF] text-[#0052CC] flex items-center justify-center mb-4">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-[#0F172A] mb-2 leading-snug">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. INTERACTIVE SOURCING REQUEST FORM */}
        {/* ========================================================================= */}
        <section ref={formRef} id="sourcing-form" className="py-14 sm:py-20 bg-white border-t border-[#E2E8F0]">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-6 sm:p-10 shadow-sm">
              <div className="max-w-2xl mx-auto text-center mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#0052CC] border border-[#BFDBFE] mb-3">
                  <Send className="w-3.5 h-3.5" />
                  <span>Sourcing Desk Intake</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  Request Sourcing Assistance
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] mt-2">
                  Provide your product specifications below. Our technical procurement desk will review your requirements and obtain quotations from suitable manufacturers.
                </p>
              </div>

              {status === "success" ? (
                <div className="bg-white border border-[#BBF7D0] rounded-xl p-8 text-center space-y-4 shadow-2xs">
                  <div className="w-12 h-12 bg-[#DCFCE7] text-[#16A34A] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-[#0F172A]">
                    Sourcing Request Received
                  </h3>
                  <p className="text-xs text-[#475569] max-w-md mx-auto leading-relaxed">
                    Thank you. Your chemical sourcing inquiry has been registered with our procurement desk. We will review availability and contact you with suitable quotation options.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setStatus("idle")}
                      className="px-4 py-2 bg-[#0052CC] text-white text-xs font-semibold rounded-[6px] hover:bg-[#0747A6] transition-colors"
                    >
                      Submit Another Request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {status === "error" && (
                    <div className="p-3.5 rounded-[6px] bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-2.5 text-xs text-[#B91C1C]">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Anti-spam honeypot */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="bot_trap_field"
                      tabIndex={-1}
                      autoComplete="off"
                      value={botTrap}
                      onChange={(e) => setBotTrap(e.target.value)}
                    />
                  </div>

                  {/* Section 1: Customer Contact Details */}
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] mb-3">
                      1. Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                          Your Full Name <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g., Rajesh Sharma"
                          className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                          Business Email <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="rajesh@pharma-enterprises.com"
                          className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                          Company / Organization Name
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g., Apex Formulations Pvt Ltd"
                          className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                          Phone / Mobile Number
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Chemical & Ingredient Specifications */}
                  <div className="pt-2">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] mb-3">
                      2. Chemical & Material Specifications
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                          Product / Chemical Name <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={chemicalName}
                          onChange={(e) => setChemicalName(e.target.value)}
                          placeholder="e.g., 4-Hydroxycarbazole / Monomethyl Adipate / Alpha-Tocopherol"
                          className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                          CAS Number <span className="text-[#64748B] font-normal">(if known)</span>
                        </label>
                        <input
                          type="text"
                          value={casNumber}
                          onChange={(e) => setCasNumber(e.target.value)}
                          placeholder="e.g., 52602-39-8"
                          className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                          Target Quantity & Unit <span className="text-[#64748B] font-normal">(e.g., 500 kg, 2 MT)</span>
                        </label>
                        <input
                          type="text"
                          value={targetQuantity}
                          onChange={(e) => setTargetQuantity(e.target.value)}
                          placeholder="e.g., 1,000 kg"
                          className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                          Required Grade / Purity
                        </label>
                        <input
                          type="text"
                          value={gradePurity}
                          onChange={(e) => setGradePurity(e.target.value)}
                          placeholder="e.g., Pharma Grade 99.0% / Technical / Food Grade"
                          className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                          Delivery Destination / State
                        </label>
                        <input
                          type="text"
                          value={deliveryLocation}
                          onChange={(e) => setDeliveryLocation(e.target.value)}
                          placeholder="e.g., Hyderabad, Telangana / Ankleshwar, Gujarat"
                          className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                          Detailed Specifications & Requirements <span className="text-[#DC2626]">*</span>
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Describe target specifications, required certificates (COA, MSDS, GMP), packaging preferences (25kg drums, IBC tanks), or target pricing expectations..."
                          className="w-full p-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-[#64748B]">
                      Protected by commercial NDA. Inquiries are handled strictly by KemKendra&apos;s verified sourcing desk.
                    </p>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] disabled:bg-[#94A3B8] text-white text-xs font-bold rounded-[6px] transition-colors shadow-xs cursor-pointer"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Transmitting Request...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Sourcing Request</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. FINAL CTA SECTION */}
        {/* ========================================================================= */}
        <section className="py-14 sm:py-16 bg-[#0F172A] text-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
              Need a Custom Raw Material or Hard-to-Find Chemical?
            </h2>
            <p className="text-sm text-[#94A3B8] max-w-xl mx-auto mb-8">
              Submit your specifications today. Our chemical procurement team will review your requirements and begin contacting manufacturers immediately.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={scrollToForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-sm font-bold rounded-[6px] transition-colors shadow-sm cursor-pointer"
              >
                <span>Request a Product</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] text-sm font-semibold rounded-[6px] transition-colors"
              >
                <span>Contact Sourcing Support</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
