import React from "react";
import Link from "next/link";
import { ArrowRight, Search, FileSpreadsheet, Scale, ShieldCheck, FileCheck, Truck } from "lucide-react";

export function BrandStatement() {
  const steps = [
    {
      title: "Discover",
      desc: "Locate verified chemical materials, active monograph specs, and supplier origin data.",
      icon: Search,
    },
    {
      title: "Structured RFQ",
      desc: "Submit detailed requests with required purity targets, batch volumes, and destination ports.",
      icon: FileSpreadsheet,
    },
    {
      title: "Evaluate Bids",
      desc: "Compare binding quotation matrices, shipping lead times, and batch test records side-by-side.",
      icon: Scale,
    },
    {
      title: "Contract & Escrow",
      desc: "Execute formal purchase agreements with protected milestone escrow and compliance terms.",
      icon: ShieldCheck,
    },
    {
      title: "Lot Testing",
      desc: "Pre-shipment verification against COA parameters and pharmacopeial monographs.",
      icon: FileCheck,
    },
    {
      title: "Consignment Release",
      desc: "Track customs clearances, shipping custody, and final warehouse receipt.",
      icon: Truck,
    },
  ];

  return (
    <section className="py-12 sm:py-24 bg-[#F8F9FA] border-b border-slate-200/90 relative w-full max-w-full overflow-hidden">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header */}
        <div className="max-w-2xl space-y-2 mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
            From chemical discovery <br />
            to commercial execution.
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            An auditable, end-to-end transaction pipeline engineered for international chemical trade.
          </p>
        </div>

        {/* Engineering Process Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative flex flex-col justify-between pt-4 border-t-2 border-slate-200 hover:border-[#0052CC] transition-colors duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 group-hover:border-blue-200 group-hover:bg-blue-50/50 flex items-center justify-center text-slate-600 group-hover:text-[#0052CC] transition-colors shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    {idx < steps.length - 1 && (
                      <span className="hidden lg:block text-slate-300 text-sm">→</span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#0052CC] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Large Editorial Statement Block */}
        <div className="mt-20 pt-16 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-baseline">
          <div className="lg:col-span-8">
            <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#0F172A] tracking-tight leading-[1.18]">
              Chemical procurement shouldn’t depend on fragmented conversations.
            </h3>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <p className="text-sm text-[#64748B] leading-relaxed">
              KemKendra replaces unstructured WhatsApp messages, broker markups, and unverified batch certificates with canonical product listings, verified manufacturer profiles, and institutional escrow governance.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="text-xs font-semibold text-[#0052CC] hover:text-[#0747A6] inline-flex items-center gap-1.5 transition-colors group"
              >
                <span>Browse Verified Marketplace Products</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}