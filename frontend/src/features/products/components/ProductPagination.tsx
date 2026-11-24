import Link from "next/link";
import { ProductQueryParams } from "../types/product";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductPaginationProps {
  queryParams: ProductQueryParams;
  totalElements: number;
  currentCount: number;
}

export function ProductPagination({
  queryParams,
  totalElements,
  currentCount,
}: ProductPaginationProps) {
  const currentPage = queryParams.page || 0;
  const pageSize = queryParams.size || 20;
  const totalPages = Math.ceil(totalElements / pageSize) || 1;
  const hasNext = currentPage + 1 < totalPages && currentCount >= pageSize;
  const hasPrev = currentPage > 0;

  const startCount = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endCount = Math.min(totalElements, currentPage * pageSize + currentCount);

  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && key !== "page") {
        params.set(key, String(val));
      }
    });
    params.set("page", String(targetPage));
    return `?${params.toString()}`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200/80 pt-6 gap-4">
      <div className="text-xs sm:text-sm text-[#64748B] font-medium">
        Showing <strong className="font-bold text-[#0F172A]">{startCount}–{endCount}</strong> of{" "}
        <strong className="font-bold text-[#0F172A]">{totalElements}</strong> chemicals
        <span className="text-slate-400 ml-1.5">(Page {currentPage + 1} of {Math.max(1, totalPages)})</span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={hasPrev ? buildPageUrl(currentPage - 1) : "#"}
          className={`h-9 px-3.5 border border-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs ${
            !hasPrev
              ? "text-slate-300 pointer-events-none bg-slate-50 border-slate-100"
              : "bg-white text-[#0F172A] hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100"
          }`}
          aria-disabled={!hasPrev}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </Link>

        <Link
          href={hasNext ? buildPageUrl(currentPage + 1) : "#"}
          className={`h-9 px-3.5 border border-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs ${
            !hasNext
              ? "text-slate-300 pointer-events-none bg-slate-50 border-slate-100"
              : "bg-white text-[#0F172A] hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100"
          }`}
          aria-disabled={!hasNext}
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}