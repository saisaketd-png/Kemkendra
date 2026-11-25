import type { Metadata } from "next";
import { getProducts } from "@/features/products/api/getProducts";
import { Product } from "@/features/products/types/product";
import { Navbar } from "@/features/home/components/Navbar";
import { SearchHeader } from "@/features/home/components/SearchHeader";
import { FeaturedCatalogPreview } from "@/features/home/components/FeaturedCatalogPreview";
import { HomeSourcingSection } from "@/features/home/components/HomeSourcingSection";
import { CategoryShortcuts } from "@/features/home/components/CategoryShortcuts";
import { BrandStatement } from "@/features/home/components/BrandStatement";
import { BuyerSupplierSplit } from "@/features/home/components/BuyerSupplierSplit";
import { TrustSection } from "@/features/home/components/TrustSection";
import { ResourcesSection } from "@/features/home/components/ResourcesSection";
import { HomeSeoDirectory } from "@/features/home/components/HomeSeoDirectory";
import { EnterpriseCTA } from "@/features/home/components/EnterpriseCTA";
import { Footer } from "@/features/home/components/Footer";
import { serializeJsonLd } from "@/shared/utils/security";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "B2B Chemical Marketplace India | Buy Bulk Chemicals, APIs & Solvents | KemKendra",
  description:
    "India's premier B2B chemical marketplace. Buy bulk industrial chemicals, compendial APIs, pharmaceutical intermediates, and high-purity solvents directly from ISO & cGMP verified manufacturers. Request instant RFQs with verified COA.",
  keywords: [
    "B2B chemical marketplace",
    "chemical suppliers India",
    "bulk chemical procurement",
    "buy chemicals online",
    "API manufacturers India",
    "pharmaceutical intermediates",
    "industrial solvents wholesale",
    "custom chemical synthesis",
    "CAS chemical search",
    "chemical RFQ",
    "chemical exporters Gujarat",
    "chemical manufacturers Maharashtra",
    "Certificate of Analysis chemical",
  ],
  alternates: {
    canonical: "https://kemkendra.online/",
  },
  openGraph: {
    title: "B2B Chemical Marketplace India | Buy Bulk Chemicals, APIs & Solvents | KemKendra",
    description:
      "India's premier B2B chemical marketplace. Source compendial APIs, pharmaceutical intermediates, and industrial solvents from verified manufacturers. Instant RFQs, escrow protection & batch COA.",
    url: "https://kemkendra.online/",
    siteName: "KemKendra",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "B2B Chemical Marketplace India | Buy Bulk Chemicals, APIs & Solvents | KemKendra",
    description:
      "Source bulk chemicals, APIs, and industrial solvents from ISO & cGMP verified manufacturers with batch COA and escrow protection.",
  },
};

export default async function HomePage() {
  let products: Product[] = [];

  try {
    const pageData = await getProducts();
    if (pageData && Array.isArray(pageData.content)) {
      products = pageData.content;
    }
  } catch (error) {
    console.warn("Using fallback demo products in buyer-first table view:", error);
  }

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KemKendra",
    url: "https://kemkendra.online",
    logo: "https://kemkendra.online/kemkendra-icon.png",
    description:
      "Enterprise B2B digital exchange for compendial APIs, pharmaceutical intermediates, laboratory solvents, and specialty chemicals.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91 7676447077",
      contactType: "customer service",
      email: "kemkendra1@gmail.com",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "KemKendra",
    url: "https://kemkendra.online",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://kemkendra.online/products?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does KemKendra verify chemical suppliers and manufacturers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Every supplier on KemKendra undergoes a rigorous 4-stage technical verification: commercial registration (GSTIN / IEC), manufacturing site audits (ISO 9001:2015, WHO-cGMP, FDA inspection status), batch Certificate of Analysis (COA) history, and financial standing. We connect buyers directly with primary synthesizers, eliminating unverified intermediary brokers.",
        },
      },
      {
        "@type": "Question",
        name: "What pharmacopeial and purity grades are available for bulk procurement?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "KemKendra supports compendial grades including Indian Pharmacopoeia (IP), British Pharmacopoeia (BP), United States Pharmacopeia (USP), European Pharmacopoeia (Ph. Eur. / EP), and Japanese Pharmacopoeia (JP). For industrial and laboratory use, we offer ACS Reagent Grade, HPLC Grade, Electronic Grade (EG), and Technical Grade specifications.",
        },
      },
      {
        "@type": "Question",
        name: "Can I request custom chemical synthesis or contract manufacturing (CDMO)?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Through our dedicated KemKendra Sourcing Desk, buyers can submit chemical structures, CAS registry numbers, required purity thresholds, and batch volumes for custom synthesis campaigns, pilot scaling, or commercial manufacturing under strict Non-Disclosure Agreements (NDAs).",
        },
      },
      {
        "@type": "Question",
        name: "What technical documentation is provided with chemical shipments?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Every shipment comes standard with a lot-specific Certificate of Analysis (COA) showing HPLC/GC purity assays and residual solvents, a 16-section GHS Safety Data Sheet (SDS/MSDS), and Technical Data Sheets (TDS). For pharmaceutical actives, Drug Master File (DMF) open parts and CEP documentation are available upon request.",
        },
      },
      {
        "@type": "Question",
        name: "What bulk packaging and hazardous materials (Hazmat) options are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Chemicals are dispatched in UN-certified packaging tailored to material properties: ISO Tank Containers (20,000L–26,000L) for bulk solvents, Intermediate Bulk Containers (IBC Totes 1,000L), 200L Tight-Head Steel and HDPE Drums, 25kg/50kg UN-rated fiber drums with poly liners, and glass carboys for high-purity acids.",
        },
      },
    ],
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "B2B Chemical Marketplace & Custom Sourcing Desk",
    provider: {
      "@type": "Organization",
      name: "KemKendra",
      url: "https://kemkendra.online",
    },
    serviceType: "Chemical Procurement & Contract Synthesis",
    areaServed: "IN",
    description:
      "Enterprise digital marketplace and custom sourcing desk for compendial APIs, pharmaceutical intermediates, and industrial solvents with verified Certificates of Analysis.",
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#F8F9FA] font-sans text-[#0F172A] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(webSiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceJsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        {/* 1. HERO: Full-Bleed Editorial Hero with Edge-to-Edge Chemical Facility Visual */}
        <SearchHeader />

        {/* 2. CHEMICAL CATEGORIES: High-End Horizontal Directory */}
        <CategoryShortcuts />

        {/* 3. MARKETPLACE CATALOG DISCOVERY: Products in Demand */}
        <FeaturedCatalogPreview products={products} />

        {/* 3.5. CUSTOM CHEMICAL SOURCING DESK: Fast Intake & Reference Tracking */}
        <HomeSourcingSection />

        {/* 4. PROCUREMENT PIPELINE: 6-Stage Engineering Process Diagram + Large Editorial Statement */}
        <BrandStatement />

        {/* 5. BUYER & SUPPLIER SPLIT: 50/50 Editorial Value Proposition */}
        <BuyerSupplierSplit />

        {/* 6. GOVERNANCE & TRUST: Structured Verification & Auditability */}
        <TrustSection />

        {/* 7. TECHNICAL MONOGRAPHS & REGULATORY COMPLIANCE */}
        <ResourcesSection />

        {/* 7.5. SEO KNOWLEDGE HUB, INDUSTRIAL HUBS & BUYER FAQS */}
        <HomeSeoDirectory />

        {/* 8. COMPACT COMMERCIAL CTA */}
        <EnterpriseCTA />
      </main>
      <Footer />
    </div>
  );
}