import Link from "next/link";
import { ArrowRight, FileCheck2 } from "lucide-react";

export function ResourcesSection() {
  const dossiers = [
    {
      code: "ICH-Q3A / EP 10.0",
      title: "Active Substance Purity & Analytical Assay Protocols",
      category: "Compendial Standard",
      methodology: "Reverse-Phase HPLC (C18 250×4.6mm, UV 254nm)",
      limits: "Assay 99.50% - 100.50% · Individual Impurity ≤ 0.05%",
      description: "Standard analytical procedures for API release testing, covering chromatographic purity thresholds, chromatographic system suitability, and related substances.",
    },
    {
      code: "ICH-Q3C (R8) / GC-HS",
      title: "Class 1, 2 & 3 Volatile Organic Impurity Controls",
      category: "Residual Solvents",
      methodology: "Headspace Gas Chromatography with Flame Ionization (GC-FID)",
      limits: "Methanol < 3000 ppm · Acetone < 5000 ppm · Benzene < 2 ppm",
      description: "Toxicological risk assessments and acceptable concentration limits for residual process solvents in active pharmaceutical ingredients and bulk chemicals.",
    },
    {
      code: "WHO-TRS-986 / 21 CFR",
      title: "Cleanroom Air Qualification & Water System Vetting",
      category: "cGMP Validation",
      methodology: "ISO 14644-1 Airborne Particle Count & Bioburden TOC",
      limits: "Class D / Grade C Background · Bioburden < 10 CFU/100mL",
      description: "Environmental monitoring protocols, Drug Master File (DMF Type II) preparation guidelines, and batch production release checklist.",
    },
  ];

  return (
    <section className="py-12 sm:py-24 bg-[#F8F9FA] border-b border-[#E4E4E7] w-full max-w-full overflow-hidden">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#E4E4E7] pb-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
              Analytical specifications, <br />
              pharmacopeial benchmarks.
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Technical specifications, impurity limit profiles, and regulatory compliance protocols for institutional chemical procurement.
            </p>
          </div>
          
          <Link
            href="/resources"
            className="h-10 px-4 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-semibold rounded-[6px] transition-all inline-flex items-center gap-2 shadow-2xs shrink-0 self-start md:self-auto press-tactile"
          >
            <span>Browse Full Regulatory Repository</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
          </Link>
        </div>

        {/* 3-Column Technical Dossier Cards with Animated Elevation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {dossiers.map((dossier, i) => (
            <div
              key={i}
              className="bg-[#FAFAFA] hover:bg-white border border-[#E4E4E7] hover:border-[#0052CC] rounded-[12px] p-6 sm:p-7 transition-all flex flex-col justify-between shadow-tactile-card card-elevation group"
            >
              <div className="space-y-4">
                {/* Dossier Code & Type (Clean typography, NO boxy AI badge) */}
                <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3 text-xs font-mono">
                  <span className="text-[#0052CC] font-semibold">
                    {dossier.category}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {dossier.code}
                  </span>
                </div>
                
                {/* Title */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A] group-hover:text-[#0052CC] transition-colors leading-snug">
                    {dossier.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                    {dossier.description}
                  </p>
                </div>

                {/* Analytical Specification Grid */}
                <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-3.5 space-y-2 font-mono text-[11px] group-hover:border-blue-100 transition-colors">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Testing Methodology</span>
                    <strong className="text-[#0F172A] font-medium">{dossier.methodology}</strong>
                  </div>
                  <div className="pt-2 border-t border-[#F1F5F9]">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Standard Threshold</span>
                    <strong className="text-[#059669] font-medium">{dossier.limits}</strong>
                  </div>
                </div>
              </div>

              {/* Action Button with micro-interaction */}
              <div className="mt-6 pt-4 border-t border-[#E4E4E7] flex items-center justify-between text-xs font-semibold text-[#0052CC]">
                <Link
                  href="/resources"
                  className="inline-flex items-center gap-1.5 hover:underline"
                >
                  <span>Inspect Analytical Protocol</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                </Link>
                <FileCheck2 className="w-4 h-4 text-slate-400 group-hover:text-[#0052CC] transition-colors" />
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
