import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

export async function CategoryShortcuts() {
  const counts = await getCategoryCounts();

  return (
    <section className="py-16 sm:py-24 bg-[#F8F9FA] border-b border-[#E4E4E7]">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header: Left Heading + Right Explanation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end pb-10 border-b border-[#E4E4E7]">
          <div className="lg:col-span-7 space-y-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F172A] leading-tight">
              Chemical categories, <br />
              organized for discovery.
            </h2>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between items-start lg:items-end gap-4">
            <p className="text-sm text-[#64748B] leading-relaxed max-w-md">
              Browse verified active pharmaceutical ingredients, fine chemical intermediates, and industrial materials structured for procurement compliance.
            </p>
            <Link
              href="/categories"
              className="text-xs font-semibold text-[#0052CC] hover:text-[#0747A6] inline-flex items-center gap-1.5 transition-colors group"
            >
              <span>View complete taxonomy</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* High-End Horizontal Editorial Directory */}
        <div className="divide-y divide-[#E4E4E7]">
          {CANONICAL_CATEGORIES.map((cat, idx) => {
            const count = counts[cat.key];
            const isComingSoon = Boolean(cat.isComingSoon);
            const num = String(idx + 1).padStart(2, "0");
            const sampleChemicals = CATEGORY_SAMPLE_CHEMICALS[cat.key] || [];

            return (
              <div
                key={cat.id}
                className="py-6 sm:py-8 px-2 sm:px-3 sm:-mx-3 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-2xs group"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-center">
                  
                  {/* Category Index & Name (4 cols) */}
                  <div className="md:col-span-4 flex items-baseline gap-4">
                    <span className="text-sm font-semibold text-slate-400 group-hover:text-[#0052CC] transition-colors">
                      {num}
                    </span>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] group-hover:text-[#0052CC] transition-colors tracking-tight">
                        {cat.name}
                      </h3>
                      {count ? (
                        <span className="text-xs font-medium text-emerald-700 block mt-0.5">
                          {count} listed {count === 1 ? "product" : "products"}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {isComingSoon ? "CMO services upcoming" : "Category available"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category Description & Reference Compounds (5 cols) */}
                  <div className="md:col-span-5 space-y-2.5">
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-xl">
                      {cat.description}
                    </p>

                    {sampleChemicals.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {sampleChemicals.map((chem) => (
                          <span
                            key={chem.cas}
                            className="px-2.5 py-1 bg-white group-hover:bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 transition-colors shadow-2xs"
                          >
                            {chem.name} ({chem.cas})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Link (3 cols) */}
                  <div className="md:col-span-3 flex justify-start md:justify-end">
                    {isComingSoon ? (
                      <span className="text-xs font-medium text-slate-400">
                        Launching soon
                      </span>
                    ) : (
                      <Link
                        href={`/categories/${cat.id}`}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#0052CC] group-hover:translate-x-1.5 transition-transform"
                      >
                        <span>Explore category</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}