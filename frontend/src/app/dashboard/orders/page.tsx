"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, RefreshCw, ArrowRight, ShoppingBag, Package, ChevronRight, Filter } from "lucide-react";
import { getBuyerOrders } from "@/features/order/api/getBuyerOrders";
import { PurchaseOrderResponse } from "@/features/order/api/createOrder";
import { PageHeader, StatusBadge } from "@/shared/components/ui/KemkendraUI";

type StatusFilter =
  | "ALL"
  | "PLACED"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY_FOR_DISPATCH"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";
type SortOption = "DATE_DESC" | "DATE_ASC" | "VALUE_DESC" | "VALUE_ASC";

export default function BuyerOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<PurchaseOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("DATE_DESC");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBuyerOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const totalCount = orders.length;
  const placedCount = useMemo(() => orders.filter((o) => o.status === "PLACED" || o.status === "PENDING_CONFIRMATION").length, [orders]);
  const confirmedCount = useMemo(() => orders.filter((o) => o.status === "CONFIRMED").length, [orders]);
  const processingCount = useMemo(() => orders.filter((o) => o.status === "PROCESSING" || o.status === "READY_FOR_DISPATCH").length, [orders]);
  const transitCount = useMemo(() => orders.filter((o) => o.status === "SHIPPED" || o.status === "DISPATCHED" || o.status === "IN_TRANSIT").length, [orders]);
  const deliveredCount = useMemo(() => orders.filter((o) => o.status === "DELIVERED" || o.status === "COMPLETED").length, [orders]);
  const disputedCount = useMemo(() => orders.filter((o) => o.status === "DISPUTED").length, [orders]);

  // Total active commercial volume
  const totalActiveValueFormatted = useMemo(() => {
    let total = 0;
    let currency = "INR";
    orders.forEach((o) => {
      if (o.status !== "CANCELLED" && o.status !== "REJECTED") {
        total += o.totalAmount;
        if (o.currency) currency = o.currency;
      }
    });
    return `${currency} ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (statusFilter !== "ALL") {
          if (statusFilter === "PLACED" && (order.status === "PLACED" || order.status === "PENDING_CONFIRMATION")) {
            // matches
          } else if (statusFilter === "DISPATCHED" && (order.status === "DISPATCHED" || order.status === "SHIPPED")) {
            // matches
          } else if (order.status !== statusFilter) {
            return false;
          }
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesPo = (order.poNumber || "").toLowerCase().includes(q);
          const matchesRfq = (order.rfqId || "").toLowerCase().includes(q);
          const matchesId = (order.id || "").toLowerCase().includes(q);
          const matchesProduct =
            (order.productName || "").toLowerCase().includes(q) ||
            (order.productId ? order.productId.toLowerCase().includes(q) : false);
          const matchesSupplier = String(order.supplierId).includes(q);
          return matchesPo || matchesRfq || matchesId || matchesProduct || matchesSupplier;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "DATE_DESC") return new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime();
        if (sortBy === "DATE_ASC") return new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime();
        if (sortBy === "VALUE_DESC") return b.totalAmount - a.totalAmount;
        if (sortBy === "VALUE_ASC") return a.totalAmount - b.totalAmount;
        return 0;
      });
  }, [orders, statusFilter, searchQuery, sortBy]);

  const summaryMetrics = [
    {
      label: "Total Orders",
      value: totalCount,
      subtext: `${totalActiveValueFormatted} active`,
      active: statusFilter === "ALL",
      onClick: () => setStatusFilter("ALL"),
    },
    {
      label: "Awaiting Confirmation",
      value: placedCount,
      subtext: placedCount > 0 ? "Pending supplier" : "All confirmed",
      active: statusFilter === "PLACED",
      onClick: () => setStatusFilter("PLACED"),
    },
    {
      label: "In Preparation",
      value: confirmedCount + processingCount,
      subtext: "Batch synthesis & QC",
      active: statusFilter === "CONFIRMED" || statusFilter === "PROCESSING",
      onClick: () => setStatusFilter("PROCESSING"),
    },
    {
      label: "In Transit",
      value: transitCount,
      subtext: `${transitCount} consignments moving`,
      active: statusFilter === "DISPATCHED" || statusFilter === "IN_TRANSIT",
      onClick: () => setStatusFilter("DISPATCHED"),
    },
    {
      label: "Delivered / Closed",
      value: deliveredCount,
      subtext: "Fulfillment complete",
      active: statusFilter === "DELIVERED" || statusFilter === "COMPLETED",
      onClick: () => setStatusFilter("DELIVERED"),
    },
  ];

  return (
    <div className="space-y-5 pb-16 text-[#0F172A]">
      {/* 1. Page Header */}
      <PageHeader
        title="Purchase Orders"
        description="Manage binding commercial purchase orders, track multi-stage chemical fulfillment milestones, and confirm receipts."
        actions={
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="h-9 px-3.5 bg-white border border-[#E4E4E7] hover:bg-[#FAFAFA] text-[#0F172A] text-xs font-medium rounded-[6px] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Ledger</span>
          </button>
        }
      />

      {/* 2. Structured Operational KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        {summaryMetrics.map((m, idx) => (
          <button
            key={idx}
            type="button"
            onClick={m.onClick}
            className={`p-3.5 bg-white border rounded-xl text-left transition-colors shadow-tactile-card group cursor-pointer ${
              m.active ? "border-[#0052CC] ring-1 ring-[#0052CC]" : "border-slate-200/90 hover:border-[#0052CC]"
            }`}
          >
            <span className="text-[11px] font-semibold text-[#64748B] block truncate">
              {m.label}
            </span>
            <strong className="text-xl font-bold text-[#0F172A] block mt-0.5 group-hover:text-[#0052CC] transition-colors">
              {m.value}
            </strong>
            <span className="text-xs text-[#64748B] block mt-0.5 truncate">
              {m.subtext}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Toolbar: Filter Tabs & Search */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-tactile-card flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PO number, RFQ, chemical or supplier..."
            className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-slate-300 rounded-lg text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
          />
        </div>

        {/* Filters & Sorting */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs font-medium text-[#64748B]">
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-[#0F172A] focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs cursor-pointer transition-colors"
          >
            <option value="DATE_DESC">Newest First</option>
            <option value="DATE_ASC">Oldest First</option>
            <option value="VALUE_DESC">Highest Value</option>
            <option value="VALUE_ASC">Lowest Value</option>
          </select>
        </div>
      </div>

      {/* 4. PO Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-tactile-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#64748B]">
            <div className="w-6 h-6 border-2 border-[#0052CC] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading purchase order ledger...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-2 max-w-md mx-auto">
            <Package className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-xs font-semibold text-[#0F172A]">
              No Purchase Orders Found
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {searchQuery || statusFilter !== "ALL"
                ? "No purchase orders match your current search or status filter."
                : "Confirmed purchase orders will appear here once an RFQ quotation is accepted."}
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/rfqs"
                className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#0052CC] text-white text-xs font-semibold rounded-lg hover:bg-[#0747A6] transition-colors shadow-xs press-tactile"
              >
                <span>Browse Active RFQs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 bg-[#F8F9FA] text-xs font-semibold text-[#64748B] border-b border-slate-200">
              <div className="col-span-2">PO Identifier</div>
              <div className="col-span-3">Chemical Compound</div>
              <div className="col-span-2">Supplier</div>
              <div className="col-span-2">Quantity & Volume</div>
              <div className="col-span-2">Order Value</div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            {/* Table Rows */}
            {filteredOrders.map((order) => {
              const currency = order.currency || "INR";
              return (
                <div
                  key={order.id}
                  onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                  className="p-4 lg:px-4 lg:py-3.5 hover:bg-[#F8F9FA] transition-colors cursor-pointer group flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 items-start lg:items-center"
                >
                  <div className="lg:col-span-2 min-w-0">
                    <span className="text-xs font-bold text-[#0052CC] group-hover:underline block">
                      {order.poNumber}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      {new Date(order.placedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="lg:col-span-3 min-w-0">
                    <span className="text-xs font-semibold text-[#0F172A] group-hover:text-[#0052CC] block truncate">
                      {order.productName || "Chemical Product Consignment"}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      RFQ-{order.rfqId ? order.rfqId.slice(0, 8).toUpperCase() : "N/A"}
                    </span>
                  </div>

                  <div className="lg:col-span-2 text-xs text-[#475569]">
                    Supplier #{order.supplierId}
                  </div>

                  <div className="lg:col-span-2 text-xs font-semibold text-[#0F172A]">
                    {order.quantity.toLocaleString()} {order.unit.toUpperCase()}
                  </div>

                  <div className="lg:col-span-2 text-xs font-bold text-[#0F172A]">
                    {currency} {order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  <div className="lg:col-span-1 flex items-center justify-between lg:justify-end gap-2 w-full lg:w-auto">
                    <StatusBadge status={order.status} />
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 lg:hidden" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
