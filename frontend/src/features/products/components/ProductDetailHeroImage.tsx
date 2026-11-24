"use client";

import { useState } from "react";
import { ChemicalStructureVisual } from "@/shared/components/ChemicalStructureVisual";

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
    <div className="relative w-full h-72 sm:h-80 md:h-[380px] rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 flex items-center justify-center overflow-hidden shadow-tactile-card">
      {shouldShowImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl!}
          alt={`${productName} chemical structure monograph`}
          className="w-full h-full object-contain p-2 aspect-[4/3]"
          onError={() => setHasError(true)}
          loading="eager"
          fetchPriority="high"
          width={600}
          height={380}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ChemicalStructureVisual
            chemicalName={productName}
            casNumber={casNumber || ""}
            category={category || ""}
            className="w-full h-full max-h-[340px]"
          />
        </div>
      )}
    </div>
  );
}
