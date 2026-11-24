import React from "react";

interface ChemicalStructureVisualProps {
  chemicalName?: string;
  casNumber?: string;
  category?: string;
  className?: string;
}

export function ChemicalStructureVisual({
  chemicalName = "Chemical Compound",
  casNumber,
  category,
  className = "w-full h-full",
}: ChemicalStructureVisualProps) {
  // Select an appropriate chemical skeleton representation based on name/category
  const nameLower = chemicalName.toLowerCase();
  const isAromatic =
    nameLower.includes("paracetamol") ||
    nameLower.includes("acetaminophen") ||
    nameLower.includes("ibuprofen") ||
    nameLower.includes("benzene") ||
    nameLower.includes("phenol") ||
    nameLower.includes("carbazole") ||
    nameLower.includes("aspirin") ||
    nameLower.includes("chloride") ||
    nameLower.includes("sulfonyl") ||
    nameLower.includes("amine") ||
    nameLower.includes("api");

  const isSolvent =
    nameLower.includes("alcohol") ||
    nameLower.includes("ipa") ||
    nameLower.includes("methanol") ||
    nameLower.includes("ethanol") ||
    nameLower.includes("acetone") ||
    nameLower.includes("acetic") ||
    nameLower.includes("acid") ||
    nameLower.includes("glycol") ||
    nameLower.includes("solvent");

  return (
    <div
      className={`relative flex flex-col items-center justify-center bg-white p-2 select-none group/chem ${className}`}
    >
      {/* 2D Molecular Skeletal Diagram */}
      <svg
        viewBox="0 0 200 120"
        className="w-full h-full max-h-36 max-w-[200px] text-slate-700 stroke-slate-800 transition-all duration-300 group-hover:scale-102"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isAromatic ? (
          /* Aromatic / Benzene Ring with Functional Group Bonds */
          <g strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            {/* Hexagonal Benzene Ring */}
            <polygon
              points="100,28 124,42 124,70 100,84 76,70 76,42"
              className="stroke-slate-900"
            />
            {/* Alternating Conjugated Double Bonds */}
            <line x1="98" y1="35" x2="118" y2="46" className="stroke-slate-700" />
            <line x1="119" y1="67" x2="100" y2="78" className="stroke-slate-700" />
            <line x1="80" y1="46" x2="80" y2="66" className="stroke-slate-700" />

            {/* Top Functional Group (Hydroxyl -OH) */}
            <line x1="100" y1="28" x2="100" y2="14" className="stroke-slate-900" />
            <text
              x="100"
              y="10"
              fontSize="9"
              fontWeight="700"
              fontFamily="var(--font-mono), monospace"
              fill="#059669"
              textAnchor="middle"
            >
              OH
            </text>

            {/* Bottom Functional Group (Amide Chain -NH-CO-CH3) */}
            <line x1="100" y1="84" x2="100" y2="96" className="stroke-slate-900" />
            <text
              x="100"
              y="106"
              fontSize="8"
              fontWeight="700"
              fontFamily="var(--font-mono), monospace"
              fill="#0052CC"
              textAnchor="middle"
            >
              NH
            </text>
            <line x1="108" y1="103" x2="124" y2="103" className="stroke-slate-900" />
            <line x1="124" y1="103" x2="135" y2="93" className="stroke-slate-900" />
            {/* Carbonyl Oxygen double bond */}
            <line x1="123" y1="103" x2="123" y2="114" className="stroke-rose-600" />
            <line x1="126" y1="103" x2="126" y2="114" className="stroke-rose-600" />
            <text
              x="124"
              y="122"
              fontSize="7"
              fontWeight="700"
              fontFamily="var(--font-mono), monospace"
              fill="#DC2626"
              textAnchor="middle"
            >
              O
            </text>
            <text
              x="142"
              y="95"
              fontSize="7"
              fontWeight="700"
              fontFamily="var(--font-mono), monospace"
              fill="#475569"
              textAnchor="middle"
            >
              CH₃
            </text>
          </g>
        ) : isSolvent ? (
          /* Branched / Aliphatic Chain */
          <g strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            {/* Skeletal chain */}
            <line x1="45" y1="70" x2="75" y2="50" className="stroke-slate-900" />
            <line x1="75" y1="50" x2="105" y2="70" className="stroke-slate-900" />
            <line x1="105" y1="70" x2="135" y2="50" className="stroke-slate-900" />
            <line x1="135" y1="50" x2="165" y2="70" className="stroke-slate-900" />

            {/* Functional branches */}
            <line x1="105" y1="70" x2="105" y2="92" className="stroke-slate-900" />
            <text
              x="105"
              y="102"
              fontSize="9"
              fontWeight="700"
              fontFamily="var(--font-mono), monospace"
              fill="#059669"
              textAnchor="middle"
            >
              OH
            </text>

            <line x1="135" y1="50" x2="135" y2="28" className="stroke-rose-600" />
            <line x1="138" y1="50" x2="138" y2="28" className="stroke-rose-600" />
            <text
              x="136"
              y="22"
              fontSize="8"
              fontWeight="700"
              fontFamily="var(--font-mono), monospace"
              fill="#DC2626"
              textAnchor="middle"
            >
              =O
            </text>
          </g>
        ) : (
          /* Polycyclic / Complex Intermediates */
          <g strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polygon
              points="80,35 105,50 105,80 80,95 55,80 55,50"
              className="stroke-slate-900"
            />
            <line x1="78" y1="42" x2="99" y2="54" className="stroke-slate-700" />
            <line x1="100" y1="77" x2="80" y2="89" className="stroke-slate-700" />
            <polygon
              points="105,50 130,35 155,50 155,80 130,95 105,80"
              className="stroke-slate-900"
            />
            <line x1="130" y1="42" x2="151" y2="54" className="stroke-slate-700" />
            <line x1="151" y1="77" x2="130" y2="89" className="stroke-slate-700" />
            <line x1="155" y1="50" x2="175" y2="40" className="stroke-slate-900" />
            <text
              x="184"
              y="40"
              fontSize="8"
              fontWeight="700"
              fontFamily="var(--font-mono), monospace"
              fill="#0052CC"
              textAnchor="middle"
            >
              Cl
            </text>
          </g>
        )}
      </svg>

      {/* Subtle 2D Structure Technical Watermark */}
      <div className="absolute bottom-1 right-1.5 text-[8px] font-mono text-slate-400 tracking-wider uppercase select-none opacity-60">
        2D Structure
      </div>
    </div>
  );
}
