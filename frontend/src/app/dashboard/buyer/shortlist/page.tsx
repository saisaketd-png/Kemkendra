"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Bookmark,
  Building2,
  ShieldCheck,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Eye,
  FileCheck,
  Send,
  Star
} from "lucide-react";
import { authenticatedFetch } from "@/features/auth/api/authenticatedFetch";
import RfqModal from "@/features/rfq/components/RfqModal";
import { useToast } from "@/shared/context/ToastContext";

export default function BuyerShortlistPage() {
  const toast = useToast();
  const [shortlist, setShortlist] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rfqItem, setRfqItem] = useState<any | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadShortlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authenticatedFetch("/api/v1/buyer/shortlists");
      if (!res.ok) throw new Error("Failed to load buyer shortlist");
      const data = await res.json();
      setShortlist(data);
    } catch (e: any) {
      setError(e.message || "Failed to load buyer shortlist");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShortlist();
  }, [loadShortlist]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      setRemovingId(itemId);
      const res = await authenticatedFetch(`/api/v1/buyer/shortlists/items/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove item from shortlist");
      toast.success("Offering removed from shortlist");
      await loadShortlist();
    } catch (e: any) {
      toast.error(e.message || "Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center text-xs font-bold text-slate-500">
        Loading Saved Sourcing Shortlist...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-[#0F172A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#091E42] tracking-tight flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-amber-500 fill-amber-500" />
              <span>Buyer Sourcing Shortlist ({shortlist?.totalItems || 0})</span>
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Saved commercial offerings, side-by-side specification comparison, and direct RFQ sourcing desk.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadShortlist()}
          className="h-9 px-3.5 bg-white border border-slate-200 hover:bg-[#F8F9FA] text-[#0F172A] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-2xs press-tactile cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Shortlist</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Shortlist Table / Grid */}
      {shortlist?.items && shortlist.items.length > 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-tactile-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-slate-200 text-[#64748B] font-semibold text-xs">
                <tr>
                  <th className="px-4 py-3">Master Chemical</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Price & Currency</th>
                  <th className="px-4 py-3">Purity & Grade</th>
                  <th className="px-4 py-3">MOQ & Lead</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {shortlist.items.map((item: any) => (
                  <tr key={item.itemId} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-4 py-4">
                      <strong className="text-[#0F172A] font-bold text-sm block">{item.masterProductName}</strong>
                      <span className="text-[11px] text-slate-400 block">{item.masterProductCode}</span>
                      {item.casNumber && <span className="text-[#64748B] text-[11px]">CAS: {item.casNumber}</span>}
                    </td>
                    <td className="px-4 py-4">
                      <strong className="text-[#0F172A] font-semibold block">{item.supplierName}</strong>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold inline-block mt-0.5">
                        {item.supplierVerificationStatus || "Verified"}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-[#0F172A] text-sm">
                      {item.currency} {item.price?.toLocaleString()} / kg
                    </td>
                    <td className="px-4 py-4">
                      <strong className="text-[#0F172A] font-semibold block">{item.purity ? `${item.purity}%` : "N/A"}</strong>
                      <span className="text-[#64748B] text-[11px]">{item.grade || "Standard"}</span>
                    </td>
                    <td className="px-4 py-4">
                      <strong className="text-[#0F172A] font-semibold block">{item.moqKg ? `${item.moqKg} kg` : "N/A"}</strong>
                      <span className="text-[#64748B] text-[11px]">{item.leadTimeDays ? `${item.leadTimeDays} Days` : "Immediate"}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${item.masterProductCode || item.masterProductId}`}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="View Product Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          disabled={removingId === item.itemId}
                          onClick={() => handleRemoveItem(item.itemId)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Remove from shortlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRfqItem(item)}
                          className="h-8 px-3.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs press-tactile cursor-pointer"
                        >
                          Request Quote
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/90 shadow-tactile-card space-y-3 p-6 max-w-lg mx-auto">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A]">No Saved Chemical Offerings</h3>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              You have not saved any chemical offerings to your shortlist yet. Browse the Master Chemical Catalog and save offerings for side-by-side procurement comparison.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 h-9 px-4 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors press-tactile"
            >
              Browse Chemical Catalog
            </Link>
          </div>
        </div>
      )}

      {rfqItem && (
        <RfqModal
          isOpen={!!rfqItem}
          onClose={() => setRfqItem(null)}
          masterProductId={rfqItem.masterProductId}
          supplierOfferingId={rfqItem.supplierOfferingId}
          productName={rfqItem.masterProductName}
          supplierId={rfqItem.supplierId}
          supplierName={rfqItem.supplierName}
          supplierCountry={"India"}
          defaultQuantity={rfqItem.moqKg}
        />
      )}
    </div>
  );
}
