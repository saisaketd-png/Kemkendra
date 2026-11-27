import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function EnterpriseCTA() {
  return (
    <section className="py-10 sm:py-16 bg-[#0A1128] text-white border-b border-[#1E293B] w-full max-w-full overflow-hidden">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-between">

          {/* Left Column: Editorial Statement */}
          <div className="lg:col-span-8 space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Find the chemical materials your business needs.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Connect with audited manufacturers and submit structured RFQs with full regulatory compliance.
            </p>
          </div>

          {/* Right Column: Clean Editorial Actions */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start lg:items-end justify-start lg:justify-end gap-3 shrink-0">
            <Link
              href="/products"
              className="h-10 px-6 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/sourcing/request"
              className="h-10 px-5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Custom Sourcing</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
