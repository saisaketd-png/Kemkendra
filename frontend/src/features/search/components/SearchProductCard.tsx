import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  Globe2,
  CheckCircle2,
  ArrowRight,
  FlaskConical,
  Building2,
  Sparkles,
} from "lucide-react";
import { SearchProductCardResponse } from "../types/searchTypes";

interface SearchProductCardProps {
  product: SearchProductCardResponse;
}

export function SearchProductCard({ product }: SearchProductCardProps) {
  // Format indicative price
  const formatPrice = () => {
    if (product.minStartingPrice !== undefined && product.minStartingPrice !== null && product.minStartingPrice > 0) {
      const currency = product.currency || "USD";
      const symbol = currency === "INR" ? "₹" : "$";
      return `${symbol}${Number(product.minStartingPrice).toFixed(2)}`;
    }
    return null;
  };

  const indicativePrice = formatPrice();

  return (
    <article className="bg-white rounded-[10px] border border-[#E2E8F0] hover:border-[#0052CC]/40 hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between gap-4">
      {/* Top: Header with Category, Score & Product Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#0052CC] border border-[#BFDBFE] uppercase">
              {product.category?.replace(/_/g, " ")}
            </span>
            {product.grade && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-[#475569] border border-slate-200">
                Grade: {product.grade}
              </span>
            )}
          </div>

          {product.relevanceScore > 75 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-500" />
              High Relevance
            </span>
          )}
        </div>

        <div>
          <Link
            href={`/products/${product.id}`}
            className="text-base sm:text-lg font-bold text-[#0F172A] hover:text-[#0052CC] transition-colors leading-tight inline-block"
          >
            {product.name}
          </Link>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#64748B]">
            {product.casNumber && (
              <span className="font-mono">
                <strong className="text-[#334155]">CAS:</strong> {product.casNumber}
              </span>
            )}
            {product.molecularFormula && (
              <span className="font-mono">
                <strong className="text-[#334155]">Formula:</strong> {product.molecularFormula}
              </span>
            )}
            {product.masterProductCode && (
              <span className="font-mono text-[11px] text-[#94A3B8]">
                Code: {product.masterProductCode}
              </span>
            )}
          </div>
        </div>

        {product.description && (
          <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
      </div>

      {/* Middle: Technical Specs & Benchmark Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 border-y border-[#F1F5F9] bg-[#FAFAFA] -mx-4 sm:-mx-5 px-4 sm:px-5">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#64748B] block">
            Purity Specifications
          </span>
          <span className="text-xs sm:text-sm font-semibold text-[#0F172A] font-mono">
            {product.minPurity !== undefined && product.minPurity !== null
              ? `${product.minPurity}%${product.maxPurity && product.maxPurity > product.minPurity ? ` - ${product.maxPurity}%` : " min"}`
              : "Standard Commercial Purity"}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase text-[#64748B] block">
            Indicative Benchmark Price*
          </span>
          <div className="flex items-baseline gap-1">
            {indicativePrice ? (
              <>
                <span className="text-sm sm:text-base font-extrabold text-[#006644] font-mono">
                  {indicativePrice}
                </span>
                <span className="text-[11px] text-[#64748B]">/ kg</span>
              </>
            ) : (
              <span className="text-xs font-medium text-[#64748B] italic">
                Quote on Request (RFQ)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Supplier Summary & Compliance Badges */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#475569]">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
            <span>
              <strong>{product.offeringCount}</strong> {product.offeringCount === 1 ? "Supplier Offering" : "Supplier Offerings"}
            </span>
            {product.verifiedSupplierCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#006644] bg-[#E3FCEF] px-1.5 py-0.2 rounded">
                <ShieldCheck className="w-3 h-3 text-[#00875A]" />
                {product.verifiedSupplierCount} Verified
              </span>
            )}
          </div>

          {product.countries && product.countries.length > 0 && (
            <span className="text-[11px] text-[#64748B] truncate max-w-[150px]">
              Origins: {product.countries.slice(0, 2).join(", ")}
              {product.countries.length > 2 ? ` +${product.countries.length - 2}` : ""}
            </span>
          )}
        </div>

        {/* Verification badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {product.coaAvailable && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#334155] bg-white border border-[#CBD5E1] px-2 py-0.5 rounded-full">
              <FileText className="w-3 h-3 text-[#0052CC]" />
              COA Available
            </span>
          )}
          {product.msdsAvailable && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#334155] bg-white border border-[#CBD5E1] px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-[#00875A]" />
              MSDS / SDS
            </span>
          )}
          {product.exportReady && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#334155] bg-white border border-[#CBD5E1] px-2 py-0.5 rounded-full">
              <Globe2 className="w-3 h-3 text-[#6554C0]" />
              Export Ready
            </span>
          )}
        </div>
      </div>

      {/* Bottom: Action Buttons */}
      <div className="pt-2 flex items-center gap-2">
        <Link
          href={`/products/${product.id}`}
          className="flex-1 h-9 px-3 bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#0F172A] font-semibold text-xs rounded-[6px] transition-colors flex items-center justify-center gap-1.5"
        >
          <span>View Catalog Spec</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
        </Link>
        <Link
          href={`/rfq?masterProductId=${product.id}${product.name ? `&chemicalName=${encodeURIComponent(product.name)}` : ""}${product.casNumber ? `&casNumber=${encodeURIComponent(product.casNumber)}` : ""}`}
          className="h-9 px-4 bg-[#0052CC] hover:bg-[#0747A6] text-white font-semibold text-xs rounded-[6px] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
        >
          <span>Request Quote</span>
        </Link>
      </div>
    </article>
  );
}
