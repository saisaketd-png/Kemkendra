import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
import { CategoryGrid } from "@/features/home/components/CategoryGrid";
import { serializeJsonLd } from "@/shared/utils/security";
import {
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  Microscope,
  FileText,
  BadgeCheck,
} from "lucide-react";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kemkendra.online";

export const metadata: Metadata = {
  title: "Chemical Categories & Classifications | KemKendra",
  description:
    "Browse pharmaceutical APIs, intermediates, specialty chemicals, and solvents categorized for global enterprise procurement.",
  alternates: {
    canonical: `${SITE_URL}/categories`,
  },
  openGraph: {
    title: "Chemical Categories & Classifications | KemKendra",
    description:
      "Browse pharmaceutical APIs, intermediates, specialty chemicals, and solvents categorized for global enterprise procurement.",
    url: `${SITE_URL}/categories`,
    siteName: "KemKendra",
    type: "website",
  },
};

const COMPENDIAL_STANDARDS = [
  {
    code: "USP-NF",
    authority: "United States Pharmacopeial Convention",
    jurisdiction: "United States (US FDA)",
    description:
      "Statutory standards for active pharmaceutical substances, biologics, and excipients commercialized in the United States.",
    filing: "Type II Drug Master File (DMF) & Full Lot CoA",
    accent: "border-blue-200 hover:border-blue-400 bg-blue-50/30",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    code: "Ph. Eur. (EP)",
    authority: "European Directorate for Quality of Medicines (EDQM)",
    jurisdiction: "European Union (EMA)",
    description:
      "Harmonized quality compendium governing chemical substances across 39 member European states with strict impurity thresholds.",
    filing: "Certificate of Suitability (CEP) & ASMF",
    accent: "border-emerald-200 hover:border-emerald-400 bg-emerald-50/30",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    code: "IP",
    authority: "Indian Pharmacopoeia Commission (IPC)",
    jurisdiction: "India (CDSCO)",
    description:
      "Statutory compendial monographs establishing legal purity and testing protocols for active generics and bulk drugs.",
    filing: "Form 20B/21B & Written Confirmation (WC)",
    accent: "border-amber-200 hover:border-amber-400 bg-amber-50/30",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    code: "BP",
    authority: "Medicines and Healthcare products Regulatory Agency (MHRA)",
    jurisdiction: "United Kingdom & Commonwealth",
    description:
      "Authoritative collection of standards for pharmaceutical active raw materials widely accepted across international jurisdictions.",
    filing: "Active Substance Master File & cGMP Release",
    accent: "border-sky-200 hover:border-sky-400 bg-sky-50/30",
    badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
  },
];

const QUALITY_STAGES = [
  {
    title: "Validated HPLC Assay",
    description:
      "Reverse-phase chromatographic purity confirmation against certified primary reference standards with verified retention times.",
    icon: Microscope,
    iconColor: "text-[#0052CC] bg-blue-50",
  },
  {
    title: "Residual Solvents (ICH Q3C)",
    description:
      "Headspace gas chromatography screening for Class 1 carcinogens, Class 2 hazardous solvents, and Class 3 processing volatiles.",
    icon: FileCheck2,
    iconColor: "text-emerald-600 bg-emerald-50",
  },
  {
    title: "Elemental Impurities (ICH Q3D)",
    description:
      "Inductively Coupled Plasma Mass Spectrometry (ICP-MS) screening for heavy metals down to parts-per-billion (ppb) limits.",
    icon: ShieldCheck,
    iconColor: "text-slate-700 bg-slate-100",
  },
  {
    title: "Batch Quality & CoA Traceability",
    description:
      "Complete manufacturing origin documentation, batch number, production dates, retest windows, and authorized QA signatures.",
    icon: BadgeCheck,
    iconColor: "text-amber-600 bg-amber-50",
  },
];

export default function CategoriesPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: `${SITE_URL}/categories`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans text-[#0F172A] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <Navbar />

      <main className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full space-y-12">
        {/* Breadcrumb Navigation */}
        <nav
          className="flex items-center gap-2 text-xs font-semibold text-[#64748B]"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-[#0052CC] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-[#0F172A] font-bold" aria-current="page">
            Chemical Categories
          </span>
        </nav>

        {/* Page Title & Context */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
            Chemical Classification Directory
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] max-w-3xl leading-relaxed">
            Source verified pharmaceutical actives, intermediates, solvents, and specialty compounds categorized by technical application and pharmacopeial standards.
          </p>
        </div>

        {/* 1. Category Grid (With rich hover animations and modern count badges) */}
        <CategoryGrid />

        {/* 2. Global Compendial Standards Overview */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-10 shadow-tactile-card space-y-8">
          <div className="max-w-3xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
              Compendial Regulatory Standards
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Every chemical category listed on KemKendra is verified against international pharmacopeial standards to ensure statutory regulatory approval and batch consistency.
            </p>
          </div>

          {/* Clean 4-Grid Compendia Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {COMPENDIAL_STANDARDS.map((std) => (
              <div
                key={std.code}
                className={`p-6 rounded-xl border ${std.accent} transition-transform duration-200 motion-safe:hover:-translate-y-1 motion-reduce:transform-none hover:shadow-md flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#0F172A]">{std.code}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${std.badgeBg}`}
                    >
                      {std.jurisdiction}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    {std.authority}
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {std.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 text-xs font-medium text-[#0F172A] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{std.filing}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Analytical Verification & Testing Protocols */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-10 shadow-tactile-card space-y-8">
          <div className="max-w-3xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
              Batch Qualification &amp; Testing Protocols
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Prior to delivery release, supplier lots must pass four tiers of analytical and compendial verification documented on the official Certificate of Analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUALITY_STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.title}
                  className="p-5 rounded-xl bg-[#F8F9FA] border border-slate-200/80 hover:border-slate-300 transition-colors duration-200 space-y-3"
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${stage.iconColor} flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A]">{stage.title}</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {stage.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Sourcing & Custom Batch Support */}
        <div className="bg-[#091E42] text-white rounded-2xl p-8 sm:p-10 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8 relative shadow-xl">
          <div className="space-y-3 max-w-2xl relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Need Custom Chemical Synthesis or Unlisted Sourcing?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              If your target raw material or active chemical is not listed in open catalog inventory, our Sourcing desk coordinates directly with audited manufacturing facilities for custom synthesis, pilot batches, and private quotations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
            <Link
              href="/sourcing/request"
              className="h-11 px-6 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors duration-150 inline-flex items-center gap-2 shadow-xs press-tactile"
            >
              <span>Submit Sourcing Request</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sourcing"
              className="h-11 px-5 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors duration-150 inline-flex items-center gap-2 press-tactile"
            >
              <span>Learn About Sourcing</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}