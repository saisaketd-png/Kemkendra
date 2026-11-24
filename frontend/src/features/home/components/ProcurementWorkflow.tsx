import { Search, ListFilter, FileEdit, FileText, Package } from "lucide-react";

export function ProcurementWorkflow() {
  const steps = [
    { title: "Search", desc: "Find verified ingredients by CAS or formula", icon: Search },
    { title: "Compare", desc: "Evaluate purity specs, pricing & lead time", icon: ListFilter },
    { title: "RFQ", desc: "Request binding quotes from certified plants", icon: FileEdit },
    { title: "Documentation", desc: "Inspect lot COA, MSDS & regulatory filings", icon: FileText },
    { title: "Procurement", desc: "Escrow-backed ordering & custody tracking", icon: Package },
  ];

  return (
    <div className="bg-[#091E42] border border-[#1E293B] rounded-2xl p-6 sm:p-8 flex flex-col h-full shadow-tactile-card text-white">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-white/10 space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
          Structured Procurement Lifecycle
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Binding quotation commitments, verified technical specifications, and end-to-end consignment custody.
        </p>
      </div>

      {/* Vertical Steps */}
      <div className="relative flex-1">
        {/* Vertical Line */}
        <div className="absolute left-[17px] top-4 bottom-4 w-px bg-white/10" />
        
        <div className="space-y-5 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex items-center gap-4 group">
                <div className="relative z-10 w-9 h-9 rounded-lg border border-white/15 bg-white/10 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-600 transition-colors duration-200">
                  <Icon className="w-4 h-4 text-blue-200 group-hover:text-white transition-colors" />
                </div>
                
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-white text-xs mb-0.5">{s.title}</h3>
                    <p className="text-[11px] text-slate-300">{s.desc}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Step {idx + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}