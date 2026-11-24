import { Metadata } from "next";
import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
import { ShieldCheck, Factory, FileCheck2, Globe2, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { serializeJsonLd } from "@/shared/utils/security";

export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kemkendra.online";

export const metadata: Metadata = {
  title: "About KemKendra | Verified B2B Chemical Marketplace & Supply Chain",
  description: "Learn about KemKendra's verified B2B chemical trading platform, connecting pharmaceutical manufacturers, laboratories, and chemical buyers with audited suppliers.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About KemKendra | Verified B2B Chemical Marketplace",
    description: "Learn about KemKendra's verified B2B chemical trading platform, connecting pharmaceutical manufacturers, laboratories, and chemical buyers with audited suppliers.",
    url: `${SITE_URL}/about`,
    siteName: "KemKendra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About KemKendra | Verified B2B Chemical Marketplace",
    description: "Learn about KemKendra's verified B2B chemical trading platform, connecting pharmaceutical manufacturers, laboratories, and chemical buyers with audited suppliers.",
  },
};

export default function AboutPage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KemKendra",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description: "B2B chemical trading marketplace connecting verified chemical manufacturers with enterprise procurement teams.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-7676447077",
      contactType: "customer service",
      email: "kemkendra1@gmail.com",
    },
  };

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
        name: "About Us",
        item: `${SITE_URL}/about`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans text-slate-900 antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#0052CC] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">About Us</span>
          </nav>

          {/* Hero Section */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 shadow-tactile-card space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0052CC] border border-blue-200/80 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#0052CC]" /> B2B Chemical Commerce Redefined
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#091E42] tracking-tight max-w-3xl leading-tight">
              Bridging Verified Chemical Manufacturers & Enterprise Buyers
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              KemKendra is India&apos;s dedicated B2B chemical trading marketplace engineered for transparent discovery, authenticated documentation, and enterprise chemical procurement. Headquartered in Bengaluru, Karnataka, we empower pharmaceutical laboratories, synthetic chemists, and industrial procurement managers to source verified compounds with confidence.
            </p>
          </div>

          {/* Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-tactile-card space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/80 text-[#0052CC] flex items-center justify-center shadow-2xs">
                <Factory className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Verified Manufacturers</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every supplier on KemKendra undergoes onboarding verification to confirm active manufacturing capabilities, quality licenses, and compliance standards.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-tactile-card space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shadow-2xs">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Documented Quality</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Access genuine Certificates of Analysis (COA), Material Safety Data Sheets (MSDS), and batch-level purity specifications before submitting formal inquiries.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-tactile-card space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs">
                <Globe2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Direct RFQ Workflow</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Eliminate unnecessary middlemen. Request customized commercial quotes, negotiate MOQs, and establish direct synthetic supplier relationships.
              </p>
            </div>
          </div>

          {/* Operations & Standards */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-tactile-card space-y-6">
            <h2 className="text-2xl font-bold text-[#091E42]">Chemical Sourcing Standards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Standardized CAS Nomenclature</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Strict database indexing by IUPAC nomenclature, CAS registry numbers, and chemical synonyms.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Multi-Category Coverage</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Extensive catalog spanning APIs, Pharma Intermediates, Solvents, Excipients, and Specialty Chemicals.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Transparent Sourcing Requirements</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Clear Minimum Order Quantities (MOQ), packaging options, and realistic synthetic lead times.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Strict Data Privacy</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Commercial negotiation and quotation bids are kept confidential between transacting parties.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Footer Block */}
          <div className="bg-[#091E42] rounded-2xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-tactile-card border border-slate-800">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight">Ready to explore chemical sourcing?</h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Browse through verified catalog products or connect directly with our procurement helpdesk in Bengaluru.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/products"
                className="px-5 py-2.5 bg-white text-[#091E42] hover:bg-slate-100 text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Browse Catalog
              </Link>
              <Link
                href="/contact"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Contact Us
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
