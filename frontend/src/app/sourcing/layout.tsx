import { Metadata } from "next";
import { serializeJsonLd } from "@/shared/utils/security";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kemkendra.online";

export const metadata: Metadata = {
  title: "Custom Chemical Sourcing Desk | Bulk API, Intermediates & Solvents | KemKendra",
  description:
    "Source unlisted bulk chemicals, custom Active Pharmaceutical Ingredients (APIs), key starting materials (KSM), and hard-to-find industrial solvents directly from pre-audited chemical synthesis plants in India. Get verified COA, transparent factory pricing, and committed dispatch in 24 hours.",
  keywords: [
    "custom chemical sourcing",
    "bulk chemical procurement desk",
    "source APIs India",
    "pharmaceutical intermediates supplier",
    "custom organic synthesis",
    "hard to find chemicals",
    "contract manufacturing CDMO",
    "CAS chemical sourcing",
    "high purity solvents wholesale",
    "compendial grade APIs",
    "chemical supplier Gujarat",
    "chemical manufacturer Hyderabad",
    "bulk chemical quote RFQ",
  ],
  alternates: {
    canonical: `${SITE_URL}/sourcing`,
  },
  openGraph: {
    title: "Custom Chemical Sourcing Desk | Direct Factory Allocation | KemKendra",
    description:
      "Can't find the chemical compound or API you need? Let KemKendra's procurement desk source custom synthesis compounds, APIs, and industrial solvents from verified manufacturers with lot-specific COA.",
    url: `${SITE_URL}/sourcing`,
    siteName: "KemKendra",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Chemical Sourcing Desk | Direct Factory Allocation | KemKendra",
    description:
      "Direct factory allocation for custom synthesis chemicals, APIs, and specialty solvents from pre-audited synthesis plants.",
  },
};

export default function SourcingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sourcingServiceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "KemKendra Custom Chemical Sourcing Desk",
    provider: {
      "@type": "Organization",
      name: "KemKendra",
      url: SITE_URL,
      logo: `${SITE_URL}/kemkendra-icon.png`,
    },
    serviceType: "Chemical Procurement, Custom Synthesis & Supplier Verification",
    areaServed: ["IN", "US", "EU", "JP"],
    description:
      "Assisted institutional procurement for active pharmaceutical ingredients, fine chemical intermediates, and industrial solvents from pre-audited primary synthesis plants.",
  };

  const sourcingFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does KemKendra source unlisted or custom chemical compounds?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "When you submit a sourcing inquiry with target purity, CAS number, volume, and pharmacopeial grade, our chemical engineering desk queries our pre-audited network of 120+ primary synthesizers across Gujarat, Maharashtra, and Telangana to match your specifications without broker markups.",
        },
      },
      {
        "@type": "Question",
        name: "What documentation is provided before placing a commercial order?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Before contract execution, buyers receive manufacturer pre-qualification credentials, lot-specific HPLC/GC Certificates of Analysis (COA), 16-section GHS Safety Data Sheets (SDS), technical data sheets (TDS), and regulatory filings (DMF open part or CEP) where applicable.",
        },
      },
      {
        "@type": "Question",
        name: "What is the turnaround time for custom chemical sourcing quotes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Standard catalog and known intermediate inquiries receive initial supplier allocations and pricing matrices within 24 business hours. Complex custom multi-step synthesis requests receive comprehensive technical feasibility proposals within 48 to 72 hours.",
        },
      },
      {
        "@type": "Question",
        name: "How are payments and delivery risks protected?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "KemKendra operates an institutional escrow model where buyer funds are held securely until pre-shipment quality clearance and destination delivery inspection are confirmed against the agreed Certificate of Analysis.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(sourcingServiceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(sourcingFaqJsonLd) }}
      />
      {children}
    </>
  );
}
