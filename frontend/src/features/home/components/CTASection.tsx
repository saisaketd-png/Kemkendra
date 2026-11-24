import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-16 md:py-20 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#091E42] rounded-2xl p-8 sm:p-12 md:p-14 text-white text-center shadow-tactile-card border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Chemical Manufacturers</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              Start Sourcing with Verified Global Chemical Suppliers
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Accelerate your chemical procurement timeline. Get instant quotes, sample shipments, and compliant regulatory documentation today.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/products"
                className="w-full sm:w-auto px-6 py-3 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white font-bold text-xs rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/suppliers"
                className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg border border-white/20 transition-colors flex items-center justify-center cursor-pointer"
              >
                Verified Suppliers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
