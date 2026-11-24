import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { CANONICAL_CATEGORIES, getCategoryCounts } from "@/features/categories/api/categoryApi";

const CATEGORY_SAMPLE_CHEMICALS: Record<string, Array<{ name: string; cas: string }>> = {
  API: [
    { name: "Paracetamol IP", cas: "103-90-2" },
    { name: "Ibuprofen BP", cas: "15687-27-1" },
    { name: "Metformin HCl", cas: "1115-70-4" },
  ],
  INTERMEDIATE: [
    { name: "4-Hydroxycarbazole", cas: "52602-39-8" },
    { name: "4-Chloroacetophenone", cas: "99-91-2" },
    { name: "2-Cyanopyridine", cas: "100-70-9" },
  ],
  SPECIALTY_CHEMICAL: [
    { name: "Methyl Adipoyl Chloride", cas: "35444-44-1" },
    { name: "DIPEA Base", cas: "7087-68-5" },
    { name: "EDC HCl", cas: "25952-53-8" },
  ],
  SOLVENT: [
    { name: "IPA ≥ 99.8%", cas: "67-63-0" },
    { name: "Methanol HPLC", cas: "67-56-1" },
    { name: "Ethyl Acetate", cas: "141-78-6" },
  ],
  EXCIPIENT: [
    { name: "Microcrystalline Cellulose", cas: "9004-34-6" },
    { name: "PVP K-30", cas: "9003-39-8" },
    { name: "Lactose Monohydrate", cas: "64044-51-5" },
  ],
};

export async function CategoryGrid() {
  const counts = await getCategoryCounts();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {CANONICAL_CATEGORIES.map((cat) => {
        const rawCount = counts[cat.key];
        const count = typeof rawCount === "number" ? rawCount : 0;
        const isComingSoon = Boolean(cat.isComingSoon);
        const sampleChemicals = CATEGORY_SAMPLE_CHEMICALS[cat.key] || [];

        if (isComingSoon) {
          return (
            <div
              key={cat.id}
              className="bg-white p-6 rounded-[12px] border border-[#E4E4E7] flex flex-col justify-between opacity-85 shadow-tactile-card"
            >
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-[#F1F5F9] pb-2.5">
                  <span className="text-[11px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
                    {cat.key.replace(/_/g, " ")}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-semibold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                    <Clock className="w-3 h-3" /> UPCOMING
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A]">
                  {cat.name}
                </h3>
                
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E4E4E7] text-[11px] font-mono text-[#64748B]">
                Custom CMO capacity coming in Phase 3
              </div>
            </div>
          );
        }

        // Display count cleanly: if count > 0 show count, if 0 show "Available on Inquiry" so it doesn't look like an error
        const countText = count > 0 
          ? `${count} ${count === 1 ? "Product" : "Products"}` 
          : "Available on Inquiry";

        return (
          <Link
            key={cat.id}
            href={`/categories/${cat.id}`}
            className="group bg-white hover:bg-slate-50/60 p-6 rounded-[12px] border border-[#E4E4E7] hover:border-[#0052CC] transition-all duration-200 ease-out flex flex-col justify-between shadow-tactile-card hover:shadow-tactile-hover hover:-translate-y-1"
          >
            <div className="space-y-4">
              {/* Category Classification and Active Count */}
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2.5">
                <span className="text-[11px] font-mono font-semibold tracking-wider text-slate-500 uppercase group-hover:text-[#0052CC] transition-colors">
                  {cat.key.replace(/_/g, " ")}
                </span>
                <span className="text-xs font-mono font-medium text-[#059669]">
                  {countText}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#0052CC] transition-colors tracking-tight">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Sample Chemicals with CAS */}
              {sampleChemicals.length > 0 && (
                <div className="pt-2 border-t border-[#F8FAFC] space-y-1.5">
                  <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 block tracking-wider">
                    AUDITED COMPOUNDS:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-[#0F172A]">
                    {sampleChemicals.slice(0, 2).map((c) => (
                      <span
                        key={c.cas}
                        className="px-2 py-0.5 bg-slate-50 group-hover:bg-white rounded-[4px] border border-slate-200 transition-colors"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-[#E4E4E7] flex items-center justify-between text-xs font-semibold text-[#0052CC]">
              <span>Explore Chemicals</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform duration-200" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}