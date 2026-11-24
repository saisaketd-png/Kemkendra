import { Metadata } from "next";
import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
import {
  ShieldCheck,
  FlaskConical,
  ChevronRight,
  CheckCircle2,
  Atom,
  Layers,
  FileCheck,
  Info,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { fetchProductDetail, resolveClientImageUrl } from "@/lib/api";
import { notFound, permanentRedirect } from "next/navigation";
import { Product } from "@/features/products/types/product";
import { ProductDetailHeroImage } from "@/features/products/components/ProductDetailHeroImage";
import SupplierComparison from "@/features/products/components/SupplierComparison";
import { ProductDocuments } from "@/features/products/components/ProductDocuments";
import { serializeJsonLd } from "@/shared/utils/security";
import { getCategoryAbbreviation, getCategoryDisplayName } from "@/features/categories/utils/categoryUtils";
import { CANONICAL_CATEGORIES } from "@/features/categories/api/categoryApi";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kemkendra.online";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const product: Product = await fetchProductDetail(resolvedParams.id);
    const chemName = product.name;
    const casPart = product.casNumber ? `CAS ${product.casNumber}` : null;
    
    // Title format: [Chemical Name] | CAS [CAS Number] | Chemical Suppliers | KemKendra
    // If title exceeds ~60 chars, shorten to: [Chemical Name] | CAS [CAS Number] | KemKendra
    let title: string;
    if (casPart) {
      const fullTitle = `${chemName} | ${casPart} | Chemical Suppliers | KemKendra`;
      if (fullTitle.length <= 65) {
        title = fullTitle;
      } else {
        const shortTitle = `${chemName} | ${casPart} | KemKendra`;
        title = shortTitle.length <= 65 ? shortTitle : `${chemName} | Chemical Suppliers | KemKendra`;
      }
    } else {
      title = `${chemName} | Chemical Suppliers | KemKendra`;
    }

    // Description format:
    // Source [Chemical Name] from chemical suppliers on KemKendra. View CAS [CAS Number], specifications, purity, packaging, available offerings, indicative pricing, and request a quotation.
    const casSnippet = product.casNumber ? `CAS ${product.casNumber}, ` : "";
    const hasPrice = product.price && Number(product.price) > 0;
    const pricingSnippet = hasPrice ? "indicative pricing, " : "";
    const description = `Source ${chemName} from chemical suppliers on KemKendra. View ${casSnippet}specifications, purity, packaging, available offerings, ${pricingSnippet}and request a quotation.`;

    const canonicalCode = product.productCode || resolvedParams.id;

    return {
      title,
      description,
      alternates: {
        canonical: `${SITE_URL}/products/${canonicalCode}`,
      },
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/products/${canonicalCode}`,
        siteName: "KemKendra",
        type: "website",
        images: product.primaryImageUrl
          ? [
              {
                url: resolveClientImageUrl(product.primaryImageUrl) || `${SITE_URL}/icon.png`,
                alt: `${product.name} chemical product`,
              },
            ]
          : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    return {
      title: "Chemical Product Catalog | Chemical Suppliers | KemKendra",
      description: "Source chemicals and raw materials from verified chemical suppliers on KemKendra.",
      robots: { index: false, follow: true },
    };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  let product: Product;

  try {
    product = await fetchProductDetail(resolvedParams.id);
  } catch (err) {
    notFound();
  }

  // If accessed by UUID and canonical product code exists, 308 redirect to clean SEO URL
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedParams.id);
  if (isUuid && product.productCode && resolvedParams.id !== product.productCode) {
    permanentRedirect(`/products/${product.productCode}`);
  }

  const canonicalCode = product.productCode || resolvedParams.id;
  const resolvedImageUrl = resolveClientImageUrl(product.primaryImageUrl);

  // Real commercial offers only when price is present
  const offers = product.price && product.price > 0
    ? {
        "@type": "Offer",
        price: product.price,
        priceCurrency: "INR",
        availability: (product.stock && product.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
        itemCondition: "https://schema.org/NewCondition",
        url: `${SITE_URL}/products/${canonicalCode}`,
      }
    : undefined;

  // Schema.org JSON-LD Structured Data for Chemical Compound
  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: resolvedImageUrl ? [resolvedImageUrl] : [],
    description: product.description || `Chemical specifications for ${product.name}`,
    category: product.category,
    sku: canonicalCode,
    identifier: product.casNumber
      ? {
          "@type": "PropertyValue",
          name: "CAS Registry Number",
          value: product.casNumber,
        }
      : undefined,
    ...(offers ? { offers } : {}),
  };

  const matchedCategory = CANONICAL_CATEGORIES.find(
    (c) => c.key === product.category || c.id === product.category?.toLowerCase()
  );
  const categoryHref = matchedCategory ? `/categories/${matchedCategory.id}` : `/products?category=${encodeURIComponent(product.category || "API")}`;
  const categoryName = matchedCategory ? matchedCategory.name : (product.category ? product.category.replace(/_/g, " ") : "Chemicals");

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
        name: "Chemical Catalog",
        item: `${SITE_URL}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryName,
        item: `${SITE_URL}${categoryHref}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `${SITE_URL}/products/${canonicalCode}`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans text-[#0F172A] antialiased">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      <Navbar />

      <main className="flex-1 py-5 sm:py-8 pb-24 lg:pb-8">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Breadcrumbs */}
          <nav
            className="flex items-center gap-2 text-xs font-semibold text-[#64748B] flex-wrap"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-[#0052CC] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <Link href="/products" className="hover:text-[#0052CC] transition-colors">
              Chemical Catalog
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            {product.category && (
              <>
                <Link
                  href={categoryHref}
                  className="hover:text-[#0052CC] transition-colors uppercase font-bold"
                >
                  {categoryName}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              </>
            )}
            <span className="text-[#091E42] font-bold truncate max-w-xs" aria-current="page">
              {product.name}
            </span>
          </nav>

          {/* 1. CHEMICAL MONOGRAPH HERO */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-tactile-card">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left: Product Image & Monograph Visual */}
              <div className="lg:col-span-5 w-full">
                <ProductDetailHeroImage
                  imageUrl={resolvedImageUrl}
                  productName={product.name}
                  casNumber={product.casNumber}
                  molecularFormula={product.molecularFormula}
                  category={product.category}
                />
              </div>

              {/* Right: Chemical Specification & Master Identity */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-2.5 text-xs flex-wrap font-medium">
                  {product.category && (
                    <span className="text-[#0052CC] font-semibold">
                      {getCategoryDisplayName(product.category)}
                    </span>
                  )}
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-slate-600 font-mono">
                    {canonicalCode}
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Specification
                  </span>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] tracking-tight leading-tight">
                    {product.name}
                  </h1>
                  <p className="text-xs text-[#64748B] mt-1.5">
                    Catalog Code: <span className="font-mono text-slate-800">{canonicalCode}</span> &bull; Classification: {getCategoryDisplayName(product.category)}
                  </p>
                </div>

                {/* Key Chemical Formula & CAS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#F8F9FA] border border-slate-200/80 rounded-xl text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[#64748B] text-xs font-semibold block">CAS Registry</span>
                    <strong className="text-sm font-bold font-mono text-[#0F172A]">{product.casNumber || "N/A"}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[#64748B] text-xs font-semibold block">Molecular Formula</span>
                    <strong className="text-sm font-bold font-mono text-[#0F172A]">{product.molecularFormula || "—"}</strong>
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-0.5">
                    <span className="text-[#64748B] text-xs font-semibold block">Standard Purity</span>
                    <strong className="text-sm font-bold text-emerald-700">{product.purity || "≥ 99.0%"}</strong>
                  </div>
                </div>

                {/* Chemical Description */}
                {product.description && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-[#0F172A]">
                      Compound Overview
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Procurement CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 flex-wrap">
                  <Link
                    href={`/rfq?productId=${product.id}&productName=${encodeURIComponent(product.name)}`}
                    className="h-10 px-5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors duration-150 shadow-xs flex items-center justify-center gap-2 press-tactile"
                  >
                    <span>Request Quotation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <a
                    href="#supplier-offerings"
                    className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-[#0F172A] text-xs sm:text-sm font-semibold rounded-lg transition-colors duration-150 flex items-center justify-center shadow-2xs press-tactile"
                  >
                    <span>View Supplier Offerings ({product.offeringCount || 0})</span>
                  </a>

                  <Link
                    href={`/sourcing/request?productName=${encodeURIComponent(product.name)}&casNumber=${encodeURIComponent(product.casNumber || "")}&category=${encodeURIComponent(product.category || "")}`}
                    className="h-10 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold rounded-lg transition-colors duration-150 flex items-center justify-center gap-1.5"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                    <span>Need Custom Spec? Request Sourcing</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* 2. PRIMARY MARKETPLACE SECTION: AVAILABLE FROM VERIFIED SUPPLIERS */}
          <div id="supplier-offerings" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-tactile-card space-y-4">
            <SupplierComparison
              productId={product.id || resolvedParams.id}
              productName={product.name}
            />
          </div>

          {/* 3. TECHNICAL SPECIFICATION GRID */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-tactile-card space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-[#0052CC]" />
              <h2 className="text-sm font-bold text-[#0F172A]">
                Technical Information &amp; Specifications
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              <div className="bg-[#F8F9FA] p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[#64748B] block text-xs font-semibold">Category</span>
                <strong className="text-[#0F172A] font-semibold text-xs sm:text-sm">
                  {product.category ? product.category.replace(/_/g, " ") : "Specialty"}
                </strong>
              </div>
              <div className="bg-[#F8F9FA] p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[#64748B] block text-xs font-semibold">CAS Registry</span>
                <strong className="text-[#0F172A] font-mono font-semibold text-xs sm:text-sm">{product.casNumber || "N/A"}</strong>
              </div>
              <div className="bg-[#F8F9FA] p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[#64748B] block text-xs font-semibold">Molecular Formula</span>
                <strong className="text-[#0F172A] font-mono font-semibold text-xs sm:text-sm">{product.molecularFormula || "—"}</strong>
              </div>
              <div className="bg-[#F8F9FA] p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[#64748B] block text-xs font-semibold">Master Code</span>
                <strong className="text-[#0F172A] font-mono font-semibold text-xs sm:text-sm">{canonicalCode}</strong>
              </div>
              <div className="bg-[#F8F9FA] p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[#64748B] block text-xs font-semibold">Governance Status</span>
                <strong className="text-emerald-700 font-semibold flex items-center gap-1 text-xs sm:text-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Canonical
                </strong>
              </div>
            </div>
          </div>

          {/* 4. CANONICAL PRODUCT DOCUMENTS */}
          <ProductDocuments
            productId={product.id || resolvedParams.id}
            isSeller={false}
          />

        </div>
      </main>

      {/* Sticky Mobile Action Bar (Fixed above bottom nav on mobile viewports) */}
      <div className="lg:hidden fixed bottom-[58px] left-0 right-0 z-30 bg-white border-t border-[#E2E8F0] p-3 shadow-lg flex items-center gap-2.5">
        <a
          href="#supplier-offerings"
          className="flex-1 h-11 px-3 bg-white border border-[#CBD5E1] text-[#091E42] text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center text-center shadow-2xs"
        >
          Suppliers ({product.offeringCount || 0})
        </a>
        <Link
          href={`/rfq?productId=${product.id}&productName=${encodeURIComponent(product.name)}`}
          className="flex-1 h-11 px-4 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99]"
        >
          <span>Request Quote</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <Footer />
    </div>
  );
}
