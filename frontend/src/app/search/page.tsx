import { Metadata } from "next";
import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
import { searchCatalog } from "@/features/search/api/searchApi";
import { SearchQueryParams } from "@/features/search/types/searchTypes";
import { SearchResultsView } from "@/features/search/components/SearchResultsView";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { serializeJsonLd } from "@/shared/utils/security";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(props: SearchPageProps): Promise<Metadata> {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : undefined;
  const hasFacetedFilters = Boolean(
    sp.category ||
    sp.minPurity ||
    sp.maxPurity ||
    sp.supplierName ||
    sp.country ||
    sp.verifiedOnly ||
    sp.inStockOnly ||
    sp.minPrice ||
    sp.maxPrice ||
    sp.grade ||
    (sp.page && sp.page !== "0")
  );

  return {
    title: q
      ? `"${q}" - Chemical Search Results | KemKendra Marketplace`
      : "Search Chemical Catalog | APIs, Solvents & Intermediates | KemKendra",
    description: q
      ? `Explore search results for "${q}" across KemKendra's global chemical catalog. Compare CAS numbers, purity benchmarks, and verified chemical manufacturers.`
      : "Global chemical B2B search engine. Find pharmaceutical APIs, intermediates, and industrial solvents with live availability and verified COA/MSDS documents.",
    alternates: {
      canonical: "https://kemkendra.online/search",
    },
    robots: {
      // Do not index deep faceted filter combinations to prevent crawl bloat
      index: !hasFacetedFilters,
      follow: true,
    },
    openGraph: {
      title: q
        ? `"${q}" - Search Results | KemKendra`
        : "Advanced Chemical Search & Discovery | KemKendra",
      description:
        "Direct verified B2B chemical sourcing. Search APIs, CAS numbers, and verified chemical manufacturers worldwide.",
      url: "https://kemkendra.online/search",
      siteName: "KemKendra",
      type: "website",
    },
  };
}

export default async function SearchPage(props: SearchPageProps) {
  const sp = await props.searchParams;

  const filters: SearchQueryParams = {
    q: typeof sp.q === "string" ? sp.q : undefined,
    category: typeof sp.category === "string" ? sp.category : undefined,
    minPurity: typeof sp.minPurity === "string" ? sp.minPurity : undefined,
    maxPurity: typeof sp.maxPurity === "string" ? sp.maxPurity : undefined,
    supplierName: typeof sp.supplierName === "string" ? sp.supplierName : undefined,
    country: typeof sp.country === "string" ? sp.country : undefined,
    verifiedOnly: sp.verifiedOnly === "true",
    inStockOnly: sp.inStockOnly === "true",
    minPrice: typeof sp.minPrice === "string" ? sp.minPrice : undefined,
    maxPrice: typeof sp.maxPrice === "string" ? sp.maxPrice : undefined,
    grade: typeof sp.grade === "string" ? sp.grade : undefined,
    sort: (typeof sp.sort === "string" ? sp.sort : "relevance") as any,
    page: sp.page ? parseInt(sp.page as string, 10) : 0,
    size: sp.size ? parseInt(sp.size as string, 10) : 20,
  };

  const results = await searchCatalog(filters);

  // Structured Data for Google Search
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: filters.q ? `Chemical Search: ${filters.q}` : "Chemical Catalog Search",
    url: "https://kemkendra.online/search",
    breadcrumb: {
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
          name: "Search Catalog",
          item: "https://kemkendra.online/search",
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
        <div>
          <Navbar />

          <main className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs text-[#64748B] mb-4 overflow-x-auto whitespace-nowrap"
            >
              <Link href="/" className="hover:text-[#0052CC] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
              <span className="font-semibold text-[#0F172A]">Chemical Search</span>
              {filters.q && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                  <span className="text-[#0052CC] font-mono">&quot;{filters.q}&quot;</span>
                </>
              )}
            </nav>

            <SearchResultsView initialResults={results} filters={filters} />
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
}
