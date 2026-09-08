"use client";

import { useState } from "react";
import { Atom, FileText, CheckCircle2 } from "lucide-react";

interface ProductDetailHeroImageProps {
  imageUrl?: string | null;
  productName: string;
  casNumber?: string | null;
  molecularFormula?: string | null;
  category?: string | null;
}

export function ProductDetailHeroImage({
  imageUrl,
  productName,
  casNumber,
  molecularFormula,
  category,
}: ProductDetailHeroImageProps) {
  const [hasError, setHasError] = useState(false);

  const shouldShowImage = Boolean(imageUrl) && !hasError;

  return (
    <div className="relative w-full h-72 sm:h-80 md:h-[380px] rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 flex items-center justify-center overflow-hidden shadow-2xs">
      {shouldShowImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl!}
          alt={`${productName} chemical structure monograph`}
          className="w-full h-full object-contain p-2"
          onError={() => setHasError(true)}
          loading="eager"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 max-w-sm space-y-3.5 select-none">
          {/* Scientific Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-[#0052CC] shadow-2xs">
            <Atom className="w-8 h-8 stroke-1.5 animate-pulse text-[#0052CC]" />
          </div>

          {/* Product Identification */}
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#0F172A] tracking-tight uppercase line-clamp-2">
              {productName}
            </h2>
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#64748B] flex-wrap">
              {casNumber && <span>CAS: {casNumber}</span>}
              {casNumber && molecularFormula && <span>&bull;</span>}
              {molecularFormula && <span>{molecularFormula}</span>}
            </div>
          </div>

          {/* Professional Explanatory Text */}
          <p className="text-xs text-[#64748B] leading-relaxed max-w-xs">
            Official technical monograph and verified identity standard. Compendial specifications, COA, and analytical dossier available upon inquiry.
          </p>

          {/* Verified Quality Tag */}
          <div className="pt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
              <CheckCircle2 className="w-3 h-3" /> Standard Verified
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase bg-slate-50 text-slate-600 border border-slate-200">
              <FileText className="w-3 h-3 text-[#0052CC]" /> Technical Dossier
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
