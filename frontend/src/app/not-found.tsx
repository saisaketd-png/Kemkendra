import { Metadata } from "next";
import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
import { FlaskConical, Search, Home, ArrowRight, Layers, Building2, HelpCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found (404) | KemKendra",
  description: "The requested chemical compound, supplier, or page could not be found on KemKendra. Search our catalog or explore chemical categories.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans text-[#0F172A] antialiased">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full text-center space-y-8">
          
          {/* Visual Icon Badge */}
          <div className="relative mx-auto w-24 h-24 rounded-2xl bg-white border border-slate-200/90 shadow-tactile-card flex items-center justify-center">
            <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0052CC]">
              <FlaskConical className="w-8 h-8 stroke-1.5" />
            </div>
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-red-600 text-white shadow-xs">
              404
            </span>
          </div>

          {/* Heading and Message */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#091E42] tracking-tight">
              Compound or Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
              The chemical compound, supplier profile, or destination you were looking for might have been moved, renamed, or is currently unavailable in our active catalog.
            </p>
          </div>

          {/* Search CTA Box */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-tactile-card space-y-4 text-left">
            <p className="text-xs font-semibold text-[#091E42]">
              Recommended Next Steps
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/products"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-[#F8F9FA] hover:bg-blue-50/50 hover:border-blue-200 transition-colors group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#0052CC] group-hover:border-blue-200">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0F172A] group-hover:text-[#0052CC]">Chemical Catalog</p>
                  <p className="text-[11px] text-[#64748B]">Search by CAS or name</p>
                </div>
              </Link>

              <Link
                href="/categories"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-[#F8F9FA] hover:bg-blue-50/50 hover:border-blue-200 transition-colors group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#0052CC] group-hover:border-blue-200">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0F172A] group-hover:text-[#0052CC]">Categories</p>
                  <p className="text-[11px] text-[#64748B]">APIs, solvents, intermediates</p>
                </div>
              </Link>

              <Link
                href="/suppliers"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-[#F8F9FA] hover:bg-blue-50/50 hover:border-blue-200 transition-colors group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#0052CC] group-hover:border-blue-200">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0F172A] group-hover:text-[#0052CC]">Supplier Network</p>
                  <p className="text-[11px] text-[#64748B]">Verified manufacturers</p>
                </div>
              </Link>

              <Link
                href="/contact"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-[#F8F9FA] hover:bg-blue-50/50 hover:border-blue-200 transition-colors group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#0052CC] group-hover:border-blue-200">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0F172A] group-hover:text-[#0052CC]">Procurement Desk</p>
                  <p className="text-[11px] text-[#64748B]">Direct assistance</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Home Button */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-semibold shadow-xs transition-colors press-tactile"
            >
              <Home className="w-4 h-4" />
              <span>Back to Marketplace Home</span>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
