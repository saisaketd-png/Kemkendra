import { Metadata } from "next";
import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
import { CANONICAL_CATEGORIES } from "@/features/categories/api/categoryApi";
import { getProducts } from "@/features/products/api/getProducts";
import { serializeJsonLd } from "@/shared/utils/security";
import Link from "next/link";
import {
  FlaskConical,
  ChevronRight,
  Search,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kemkendra.online";

export const metadata: Metadata = {
  title: "Chemical Compounds & CAS Directory | KemKendra Industrial Marketplace",
  description:
    "Browse industrial and specialty chemicals by CAS registry number, chemical category, and industrial application. Source audited bulk compounds on KemKendra.",
  alternates: {
    canonical: `${SITE_URL}/chemicals`,
  },
  openGraph: {
    title: "Chemical Compounds & CAS Directory | KemKendra",
    description:
      "Browse industrial and specialty chemicals by CAS registry number and verified supplier offerings.",
    url: `${SITE_URL}/chemicals`,
    siteName: "KemKendra",
    type: "website",
  },
};

export default async function ChemicalsDirectoryPage() {
  // Fetch sample active products to populate CAS directory index
  const productData = await getProducts({ size: 100 });
  const products = productData?.content || [];

  const chemicalsJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Chemical Compounds & CAS Directory",
    description:
      "Directory of verified industrial chemical compounds and CAS registry numbers on KemKendra.",
    url: `${SITE_URL}/chemicals`,
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
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans text-slate-900 antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(chemicalsJsonLd) }}
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
            <span className="text-slate-900 font-bold">Chemical Compounds & CAS Directory</span>
          </nav>

          {/* Hero Banner */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 shadow-tactile-card space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0052CC] border border-blue-200/80 shadow-2xs">
              <FlaskConical className="w-4 h-4 text-[#0052CC]" /> CAS Index & Chemical Taxonomy
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#091E42] tracking-tight">
              Chemical Compounds & CAS Directory
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              Explore industrial, fine, and specialty chemicals cataloged by CAS registry numbers, molecular formulas, and product classifications. Connect with audited manufacturers and request direct commercial quotations.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                Search Full Chemical Catalog
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Custom Compound Inquiry &rarr;
              </Link>
            </div>
          </div>

          {/* Sector Categories Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#091E42] tracking-tight">Browse by Chemical Category</h2>
                <p className="text-xs text-slate-500">Explore verified chemical grades and industrial sectors.</p>
              </div>
              <Link href="/categories" className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1">
                All Categories <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CANONICAL_CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.id}`}
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 hover:border-[#0052CC]/40 hover:-translate-y-1 hover:shadow-tactile-card transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 text-[#0052CC] flex items-center justify-center font-extrabold text-sm mb-4 group-hover:scale-105 transition-transform shadow-2xs">
                      {cat.key.substring(0, 2)}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0052CC] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0052CC]">
                    <span>View Category Products</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* CAS Index Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-tactile-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#091E42]">CAS Registry Index</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified chemical listings with active supplier offerings and verified analytical documentation.
                </p>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-[#0052CC] hover:underline"
              >
                View all in Catalog &rarr;
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No indexed chemical products found at this time.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-bold text-slate-700">Chemical / Compound</th>
                      <th className="py-3 px-4 font-bold text-slate-700">CAS Number</th>
                      <th className="py-3 px-4 font-bold text-slate-700">Category</th>
                      <th className="py-3 px-4 font-bold text-slate-700">Formula</th>
                      <th className="py-3 px-4 text-center font-bold text-slate-700">Suppliers</th>
                      <th className="py-3 px-4 text-right font-bold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => {
                      const chemSlug = p.casNumber ? p.casNumber : p.productCode || p.id;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <Link href={`/chemicals/${chemSlug}`} className="hover:text-[#0052CC] transition-colors">
                              {p.name}
                            </Link>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                            {p.casNumber || "N/A"}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#0052CC] border border-blue-200/80">
                              {p.category || "General"}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {p.molecularFormula || "—"}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-slate-900">
                            {p.offeringCount || 0}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              href={`/chemicals/${chemSlug}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#0052CC] hover:underline"
                            >
                              Details &rarr;
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Verification & Quality Standards Bar */}
          <div className="bg-[#091E42] text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-tactile-card border border-slate-800">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Factual Quality Verification
              </span>
              <h3 className="text-2xl font-bold tracking-tight">Need a custom chemical or batch volume?</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                KemKendra routes your requirements directly to audited chemical manufacturers with verified ISO, GMP, and factory licenses.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link
                href="/contact"
                className="px-5 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
              >
                Inquire With Procurement Desk
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Open Free Buyer Account
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
