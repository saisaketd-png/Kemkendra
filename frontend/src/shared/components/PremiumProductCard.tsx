import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ChemicalStructureVisual } from "@/shared/components/ChemicalStructureVisual";

export interface PremiumProduct {
  id: string;
  name: string;
  casNumber: string;
  category: string;
  purity?: string;
  stockStatus?: "In Stock" | "Low Stock" | "Made to Order";
  supplier: {
    id: string;
    name: string;
    isVerified: boolean;
    country: string;
    countryCode: string;
  };
  moq: string;
  image?: string;
}

interface PremiumProductCardProps {
  product: PremiumProduct;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function PremiumProductCard({ product }: PremiumProductCardProps) {
  const status = product.stockStatus || "In Stock";
  const resolvedImageUrl = product.image
    ? product.image.startsWith("http")
      ? product.image
      : `${API_URL}${product.image}`
    : null;

  return (
    <div className="group flex flex-col bg-white border border-[#E4E4E7] hover:border-[#0052CC] rounded-[12px] overflow-hidden transition-all shadow-tactile-card card-elevation">
      {/* 1. Technical Product Image / Chemical Structure */}
      <div className="relative h-48 bg-[#FAFAFA] border-b border-[#E4E4E7] flex items-center justify-center p-4 overflow-hidden">
        {resolvedImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedImageUrl}
            alt={`${product.name} chemical sample`}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <ChemicalStructureVisual
            chemicalName={product.name}
            casNumber={product.casNumber}
            category={product.category}
            className="w-full h-full transition-transform duration-300 group-hover:scale-102"
          />
        )}
      </div>

      {/* 2. Technical Metadata & Specifications */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#0052CC] font-semibold">
              {product.category ? product.category.replace(/_/g, " ") : "Specialty Chemical"}
            </span>
            <span className="text-slate-500 font-medium text-[11px]">
              {status}
            </span>
          </div>

          <Link
            href={`/products/${product.id}`}
            className="font-bold text-base text-[#0F172A] group-hover:text-[#0052CC] transition-colors line-clamp-1 uppercase tracking-tight block"
          >
            {product.name}
          </Link>
          <div className="text-xs font-mono text-[#64748B]">
            CAS: <strong className="text-[#0F172A] font-semibold">{product.casNumber}</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 py-2.5 border-y border-[#F1F5F9] text-xs">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] block font-mono">
              Purity Spec
            </span>
            <strong className="text-[#059669] font-semibold text-xs mt-0.5 block">
              {product.purity || "99.0%"}
            </strong>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] block font-mono">
              Lot MOQ
            </span>
            <strong className="text-[#0F172A] font-semibold font-mono text-xs mt-0.5 block">
              {product.moq}
            </strong>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between gap-2">
          <Link
            href={`/rfq?productId=${product.id}&productName=${encodeURIComponent(product.name)}`}
            className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-[6px] text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-xs press-tactile"
          >
            <span>Quick RFQ</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <Link
            href={`/products/${product.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#0052CC] transition-colors"
          >
            <span>Specs & COA</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
