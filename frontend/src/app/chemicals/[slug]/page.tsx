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
  CheckCircle2,
  ArrowRight,
  Send,
  FileText
} from "lucide-react";
import { serializeJsonLd } from "@/shared/utils/security";
import { ChemicalStructureVisual } from "@/shared/components/ChemicalStructureVisual";

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
    
    const title = casPart
      ? `${chemName} Suppliers | ${casPart} | KemKendra`
      : `${chemName} Suppliers | Chemical Sourcing | KemKendra`;

    const casSnippet = product.casNumber ? `CAS ${product.casNumber}, ` : "";
    const formulaSnippet = product.molecularFormula ? `formula ${product.molecularFormula}, ` : "";
    const description = `Source ${chemName} from verified chemical manufacturers on KemKendra. View ${casSnippet}${formulaSnippet}specifications, and request verified quotations.`;

    const canonicalCode = product.productCode || resolvedParams.slug;

    return {
      title,
      description,
      alternates: {
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
      description: "Explore industrial chemical suppliers, verified product specifications, and bulk quotation options on KemKendra.",
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
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans text-[#0F172A] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(chemicalJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      <Navbar />

      <main className="flex-1 pt-6 pb-24 sm:py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-[#64748B]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#0052CC] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/products" className="hover:text-[#0052CC] transition-colors">Chemical Catalog</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#0F172A] font-bold">{product.name}</span>
          </nav>

          {/* Chemical Hero Monograph Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-tactile-card space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Technical Identity & Key Overview */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-2.5 text-xs flex-wrap font-medium">
                  {product.category && (
                    <span className="text-[#0052CC] font-semibold">
                      {product.category.replace(/_/g, " ")}
                    </span>
                  )}
                  {product.casNumber && (
                    <>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-slate-600 font-mono">
                        CAS {product.casNumber}
                      </span>
                    </>
                  )}
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Identity Verified
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
                  {product.name}
                </h1>

                <p className="text-sm text-[#64748B] leading-relaxed max-w-2xl">
                  {product.description ||
                    `Pharmaceutical and industrial grade ${product.name}. Available for commercial B2B procurement across verified chemical synthesis plants on KemKendra.`}
                </p>

                {/* Primary Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <Link
                    href={`/products/${product.productCode || product.id}`}
                    className="h-10 px-5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 shadow-xs press-tactile"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>View Specifications &amp; Suppliers</span>
                  </Link>
                  <Link
                    href={`/rfq?productId=${product.id}&productName=${encodeURIComponent(product.name)}`}
                    className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-[#0F172A] text-xs sm:text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 press-tactile shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5 text-[#0052CC]" />
                    <span>Request Quotation</span>
                  </Link>
                </div>
              </div>

              {/* 2D Skeletal Molecular Structure Visualizer */}
              <div className="lg:col-span-4 h-56 rounded-xl border border-slate-200/80 bg-[#F8F9FA] p-3 flex items-center justify-center">
                <ChemicalStructureVisual
                  chemicalName={product.name}
                  casNumber={product.casNumber}
                  category={product.category}
                  className="w-full h-full"
                />
              </div>

            </div>

            {/* Technical Quick Facts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-slate-200/70 space-y-1">
                <p className="text-xs font-semibold text-[#64748B]">CAS Registry</p>
                <p className="text-sm sm:text-base font-bold font-mono text-[#0F172A]">
                  {product.casNumber || "N/A"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-slate-200/70 space-y-1">
                <p className="text-xs font-semibold text-[#64748B]">Molecular Formula</p>
                <p className="text-sm sm:text-base font-bold font-mono text-[#0F172A]">
                  {product.molecularFormula || "—"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-slate-200/70 space-y-1">
                <p className="text-xs font-semibold text-[#64748B]">Catalog Code</p>
                <p className="text-sm sm:text-base font-bold font-mono text-[#0F172A]">
                  {product.productCode || "MP-CATALOG"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-slate-200/70 space-y-1">
                <p className="text-xs font-semibold text-[#64748B]">Verified Suppliers</p>
                <p className="text-sm sm:text-base font-bold text-[#0052CC]">
                  {activeOfferings.length} Audited {activeOfferings.length === 1 ? "Source" : "Sources"}
                </p>
              </div>
            </div>
          </div>

          {/* Supplier Offerings Overview */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-tactile-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Available Commercial Batches</h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Verified suppliers with active analytical testing releases and compliance certificates.
                </p>
              </div>
              <Link
                href={`/products/${product.productCode || product.id}`}
                className="text-xs font-semibold text-[#0052CC] hover:text-[#0747A6] inline-flex items-center gap-1 group"
              >
                <span>Compare supplier matrices</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>

            {activeOfferings.length === 0 ? (
              <div className="bg-[#F8F9FA] border border-slate-200/80 rounded-xl p-8 text-center space-y-3">
                <p className="text-sm font-semibold text-[#0F172A]">
                  No active public inventory listed for {product.name} at this moment.
                </p>
                <p className="text-xs text-[#64748B] max-w-md mx-auto">
                  Submit a customized inquiry to our Sourcing desk. We coordinate directly with audited synthesizers capable of custom production.
                </p>
                <div className="pt-2">
                  <Link
                    href={`/sourcing/request?productName=${encodeURIComponent(product.name)}&casNumber=${encodeURIComponent(product.casNumber || "")}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0052CC] text-white text-xs font-semibold hover:bg-[#0747A6] transition-colors shadow-xs"
                  >
                    <span>Request Custom Sourcing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                {/* Mobile Offering Card Stack (< 768px) */}
                <div className="md:hidden space-y-3">
                  {activeOfferings.map((offering) => (
                    <div
                      key={offering.id}
                      className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-sm text-[#0F172A]">
                            <Building2 className="w-4 h-4 text-[#64748B] shrink-0" />
                            <span>{offering.supplierName || "Audited Manufacturer"}</span>
                            {offering.supplierVerified && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-[#0F172A]">
                              Purity: {offering.purity ? `${offering.purity}%` : "—"}
                            </span>
                            {offering.grade && (
                              <span className="text-xs text-[#64748B]">({offering.grade})</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {offering.coaAvailable && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              COA
                            </span>
                          )}
                          {offering.msdsAvailable && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              MSDS
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 bg-[#F8F9FA] -mx-4 px-4">
                        <div>
                          <span className="text-[11px] text-[#64748B] block">Min Order (MOQ)</span>
                          <span className="font-semibold text-[#0F172A]">{offering.moqKg ? `${offering.moqKg} kg` : "Flexible"}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#64748B] block">Lead Time</span>
                          <span className="font-semibold text-[#0F172A]">{offering.leadTimeDays ? `${offering.leadTimeDays} days` : "In Stock"}</span>
                        </div>
                      </div>

                      <Link
                        href={`/products/${product.productCode || product.id}`}
                        className="w-full h-10 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <span>Request Official Quotation</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Desktop Comparison Table (>= 768px) */}
                <div className="hidden md:block overflow-x-auto border border-slate-200/80 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8F9FA] text-xs font-semibold text-[#64748B] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Supplier</th>
                        <th className="py-3 px-4">Purity / Grade</th>
                        <th className="py-3 px-4">Min Order (MOQ)</th>
                        <th className="py-3 px-4">Lead Time</th>
                        <th className="py-3 px-4">Documents</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeOfferings.map((offering) => (
                        <tr key={offering.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                          <td className="py-3 px-4 font-semibold text-[#0F172A]">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                              <span>{offering.supplierName || "Audited Manufacturer"}</span>
                              {offering.supplierVerified && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-[#0F172A]">{offering.purity ? `${offering.purity}%` : "—"}</span>
                            {offering.grade && <span className="text-[#64748B] ml-1.5 font-medium">({offering.grade})</span>}
                          </td>
                          <td className="py-3 px-4 font-medium text-[#0F172A]">
                            {offering.moqKg ? `${offering.moqKg} kg` : "Flexible"}
                          </td>
                          <td className="py-3 px-4 text-[#64748B]">
                            {offering.leadTimeDays ? `${offering.leadTimeDays} days` : "In Stock"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              {offering.coaAvailable && (
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">COA</span>
                              )}
                              {offering.msdsAvailable && (
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">MSDS</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              href={`/products/${product.productCode || product.id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0052CC] hover:text-[#0747A6]"
                            >
                              <span>Quote</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Institutional Compliance Assurance Block */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-2 shadow-tactile-card">
            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0052CC]" />
              <span>Verified Institutional Procurement Standards</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Every chemical supplier listed on KemKendra undergoes factual legal verification, corporate compliance checks, and cGMP certification review. Analytical certificates of analysis (CoA) are reconciled prior to delivery sign-off.
            </p>
          </div>

        </div>

        {/* Mobile Sticky Action Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 flex items-center justify-between gap-3 shadow-tactile-modal">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block truncate">
              {product.name}
            </span>
            <span className="text-xs font-bold text-[#0F172A] block truncate">
              {product.casNumber ? `CAS ${product.casNumber}` : "Direct Factory Supply"}
            </span>
          </div>
          <Link
            href={`/products/${product.productCode || product.id}`}
            className="h-10 px-4 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Request Quote</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}