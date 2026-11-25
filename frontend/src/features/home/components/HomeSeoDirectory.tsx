import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  Building2,
  HelpCircle,
  Truck,
  CheckCircle2,
  ArrowRight,
  FlaskConical,
  Layers,
  MapPin,
  ExternalLink,
} from "lucide-react";

export function HomeSeoDirectory() {
  const chemicalCategories = [
    {
      name: "Active Pharmaceutical Ingredients (APIs)",
      description: "Compendial grade bulk actives complying with IP, BP, USP, and EP monographs with DMF / CEP technical packages.",
      link: "/categories/api",
      keywords: ["Paracetamol IP", "Ibuprofen USP", "Metformin HCl", "Azithromycin"],
    },
    {
      name: "Pharmaceutical Intermediates & KSMs",
      description: "Key Starting Materials, pyridine derivatives, piperidines, and custom chiral building blocks for multi-step organic synthesis.",
      link: "/categories/intermediate",
      keywords: ["Advanced Intermediates", "KSMs", "Chiral Building Blocks", "Penultimate Intermediates"],
    },
    {
      name: "High-Purity Industrial Solvents",
      description: "HPLC grade, spectrophotometric, and anhydrous bulk solvents with moisture thresholds strictly below 0.01%.",
      link: "/categories/solvent",
      keywords: ["Isopropyl Alcohol (IPA)", "Methanol Pure", "Dichloromethane (DCM)", "Acetone ACS"],
    },
    {
      name: "Specialty & Fine Chemicals",
      description: "Catalysts, phase transfer agents, chelators, and electronic-grade chemicals manufactured to custom technical specs.",
      link: "/categories/specialty-chemical",
      keywords: ["Custom Synthesis", "Phase Transfer Catalysts", "Chelating Agents", "Polymer Additives"],
    },
    {
      name: "Pharmaceutical Excipients & Binders",
      description: "Direct-compression binders, disintegrants, solubilizers, and lubricants for oral solid dosage formulations.",
      link: "/categories/excipient",
      keywords: ["Microcrystalline Cellulose", "PVP K-30", "Magnesium Stearate", "Croscarmellose"],
    },
    {
      name: "Bulk Industrial & Agrochemical Inputs",
      description: "Bulk inorganic acids, alkalis, technical grade actives, and intermediates for large-scale agrochemical manufacturing.",
      link: "/chemicals",
      keywords: ["Caustic Soda Flakes", "Hydrochloric Acid 33%", "Sulfuric Acid", "Technical Actives"],
    },
  ];

  const industrialHubs = [
    {
      city: "Dahej PCPIR & Bharuch",
      state: "Gujarat",
      description: "Petroleum, Chemicals & Petrochemicals Investment Region — India's largest hub for bulk petrochemicals, basic chemicals, and synthetic resins.",
    },
    {
      city: "Ankleshwar, Vapi & Panoli",
      state: "Gujarat",
      description: "World-renowned chemical synthesis cluster housing hundreds of ISO/cGMP certified pharmaceutical intermediate and fine chemical plants.",
    },
    {
      city: "Hyderabad Genome Valley & Pharma City",
      state: "Telangana",
      description: "Global epicenter for compendial Active Pharmaceutical Ingredients (APIs), contract research (CRO), and custom manufacturing (CDMO).",
    },
    {
      city: "Tarapur & Navi Mumbai MIDC",
      state: "Maharashtra",
      description: "Specialized hub for specialty chemicals, laboratory analytical reagents, performance additives, and bulk solvent repackaging.",
    },
  ];

  const faqs = [
    {
      question: "How does KemKendra verify chemical suppliers and manufacturers?",
      answer:
        "Every supplier on KemKendra undergoes a rigorous 4-stage technical verification: commercial registration (GSTIN / IEC), manufacturing site audits (ISO 9001:2015, WHO-cGMP, FDA inspection status), batch Certificate of Analysis (COA) history, and financial standing. We connect buyers directly with primary synthesizers, eliminating unverified intermediary brokers.",
    },
    {
      question: "What pharmacopeial and purity grades are available for bulk procurement?",
      answer:
        "KemKendra supports compendial grades including Indian Pharmacopoeia (IP), British Pharmacopoeia (BP), United States Pharmacopeia (USP), European Pharmacopoeia (Ph. Eur. / EP), and Japanese Pharmacopoeia (JP). For industrial and laboratory use, we offer ACS Reagent Grade, HPLC Grade, Electronic Grade (EG), and Technical Grade specifications.",
    },
    {
      question: "Can I request custom chemical synthesis or contract manufacturing (CDMO)?",
      answer:
        "Yes. Through our dedicated KemKendra Sourcing Desk, buyers can submit chemical structures, CAS registry numbers, required purity thresholds, and batch volumes for custom synthesis campaigns, pilot scaling, or commercial manufacturing under strict Non-Disclosure Agreements (NDAs).",
    },
    {
      question: "What technical documentation is provided with chemical shipments?",
      answer:
        "Every shipment comes standard with a lot-specific Certificate of Analysis (COA) showing HPLC/GC purity assays and residual solvents, a 16-section GHS Safety Data Sheet (SDS/MSDS), and Technical Data Sheets (TDS). For pharmaceutical actives, Drug Master File (DMF) open parts and CEP documentation are available upon request.",
    },
    {
      question: "What bulk packaging and hazardous materials (Hazmat) options are supported?",
      answer:
        "Chemicals are dispatched in UN-certified packaging tailored to material properties: ISO Tank Containers (20,000L–26,000L) for bulk solvents, Intermediate Bulk Containers (IBC Totes 1,000L), 200L Tight-Head Steel and HDPE Drums, 25kg/50kg UN-rated fiber drums with poly liners, and glass carboys for high-purity acids.",
    },
  ];

  return (
    <section className="py-10 sm:py-20 bg-white border-b border-slate-200 w-full max-w-full overflow-hidden">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 w-full">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0052CC] bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-md inline-block">
            B2B Chemical Procurement Knowledge Hub & Directory
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#091E42] tracking-tight">
            Comprehensive Chemical Sourcing, Technical Compliance & Industrial Corridors
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            KemKendra bridges global chemical procurement officers, pharmaceutical manufacturers, and research institutions with audited primary chemical manufacturing plants across India.
          </p>
        </div>

        {/* 1. Categorized Chemical Directory Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-lg sm:text-xl font-bold text-[#091E42] flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#0052CC]" />
              <span>Core Chemical Product Classifications</span>
            </h3>
            <Link
              href="/chemicals"
              className="text-xs font-bold text-[#0052CC] hover:underline flex items-center gap-1"
            >
              <span>View All 200+ Chemicals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chemicalCategories.map((cat) => (
              <div
                key={cat.name}
                className="p-5 rounded-2xl border border-slate-200 bg-[#F8F9FA] hover:bg-white hover:border-blue-300 hover:shadow-tactile-card transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#091E42] hover:text-[#0052CC] transition-colors">
                    <Link href={cat.link}>{cat.name}</Link>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/70 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                    Common Inquiries & Compounds:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.keywords.map((kw) => (
                      <Link
                        key={kw}
                        href={`/products?search=${encodeURIComponent(kw)}`}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:text-[#0052CC] hover:border-blue-300 transition-colors"
                      >
                        {kw}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. India's Chemical Manufacturing Corridors */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-lg sm:text-xl font-bold text-[#091E42] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>India’s Leading Chemical Synthesis & API Corridors</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Direct supplier partnerships across India’s primary chemical industrial development zones (GIDC, MIDC, TSIIC).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {industrialHubs.map((hub) => (
              <div
                key={hub.city}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#091E42]">{hub.city}</span>
                  <span className="text-[10px] font-mono uppercase font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {hub.state}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {hub.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Technical Assurance & Quality Control Badges */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#091E42] text-white space-y-6">
          <div className="max-w-2xl space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
              Institutional Quality Standard
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Chemical Procurement Governed by Pharmacopeial & Regulatory Proof
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Zero compromises on purity, traceability, or supply chain chain-of-custody.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 space-y-1.5">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <FileText className="w-4 h-4" />
                <span>Batch COA Verification</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Lot-specific HPLC, GC, Karl Fischer water assay, and heavy metals ICP-OES limits with every dispatch.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>WHO-cGMP & ISO 9001</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Audited production facilities adhering to Current Good Manufacturing Practices and international quality management.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Layers className="w-4 h-4" />
                <span>16-Section GHS SDS</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Full transport classification, toxicological data, and emergency response measures compliant with OSHA & REACH.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 space-y-1.5">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Truck className="w-4 h-4" />
                <span>UN-Certified Bulk Packaging</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Dedicated ISO tanks, Intermediate Bulk Containers (IBC), and tamper-evident steel drums for hazardous cargo.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Frequently Asked Questions (FAQ) with Schema Compatibility */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-lg sm:text-xl font-bold text-[#091E42] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#0052CC]" />
              <span>Frequently Asked Questions (Chemical Buyers & Procurement Teams)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Essential answers regarding supplier vetting, minimum orders, analytical documentation, and custom synthesis.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl border border-slate-200/90 bg-[#F8F9FA] space-y-2.5"
              >
                <h4 className="text-sm font-bold text-[#091E42] flex items-start gap-2">
                  <span className="text-[#0052CC] font-mono text-xs mt-0.5">Q{index + 1}.</span>
                  <span>{faq.question}</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
