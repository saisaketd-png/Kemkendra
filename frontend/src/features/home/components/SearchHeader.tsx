import Link from "next/link";
import Image from "next/image";
import { Search, ChevronDown, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export function SearchHeader() {
  return (
    <section className="relative bg-[#0A1128] text-white border-b border-[#1E293B] overflow-hidden w-full max-w-full">
      <div className="max-w-[1560px] mx-auto relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[660px]">
          
          {/* Left Column (~55% / 7 cols): Editorial Typography, Sourcing Search & Trust Strip */}
          <div className="lg:col-span-7 flex flex-col justify-between px-4 py-8 sm:p-10 lg:p-16 z-10 w-full">
            <div className="space-y-4 sm:space-y-6 max-w-2xl w-full">
              
              {/* Modern Live Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-sky-300 border border-blue-400/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Verified B2B Chemical Exchange</span>
              </div>

              {/* Responsive Modern Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-[52px] xl:text-[58px] font-black tracking-tight text-white leading-[1.12]">
                Direct Chemical <br className="hidden sm:inline" />
                Procurement Exchange.
              </h1>

              {/* Concise Supporting Narrative */}
              <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
                Discover audited compendial Active Pharmaceutical Ingredients (APIs), pharmaceutical intermediates, and high-purity industrial solvents from ISO 9001 and cGMP verified chemical manufacturers across India.
              </p>

              {/* Unified Mobile-First Search Control */}
              <div className="pt-1 sm:pt-2 w-full">
                <form
                  action="/products"
                  method="GET"
                  className="bg-white rounded-xl p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2 w-full max-w-xl shadow-2xl border border-white/20 transition-all focus-within:ring-2 focus-within:ring-blue-500/20"
                >
                  {/* Category Dropdown (Visible on Tablet & Desktop) */}
                  <div className="relative border-r border-[#E4E4E7] hidden sm:flex items-center h-10 sm:h-11 min-w-[130px] shrink-0">
                    <select
                      name="category"
                      aria-label="Select chemical category"
                      className="w-full h-full bg-transparent text-xs font-semibold text-[#0F172A] pl-3 pr-7 appearance-none cursor-pointer focus:outline-none"
                      defaultValue=""
                    >
                      <option value="">All Categories</option>
                      <option value="API">APIs & Actives</option>
                      <option value="INTERMEDIATE">Intermediates</option>
                      <option value="EXCIPIENT">Excipients</option>
                      <option value="SOLVENT">Solvents</option>
                      <option value="SPECIALTY_CHEMICAL">Specialty Chemicals</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 pointer-events-none" />
                  </div>

                  {/* Text Search Input */}
                  <div className="flex-1 flex items-center h-10 sm:h-11 px-2 min-w-0">
                    <Search className="w-4 h-4 text-[#0052CC] mr-2 shrink-0" />
                    <input
                      type="text"
                      name="search"
                      placeholder="Search chemicals, CAS or grade..."
                      className="w-full bg-transparent text-xs sm:text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none font-medium min-w-0"
                    />
                  </div>

                  {/* Search Action Button */}
                  <button
                    type="submit"
                    className="h-9 sm:h-11 px-3.5 sm:px-6 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer press-tactile"
                    aria-label="Search Chemicals"
                  >
                    <span className="hidden sm:inline">Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Popular Chemical Search Tags (Horizontal Swipeable on Mobile) */}
                <div className="pt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs text-slate-400 w-full">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold shrink-0">
                    Popular:
                  </span>
                  <Link
                    href="/products?search=Paracetamol"
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sky-200 border border-slate-700 font-mono text-[11px] transition-colors"
                  >
                    Paracetamol IP
                  </Link>
                  <Link
                    href="/products?search=Isopropyl+Alcohol"
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sky-200 border border-slate-700 font-mono text-[11px] transition-colors"
                  >
                    IPA ≥ 99.8%
                  </Link>
                  <Link
                    href="/products?search=Methanol"
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sky-200 border border-slate-700 font-mono text-[11px] transition-colors"
                  >
                    Methanol Pure
                  </Link>
                  <Link
                    href="/products?search=Dichloromethane"
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sky-200 border border-slate-700 font-mono text-[11px] transition-colors"
                  >
                    DCM 75-09-2
                  </Link>
                  <Link
                    href="/products?search=Acetone"
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sky-200 border border-slate-700 font-mono text-[11px] transition-colors"
                  >
                    Acetone ACS
                  </Link>
                </div>
              </div>

              {/* Action Buttons: 2-Column Grid on Mobile, Flex on Desktop */}
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-4 pt-1 w-full max-w-xl">
                <Link
                  href="/products"
                  className="h-10 sm:h-11 px-3 sm:px-6 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs press-tactile text-center"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/sourcing/request"
                  className="h-10 sm:h-11 px-3 sm:px-6 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 press-tactile text-center"
                >
                  <span>Custom Sourcing</span>
                </Link>
              </div>
            </div>

            {/* Quiet Trust Line: Responsive on all viewports */}
            <div className="pt-6 mt-6 sm:pt-8 sm:mt-8 border-t border-slate-800/90 flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 text-[11px] font-medium text-slate-300">
              <span className="flex items-center gap-1 text-slate-200">
                <span className="text-emerald-400 font-bold">✓</span> Structured RFQs
              </span>
              <span className="flex items-center gap-1 text-slate-200">
                <span className="text-emerald-400 font-bold">✓</span> 120+ Audited Facilities
              </span>
              <span className="flex items-center gap-1 text-slate-200">
                <span className="text-emerald-400 font-bold">✓</span> Batch COA Verified
              </span>
              <span className="flex items-center gap-1 text-slate-200">
                <span className="text-emerald-400 font-bold">✓</span> Escrow Protected
              </span>
            </div>
          </div>

          {/* Right Column (~45% / 5 cols): Edge-to-edge Macro Chemical Material Editorial Visual (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-5 relative min-h-[360px] lg:min-h-full border-t lg:border-t-0 lg:border-l border-slate-800 bg-[#0A1128] overflow-hidden">
            <Image
              src="/hero-chemical-material.webp"
              alt="High-purity crystalline and pharmaceutical chemical raw material"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              quality={75}
              className="object-cover object-center brightness-95 contrast-105 transition-transform duration-700 hover:scale-105"
            />
            {/* Natural gradient blend */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0A1128] lg:via-[#0A1128]/20 lg:to-transparent pointer-events-none" />

            {/* Understated Editorial Notation */}
            <div className="absolute bottom-5 right-5 text-right font-mono text-[11px] text-slate-400/90 pointer-events-none">
              <span className="text-slate-300 font-semibold block text-xs">High-Purity Compendial Assay</span>
              <span>Controlled Crystalline & Powder Spec</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
