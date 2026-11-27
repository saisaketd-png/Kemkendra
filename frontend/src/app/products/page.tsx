import { Metadata } from "next";
import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
import { getProducts } from "@/features/products/api/getProducts";

import { ProductPage, ProductQueryParams } from "@/features/products/types/product";
import { ProductFilters } from "@/features/products/components/ProductFilters";
import { ProductToolbar } from "@/features/products/components/ProductToolbar";
import { ProductCatalogTable } from "@/features/products/components/ProductCatalogTable";
import { ProductEmptyState } from "@/features/products/components/ProductEmptyState";
import { ProductPagination } from "@/features/products/components/ProductPagination";
import { ProductCatalogHero } from "@/features/products/components/ProductCatalogHero";
import { getUniqueCategories, getUniqueCountries } from "@/features/products/utils/extractFilters";
import Link from "next/link";
import { ChevronRight, ArrowRight, FlaskConical, ShieldCheck, FileCheck, Layers } from "lucide-react";
import { serializeJsonLd } from "@/shared/utils/security";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const hasFilters = Boolean(
    searchParams.search ||
    searchParams.category ||
    searchParams.casNumber ||
    searchParams.purityMin ||
    searchParams.purityMax ||
    searchParams.grade ||
    searchParams.maxPrice ||
    searchParams.moqMin ||
    searchParams.moqMax ||
    searchParams.maxLeadTime ||
    searchParams.inStock ||
    searchParams.verified ||
    searchParams.coa ||
    searchParams.msds ||
    searchParams.exportReady ||
    searchParams.country
  );

  return {
    title: searchParams.search
      ? `Search: "${searchParams.search}" | Chemical Catalog | KemKendra`
      : "Chemical Product Catalog | APIs, Intermediates & Solvents | KemKendra",
    description:
      "Browse and source pharmaceutical APIs, intermediates, specialty chemicals, and solvents from verified global suppliers. Compare CAS numbers, purity grades, and request quotes directly.",
    alternates: {
      canonical: "https://kemkendra.online/products",
    },
    robots: {
      index: !hasFilters,
      follow: true,
    },
    openGraph: {
      title: "Chemical Product Catalog | KemKendra",
      description:
        "Global chemical B2B marketplace. Search APIs, pharmaceutical intermediates, and solvents with verified documentation.",
      url: "https://kemkendra.online/products",
      siteName: "KemKendra",
      type: "website",
    },
  };
}

export default async function ProductsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  // Parse search params
  const queryParams: ProductQueryParams = {
    page: typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 0,
    size: typeof searchParams.size === "string" ? parseInt(searchParams.size, 10) : 20,
    search: typeof searchParams.search === "string" ? searchParams.search : undefined,
    category: typeof searchParams.category === "string" ? searchParams.category : undefined,
    casNumber: typeof searchParams.casNumber === "string" ? searchParams.casNumber : undefined,
    country: typeof searchParams.country === "string" ? searchParams.country : undefined,
    verified: searchParams.verified === "true",
    purityMin: typeof searchParams.purityMin === "string" ? searchParams.purityMin : undefined,
    purityMax: typeof searchParams.purityMax === "string" ? searchParams.purityMax : undefined,
    grade: typeof searchParams.grade === "string" ? searchParams.grade : undefined,
    currency: typeof searchParams.currency === "string" ? searchParams.currency : undefined,
    maxPrice: typeof searchParams.maxPrice === "string" ? searchParams.maxPrice : undefined,
    moqMin: typeof searchParams.moqMin === "string" ? searchParams.moqMin : undefined,
    moqMax: typeof searchParams.moqMax === "string" ? searchParams.moqMax : undefined,
    maxLeadTime: typeof searchParams.maxLeadTime === "string" ? searchParams.maxLeadTime : undefined,
    minStock: typeof searchParams.minStock === "string" ? searchParams.minStock : undefined,
    inStock: searchParams.inStock === "true",
    coa: searchParams.coa === "true",
    msds: searchParams.msds === "true",
    exportReady: searchParams.exportReady === "true",
    availability: typeof searchParams.availability === "string" ? searchParams.availability : undefined,
    sort: typeof searchParams.sort === "string" ? searchParams.sort : undefined,
  };

  // Fetch products from unified search/filter endpoint
  let productPage: ProductPage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: queryParams.size || 20,
  };

  try {
    productPage = await getProducts(queryParams);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error loading products:", err);
    }
  }

  const products = productPage.content || [];
  const totalElements = productPage.totalElements || 0;

  // Categories & Countries fallback
  const categories = getUniqueCategories(products);
  const countries = getUniqueCountries(products);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://kemkendra.online",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Chemical Catalog",
        item: "https://kemkendra.online/products",
      },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Chemical Product Catalog | KemKendra",
    description:
      "Browse and source pharmaceutical APIs, intermediates, specialty chemicals, and solvents from verified global suppliers.",
    url: "https://kemkendra.online/products",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.slice(0, 20).map((prod, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://kemkendra.online/products/${prod.productCode || prod.id}`,
        name: prod.name,
      })),
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans text-[#0F172A] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionJsonLd) }}
      />
      <Navbar />

      <main className="flex-1 py-8 sm:py-10">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
          {/* Breadcrumb Navigation */}
          <nav
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#64748B]"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-[#0052CC] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
            <span className="text-[#091E42] font-bold" aria-current="page">
              Chemical Catalog
            </span>
          </nav>

          {/* Operational Top Catalog Area */}
          <ProductCatalogHero categories={categories} />

          {/* Two-Column Discovery Layout with Stick-Fixed Filter Rail */}
          <div className="flex flex-col lg:flex-row gap-8 items-start relative">
            {/* Left Filter Rail (320px Stick-Fixed on Desktop - does not move when scrolling right) */}
            <aside className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto pr-0 lg:pr-1.5 custom-scrollbar">
              <ProductFilters categories={categories} countries={countries} />
            </aside>

            {/* Main Product Results Area */}
            <div className="w-full flex-1 min-w-0 space-y-6">
              <ProductToolbar totalResults={totalElements} />

              {products.length === 0 ? (
                <ProductEmptyState searchQuery={queryParams.search} />
              ) : (
                <section className="space-y-6" aria-label="Chemical Catalog entries">
                  <ProductCatalogTable products={products} />

                  <ProductPagination
                    queryParams={queryParams}
                    totalElements={totalElements}
                    currentCount={products.length}
                  />

                  {/* Dedicated Sourcing & Custom Synthesis Section - Perfectly aligned with catalog */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 mt-8">
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        Custom Chemical Sourcing &amp; Procurement
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                        Can&apos;t find your chemical, purity grade, or required volume?
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                        Our specialized Sourcing desk connects procurement and R&amp;D teams with certified synthesis plants, custom CMOs, and compendial standard repositories worldwide.
                      </p>
                    </div>

                    {/* 4 Core Pillars */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-2 hover:border-slate-300 transition-colors">
                        <div className="w-8 h-8 rounded-md bg-blue-50 text-[#0052CC] flex items-center justify-center">
                          <FlaskConical className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-900">Custom Synthesis</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Multi-step synthesis routes from pilot milligram scales up to multi-ton commercial batch runs.
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-2 hover:border-slate-300 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052CC] flex items-center justify-center">
                          <Layers className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-900">Rare CAS &amp; Impurities</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Hard-to-source reference standards, impurity profiles, degradation products, and deuterated compounds.
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-2 hover:border-slate-300 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052CC] flex items-center justify-center">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-900">Dossier &amp; Monograph</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          USP, EP, BP, JP, or internal monograph release specs accompanied by full CoA, NMR, and HPLC spectra.
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-2 hover:border-slate-300 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052CC] flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-900">Escrow &amp; Audit Backing</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Payment held securely until analytical confirmation at your receiving lab or partner testing site.
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                      <Link
                        href={
                          queryParams.search
                            ? `/sourcing?chemical=${encodeURIComponent(queryParams.search)}`
                            : "/sourcing/request"
                        }
                        className="h-10 px-5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
                      >
                        <span>{queryParams.search ? `Source "${queryParams.search}" via Desk` : "Submit Sourcing Request"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href="/sourcing"
                        className="h-10 px-5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg inline-flex items-center gap-2 shadow-2xs transition-colors"
                      >
                        <span>Learn About Sourcing</span>
                      </Link>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
