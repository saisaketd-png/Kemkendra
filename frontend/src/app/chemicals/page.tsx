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
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  FileCheck
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
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] font-sans text-[#0F172A] antialiased">
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
          <nav className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
            <Link href="/" className="hover:text-[#155EEF]">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="text-[#0F172A] font-extrabold">Chemical Compounds & CAS Directory</span>
          </nav>

          {/* Hero Banner */}
          <div className="bg-white border border-[#DCE3EC] rounded-3xl p-8 sm:p-12 shadow-2xs space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#EFF4FF] text-[#155EEF] border border-[#BFDBFE]">
              <FlaskConical className="w-4 h-4" /> CAS Index & Chemical Taxonomy
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">
              Chemical Compounds & CAS Directory
            </h1>
            <p className="text-sm sm:text-base text-[#475467] max-w-3xl leading-relaxed">
              Explore industrial, fine, and specialty chemicals cataloged by CAS registry numbers, molecular formulas, and product classifications. Connect with audited manufacturers and request direct commercial quotations.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#155EEF] text-white text-xs font-bold hover:bg-[#104EC6] transition-colors shadow-2xs"
              >
                <Search className="w-3.5 h-3.5" />
                Search Full Chemical Catalog
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#DCE3EC] text-[#0F172A] text-xs font-bold hover:bg-[#F8FAFC] transition-colors"
              >
                Custom Compound Inquiry &rarr;
              </Link>
            </div>
          </div>

          {/* Sector Categories Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Browse by Chemical Category</h2>
                <p className="text-xs text-[#64748B]">Explore verified chemical grades and industrial sectors.</p>
              </div>
              <Link href="/categories" className="text-xs font-bold text-[#155EEF] hover:underline flex items-center gap-1">
                All Categories <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CANONICAL_CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.id}`}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#BFDBFE] hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#EFF4FF] border border-[#DBEAFE] text-[#155EEF] flex items-center justify-center font-extrabold text-sm mb-4 group-hover:scale-105 transition-transform">
                      {cat.key.substring(0, 2)}
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#155EEF] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-2 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#155EEF]">
                    <span>View Category Products</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* CAS Index Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">CAS Registry Index</h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Verified chemical listings with active supplier offerings and verified analytical documentation.
                </p>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-[#155EEF] hover:underline"
              >
                View all in Catalog &rarr;
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12 text-[#64748B] text-sm">
                No indexed chemical products found at this time.
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                <table className="w-full text-left text-xs text-[#475467]">
                  <thead className="bg-[#F8FAFC] text-[11px] font-extrabold uppercase text-[#64748B] border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-3 px-4">Chemical / Compound</th>
                      <th className="py-3 px-4">CAS Number</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Formula</th>
                      <th className="py-3 px-4 text-center">Suppliers</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {products.map((p) => {
                      const chemSlug = p.casNumber ? p.casNumber : p.productCode || p.id;
                      return (
                        <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-3 px-4 font-bold text-[#0F172A]">
                            <Link href={`/chemicals/${chemSlug}`} className="hover:text-[#155EEF]">
                              {p.name}
                            </Link>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-[#0F172A]">
                            {p.casNumber || "N/A"}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF4FF] text-[#155EEF]">
                              {p.category || "General"}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[#64748B]">
                            {p.molecularFormula || "—"}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-[#0F172A]">
                            {p.offeringCount || 0}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              href={`/chemicals/${chemSlug}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#155EEF] hover:underline"
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
          <div className="bg-[#0B1F3A] text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1E3A8A] text-[#93C5FD]">
                <ShieldCheck className="w-3.5 h-3.5" /> Factual Quality Verification
              </span>
              <h3 className="text-2xl font-extrabold tracking-tight">Need a custom chemical or batch volume?</h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                KemKendra routes your requirements directly to audited chemical manufacturers with verified ISO, GMP, and factory licenses.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link
                href="/contact"
                className="px-6 py-3 bg-[#155EEF] hover:bg-[#104EC6] text-white font-bold rounded-xl text-xs transition-colors shadow-2xs"
              >
                Inquire With Procurement Desk
              </Link>
              <Link
                href="/register/buyer"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs transition-colors"
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
