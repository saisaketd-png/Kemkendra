import { Metadata } from "next";
import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
import { fetchProductDetail, fetchProductSuppliers } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  FlaskConical,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  Building2,
  Atom,
  CheckCircle2,
  Layers,
  ArrowRight,
  Send
} from "lucide-react";
import { serializeJsonLd } from "@/shared/utils/security";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kemkendra.online";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const product = await fetchProductDetail(resolvedParams.slug);
    const chemName = product.name;
    const casPart = product.casNumber ? `CAS ${product.casNumber}` : null;
    
    // Title format: [Chemical Name] Suppliers | CAS [CAS Number] | KemKendra
    const title = casPart
      ? `${chemName} Suppliers | ${casPart} | KemKendra`
      : `${chemName} Suppliers | Chemical Sourcing | KemKendra`;

    // Meta description format:
    // Explore [Chemical Name] suppliers on KemKendra. View CAS number, molecular formula, specifications, approved synonyms, and request bulk quotations.
    const casSnippet = product.casNumber ? `CAS ${product.casNumber}, ` : "";
    const formulaSnippet = product.molecularFormula ? `formula ${product.molecularFormula}, ` : "";
    const description = `Explore ${chemName} suppliers on KemKendra. View ${casSnippet}${formulaSnippet}specifications, approved synonyms, and request bulk quotations.`;

    const canonicalCode = product.productCode || resolvedParams.slug;

    return {
      title,
      description,
      alternates: {
        // Canonical points to the primary product catalog page to avoid duplicate indexing
        canonical: `${SITE_URL}/products/${canonicalCode}`,
      },
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/chemicals/${resolvedParams.slug}`,
        siteName: "KemKendra",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    return {
      title: "Chemical Sourcing Directory | Chemical Suppliers | KemKendra",
      description: "Explore industrial chemical suppliers, verified product monographs, and bulk quotation options on KemKendra.",
      robots: { index: false, follow: true },
    };
  }
}

export default async function ChemicalLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  let product: any;
  let offerings: any[] = [];

  try {
    product = await fetchProductDetail(resolvedParams.slug);
    offerings = await fetchProductSuppliers(product.productCode || product.id);
  } catch {
    notFound();
  }

  const activeOfferings = Array.isArray(offerings)
    ? offerings.filter((o) => o.availabilityStatus === "AVAILABLE")
    : [];

  const chemicalJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `Industrial chemical ${product.name} with CAS ${product.casNumber || "N/A"}.`,
    category: product.category,
    sku: product.productCode || String(product.id),
    offers: {
      "@type": "AggregateOffer",
      offerCount: activeOfferings.length,
      priceCurrency: "INR",
      lowPrice: activeOfferings.length > 0
        ? Math.min(...activeOfferings.map((o) => Number(o.price) || 0).filter((p) => p > 0)) || undefined
        : undefined,
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
        name: "Chemicals",
        item: `${SITE_URL}/chemicals`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${SITE_URL}/chemicals/${resolvedParams.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] font-sans text-[#0F172A] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(chemicalJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
            <Link href="/" className="hover:text-[#155EEF]">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <Link href="/chemicals" className="hover:text-[#155EEF]">Chemicals</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="text-[#0F172A] font-extrabold">{product.name}</span>
          </nav>

          {/* Chemical Hero Monograph */}
          <div className="bg-white border border-[#DCE3EC] rounded-3xl p-8 sm:p-10 shadow-2xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EFF4FF] text-[#155EEF] border border-[#BFDBFE] flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5" /> Chemical Monograph
                  </span>
                  {product.category && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F8FAFC] text-[#475467] border border-[#E2E8F0]">
                      {product.category}
                    </span>
                  )}
                  {product.casNumber && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]">
                      CAS {product.casNumber}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">
                  {product.name}
                </h1>

                <p className="text-sm sm:text-base text-[#475467] leading-relaxed">
                  {product.description ||
                    `Industrial and commercial grade ${product.name}. Available for B2B procurement across verified chemical manufacturers on KemKendra.`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <Link
                  href={`/products/${product.productCode || product.id}`}
                  className="px-6 py-3 rounded-xl bg-[#155EEF] hover:bg-[#104EC6] text-white text-xs font-bold transition-colors shadow-2xs text-center flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  View Full Product & Quotes
                </Link>
                <Link
                  href={`/contact?subject=Chemical%20Inquiry%20${encodeURIComponent(product.name)}&cas=${encodeURIComponent(product.casNumber || "")}`}
                  className="px-6 py-3 rounded-xl bg-white border border-[#DCE3EC] hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-bold transition-colors text-center flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-[#155EEF]" />
                  Direct Procurement Inquiry
                </Link>
              </div>
            </div>

            {/* Technical Quick Facts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#E2E8F0]">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <p className="text-[11px] font-bold text-[#64748B] uppercase">CAS Registry</p>
                <p className="text-base font-extrabold font-mono text-[#0F172A] mt-1">
                  {product.casNumber || "N/A"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <p className="text-[11px] font-bold text-[#64748B] uppercase">Molecular Formula</p>
                <p className="text-base font-extrabold font-mono text-[#0F172A] mt-1">
                  {product.molecularFormula || "—"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <p className="text-[11px] font-bold text-[#64748B] uppercase">Catalog Code</p>
                <p className="text-base font-extrabold font-mono text-[#0F172A] mt-1">
                  {product.productCode || "MP-UNKNOWN"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <p className="text-[11px] font-bold text-[#64748B] uppercase">Verified Suppliers</p>
                <p className="text-base font-extrabold text-[#155EEF] mt-1">
                  {activeOfferings.length} Audited Source{activeOfferings.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>

          {/* Supplier Offerings Overview */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">Available Commercial Offerings</h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Commercial supplies verified through factory documentation, purity analysis, and compliance checks.
                </p>
              </div>
              <Link
                href={`/products/${product.productCode || product.id}`}
                className="text-xs font-bold text-[#155EEF] hover:underline flex items-center gap-1"
              >
                Compare all supplier terms <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeOfferings.length === 0 ? (
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-8 text-center space-y-3">
                <p className="text-sm font-semibold text-[#475467]">
                  No active commercial offerings listed publicly for {product.name} right now.
                </p>
                <p className="text-xs text-[#64748B] max-w-md mx-auto">
                  Submit a customized inquiry to our chemical procurement desk. We match buyers with verified manufacturers capable of custom synthesis or contract supply.
                </p>
                <div className="pt-2">
                  <Link
                    href={`/contact?subject=Custom%20Sourcing%20${encodeURIComponent(product.name)}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#155EEF] text-white text-xs font-bold hover:bg-[#104EC6] transition-colors"
                  >
                    Request Custom Sourcing
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                <table className="w-full text-left text-xs text-[#475467]">
                  <thead className="bg-[#F8FAFC] text-[11px] font-extrabold uppercase text-[#64748B] border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-3 px-4">Supplier</th>
                      <th className="py-3 px-4">Purity / Grade</th>
                      <th className="py-3 px-4">Min Order (MOQ)</th>
                      <th className="py-3 px-4">Lead Time</th>
                      <th className="py-3 px-4">Docs</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {activeOfferings.map((offering) => (
                      <tr key={offering.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#0F172A]">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                            <span>{offering.supplierName || "Audited Manufacturer"}</span>
                            {offering.supplierVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#0F172A]">{offering.purity ? `${offering.purity}%` : "—"}</span>
                          {offering.grade && <span className="text-[#64748B] ml-1.5 font-mono">({offering.grade})</span>}
                        </td>
                        <td className="py-3 px-4 font-medium text-[#0F172A]">
                          {offering.moqKg ? `${offering.moqKg} kg` : "Flexible"}
                        </td>
                        <td className="py-3 px-4 text-[#475467]">
                          {offering.leadTimeDays ? `${offering.leadTimeDays} days` : "In Stock"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {offering.coaAvailable && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">COA</span>
                            )}
                            {offering.msdsAvailable && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">MSDS</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/products/${product.productCode || product.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#155EEF] hover:underline"
                          >
                            Quote &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Safe Chemical Sourcing Information */}
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-6 sm:p-8 space-y-3">
            <h3 className="text-base font-bold text-[#1E40AF] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#155EEF]" /> Factual Procurement Protocol
            </h3>
            <p className="text-xs sm:text-sm text-[#1E3A8A] leading-relaxed">
              Every chemical supplier listed on KemKendra undergoes factual corporate and legal verification, including GSTIN validation, corporate registration, and manufacturing facility records. Analytical test reports (COA) are verified prior to high-volume commercial dispatches.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
