import { Metadata } from "next";
import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
import { RESOURCE_ARTICLES } from "@/features/resources/data/resourceArticles";
import Link from "next/link";
import { BookOpen, Clock, ChevronRight, ArrowRight, ShieldCheck, FileText } from "lucide-react";
import { serializeJsonLd } from "@/shared/utils/security";

export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kemkendra.online";

export const metadata: Metadata = {
  title: "Chemical Sourcing Resources & Regulatory Compliance Guides | KemKendra",
  description: "Explore institutional chemical sourcing handbooks, COA/MSDS verification protocols, WHO-GMP API regulations, INCOTERMS packaging guides, and B2B marketplace FAQs.",
  alternates: {
    canonical: `${SITE_URL}/resources`,
  },
  openGraph: {
    title: "Chemical Sourcing Resources & Regulatory Compliance Guides | KemKendra",
    description: "Explore institutional chemical sourcing handbooks, COA/MSDS verification protocols, and B2B marketplace FAQs.",
    url: `${SITE_URL}/resources`,
    siteName: "KemKendra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chemical Sourcing Resources & Regulatory Compliance Guides | KemKendra",
    description: "Explore institutional chemical sourcing handbooks, COA/MSDS verification protocols, and B2B marketplace FAQs.",
  },
};

export default async function ResourcesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const categoryFilter = typeof searchParams.category === "string" ? searchParams.category : "all";
  const searchQuery = typeof searchParams.q === "string" ? searchParams.q.toLowerCase().trim() : "";

  const filteredArticles = RESOURCE_ARTICLES.filter((article) => {
    const matchesCat = categoryFilter === "all" || article.categoryKey === categoryFilter;
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery) ||
      article.summary.toLowerCase().includes(searchQuery) ||
      article.tags.some((t) => t.toLowerCase().includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "KemKendra Chemical Procurement & Compliance Resources",
    description: "Technical monographs, regulatory compliance guidelines, and procurement best practices for institutional chemical trade.",
    url: `${SITE_URL}/resources`,
    hasPart: RESOURCE_ARTICLES.map((a) => ({
      "@type": "Article",
      name: a.title,
      description: a.summary,
      url: `${SITE_URL}/resources/${a.slug}`,
      datePublished: a.publishedDate,
    })),
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
        name: "Resources",
        item: `${SITE_URL}/resources`,
      },
    ],
  };

  const categories = [
    { label: "All Guides", key: "all" },
    { label: "Buyer Education", key: "buyer-education" },
    { label: "Regulatory & Compliance", key: "regulatory" },
    { label: "Marketplace Usage", key: "marketplace-usage" },
    { label: "Supplier Education", key: "supplier-education" },
    { label: "Supply Chain", key: "supply-chain" },
    { label: "FAQs", key: "faqs" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans text-slate-900 antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#0052CC] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">Resource Center</span>
          </nav>

          {/* Hero Header */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 shadow-tactile-card space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0052CC] border border-blue-200/80 shadow-2xs">
              <BookOpen className="w-4 h-4 text-[#0052CC]" /> Technical & Compliance Knowledge Base
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#091E42] tracking-tight">
              Chemical Sourcing Guides & Regulatory Monographs
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              Factual, peer-reviewed monographs covering Certificate of Analysis (COA) verification, WHO-GMP regulatory dossiers, dangerous goods transport, and institutional procurement workflows.
            </p>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 pt-4 flex-wrap">
              {categories.map((c) => {
                const isActive = categoryFilter === c.key;
                return (
                  <Link
                    key={c.key}
                    href={c.key === "all" ? "/resources" : `/resources?category=${c.key}`}
                    className={`h-8 px-3.5 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#0052CC] text-white shadow-2xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    {c.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Article Grid */}
          {filteredArticles.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3 shadow-tactile-card">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h2 className="text-lg font-bold text-slate-900">No resources found</h2>
              <p className="text-xs text-slate-500">No published articles match the selected category filter.</p>
              <Link href="/resources" className="inline-block text-xs font-bold text-[#0052CC] hover:underline pt-2">
                Reset filters &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <article
                  key={article.slug}
                  className="bg-white border border-slate-200/90 hover:border-[#0052CC]/40 hover:-translate-y-1 rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all shadow-tactile-card group space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#0052CC] border border-blue-200/80">
                        {article.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {article.readTime}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-[#0052CC] transition-colors">
                        <Link href={`/resources/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h2>
                      <p className="text-xs text-slate-600 leading-relaxed mt-2.5 line-clamp-3">
                        {article.summary}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      <span className="font-bold text-slate-900">{article.author}</span>
                      <p className="text-[10px] text-slate-400">Updated {article.updatedDate}</p>
                    </div>

                    <Link
                      href={`/resources/${article.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0052CC] group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Conversion CTA Footer Banner */}
          <div className="bg-[#091E42] text-white rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-tactile-card border border-slate-800">
            <div className="space-y-3 max-w-2xl text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Institutional Chemical Sourcing
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Source Verified Chemical Compounds with Audited Documents
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Connect directly with vetted manufacturers. Inspect batch analytical reports, request technical dossiers, and obtain competitive commercial quotations.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-col sm:flex-row w-full md:w-auto">
              <Link
                href="/products"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold rounded-lg text-center transition-colors shadow-2xs cursor-pointer"
              >
                Browse Chemical Catalog
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-lg text-center transition-colors cursor-pointer"
              >
                Contact Procurement Desk
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
