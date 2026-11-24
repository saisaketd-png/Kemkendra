"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, RefreshCw, ArrowRight, CheckCircle2, Package } from "lucide-react";
import { getSupplierOrders } from "@/features/order/api/getSupplierOrders";
import { confirmOrder } from "@/features/order/api/confirmOrder";
import { PurchaseOrderResponse } from "@/features/order/api/createOrder";
import { PageHeader, StatusBadge, Button, SkeletonLoader } from "@/shared/components/ui/KemkendraUI";
import { useToast } from "@/shared/context/ToastContext";

type StatusFilter =
  | "ALL"
  | "PLACED"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY_FOR_DISPATCH"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";
type SortOption = "DATE_DESC" | "DATE_ASC" | "VALUE_DESC" | "VALUE_ASC";

export default function SupplierOrdersPage() {
  const toast = useToast();
  const router = useRouter();

  const [orders, setOrders] = useState<PurchaseOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("DATE_DESC");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSupplierOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load supplier purchase orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleQuickConfirm = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    try {
      setConfirmingId(orderId);
      await confirmOrder(orderId);
      toast.success("Purchase order confirmed successfully");
      await loadOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to confirm order");
    } finally {
      setConfirmingId(null);
    }
  };

  const totalCount = orders.length;
  const placedCount = useMemo(() => orders.filter((o) => o.status === "PLACED").length, [orders]);
  const confirmedCount = useMemo(() => orders.filter((o) => o.status === "CONFIRMED").length, [orders]);
  const processingCount = useMemo(() => orders.filter((o) => o.status === "PROCESSING").length, [orders]);
  const readyCount = useMemo(() => orders.filter((o) => o.status === "READY_FOR_DISPATCH").length, [orders]);
  const dispatchedCount = useMemo(() => orders.filter((o) => o.status === "DISPATCHED" || o.status === "SHIPPED").length, [orders]);
  const inTransitCount = useMemo(() => orders.filter((o) => o.status === "IN_TRANSIT").length, [orders]);
  const deliveredCount = useMemo(() => orders.filter((o) => o.status === "DELIVERED").length, [orders]);
  const completedCount = useMemo(() => orders.filter((o) => o.status === "COMPLETED").length, [orders]);
  const cancelledCount = useMemo(() => orders.filter((o) => o.status === "CANCELLED").length, [orders]);
  const disputedCount = useMemo(() => orders.filter((o) => o.status === "DISPUTED").length, [orders]);

  // Total active commercial volume
  const totalActiveValueFormatted = useMemo(() => {
    let total = 0;
    let currency = "USD";
    orders.forEach((o) => {
      if (o.status !== "CANCELLED") {
        total += o.totalAmount;
        if (o.currency) currency = o.currency;
      }
    });
    return `${currency} ${total.toLocaleString()}`;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (statusFilter !== "ALL" && order.status !== statusFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesPo = (order.poNumber || "").toLowerCase().includes(q);
          const matchesRfq = (order.rfqId || "").toLowerCase().includes(q);
          const matchesId = (order.id || "").toLowerCase().includes(q);
          const matchesProduct =
            (order.productName || "").toLowerCase().includes(q) ||
            (order.productId ? order.productId.toLowerCase().includes(q) : false);
          const matchesBuyer = (order.buyerId || "").toLowerCase().includes(q);
          return matchesPo || matchesRfq || matchesId || matchesProduct || matchesBuyer;
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
      subtext: `${totalActiveValueFormatted} active value`,
      active: statusFilter === "ALL",
      onClick: () => setStatusFilter("ALL"),
    },
    {
      label: "Action Required",
      value: placedCount,
      subtext: placedCount > 0 ? "Awaiting acceptance" : "All accepted",
      badgeVariant: placedCount > 0 ? "warning" : undefined,
      active: statusFilter === "PLACED",
      onClick: () => setStatusFilter("PLACED"),
    },
    {
      label: "Confirmed",
      value: confirmedCount,
      subtext: "Accepted commitments",
      active: statusFilter === "CONFIRMED",
      onClick: () => setStatusFilter("CONFIRMED"),
    },
    {
      label: "In Fulfillment",
      value: processingCount + readyCount + dispatchedCount + inTransitCount,
      subtext: `${dispatchedCount + inTransitCount} in transit`,
      active:
        statusFilter === "PROCESSING" ||
        statusFilter === "READY_FOR_DISPATCH" ||
        statusFilter === "DISPATCHED" ||
        statusFilter === "IN_TRANSIT" ||
        statusFilter === "SHIPPED",
      onClick: () => setStatusFilter("PROCESSING"),
    },
    {
      label: "Delivered",
      value: deliveredCount,
      subtext: "Fulfilled contracts",
      active: statusFilter === "DELIVERED",
      onClick: () => setStatusFilter("DELIVERED"),
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto space-y-5 text-[#0F172A]">
      {/* 1. Page Header */}
      <PageHeader
        title="Purchase Contracts Ledger"
        description="Review confirmed purchase orders, process manufacturing consignments, record shipments, and track deliveries."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-white text-[#0F172A] border border-slate-200 rounded-lg shadow-2xs">
              {placedCount > 0 ? `${placedCount} Action Required` : "All Contracts Confirmed"}
            </span>
            <button
              type="button"
              onClick={loadOrders}
              disabled={loading}
              className="h-9 px-3.5 text-xs font-semibold text-[#0F172A] bg-white border border-slate-200 hover:bg-[#F8F9FA] rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 press-tactile"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {/* 2. Compact Operational Metrics Strip */}
      {loading ? (
        <div className="bg-white p-4 border border-slate-200/90 rounded-xl shadow-tactile-card">
          <SkeletonLoader lines={2} />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {summaryMetrics.map((m, idx) => (
            <button
              key={idx}
              type="button"
              onClick={m.onClick}
              className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer block min-w-0 shadow-tactile-card group ${
                m.active
                  ? "bg-blue-50/50 border-[#0052CC] ring-1 ring-[#0052CC]"
                  : "bg-white border-slate-200/90 hover:border-[#0052CC]"
              }`}
            >
              <div className="text-[11px] font-semibold text-[#64748B] truncate mb-1">
                {m.label}
              </div>
              <div className="text-xl font-bold text-[#0F172A] tracking-tight group-hover:text-[#0052CC] transition-colors">
                {m.value}
              </div>
              <div className="text-[11px] text-[#64748B] truncate mt-0.5">
                {m.subtext}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 3. PO Workspace Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-tactile-card overflow-hidden">
        {/* Workspace Toolbar */}
        <div className="p-3.5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#F8F9FA]">
          {/* Search */}
          <div className="relative w-full md:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PO, RFQ, chemical, buyer..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 text-[#0F172A] placeholder:text-slate-400 shadow-2xs transition-colors"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {/* Desktop Status Filters */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 overflow-x-auto max-w-[580px]">
              {(
                [
                  "ALL",
                  "PLACED",
                  "CONFIRMED",
                  "PROCESSING",
                  "READY_FOR_DISPATCH",
                  "DISPATCHED",
                  "IN_TRANSIT",
                  "DELIVERED",
                  "COMPLETED",
                  "CANCELLED",
                  "DISPUTED",
                ] as StatusFilter[]
              ).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    statusFilter === f
                      ? "bg-white text-[#0052CC] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {f === "ALL"
                    ? "All"
                    : f === "PLACED"
                    ? "Action Required"
                    : f === "READY_FOR_DISPATCH"
                    ? "Ready"
                    : f === "DISPATCHED"
                    ? "Dispatched"
                    : f === "IN_TRANSIT"
                    ? "In Transit"
                    : f === "DISPUTED"
                    ? "Disputed"
                    : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Mobile Status Dropdown Filter */}
            <div className="sm:hidden w-full">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full text-xs bg-white border border-[#E4E4E7] rounded-[6px] px-3 py-1.5 font-medium text-[#0F172A] focus:outline-none focus:border-[#0052CC]"
              >
                <option value="ALL">All Statuses ({totalCount})</option>
                <option value="PLACED">Action Required ({placedCount})</option>
                <option value="CONFIRMED">Confirmed ({confirmedCount})</option>
                <option value="PROCESSING">Processing ({processingCount})</option>
                <option value="READY_FOR_DISPATCH">Ready for Dispatch ({readyCount})</option>
                <option value="DISPATCHED">Dispatched ({dispatchedCount})</option>
                <option value="IN_TRANSIT">In Transit ({inTransitCount})</option>
                <option value="DELIVERED">Delivered ({deliveredCount})</option>
                <option value="COMPLETED">Completed ({completedCount})</option>
                <option value="CANCELLED">Cancelled ({cancelledCount})</option>
                <option value="DISPUTED">Disputed ({disputedCount})</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs bg-white border border-[#E4E4E7] rounded-[6px] px-2.5 py-1.5 font-medium text-[#0F172A] focus:outline-none focus:border-[#0052CC] ml-auto sm:ml-0"
            >
              <option value="DATE_DESC">Newest First</option>
              <option value="DATE_ASC">Oldest First</option>
              <option value="VALUE_DESC">Highest Value</option>
              <option value="VALUE_ASC">Lowest Value</option>
            </select>
          </div>
        </div>

        {/* Data Table or Compact Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-2.5 max-w-md mx-auto">
            <Package className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-xs font-semibold text-[#0F172A]">
              No Purchase Orders Found
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {searchQuery || statusFilter !== "ALL"
                ? "No purchase orders match your current search or status filter."
                : "Confirmed buyer orders will appear here once a quotation is accepted and converted into an order."}
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/supplier/rfqs"
                className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#0052CC] text-white text-xs font-semibold rounded-lg hover:bg-[#0747A6] transition-colors shadow-xs press-tactile"
              >
                <span>View RFQ Inquiries</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-slate-200 text-xs font-semibold text-[#64748B]">
                  <th className="py-3 px-4">PO Reference</th>
                  <th className="py-3 px-4">Chemical / Monograph</th>
                  <th className="py-3 px-4">Buyer Organization</th>
                  <th className="py-3 px-4">Contract Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Placed Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredOrders.map((order) => {
                  const isPlaced = order.status === "PLACED";
                  return (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/dashboard/supplier/orders/${order.id}`)}
                      className="hover:bg-[#F8F9FA] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#0052CC] group-hover:underline">
                        {order.poNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#0F172A] group-hover:text-[#0052CC] block truncate">
                          {order.productName || "Chemical Product"}
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          {order.productId ? `ID: ${order.productId.slice(0, 8)}` : order.poNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#475569]">
                        Buyer #{order.buyerId ? order.buyerId.slice(0, 8) : "N/A"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                        {order.currency} {order.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-[#64748B]">
                        {new Date(order.placedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isPlaced ? (
                          <button
                            type="button"
                            onClick={(e) => handleQuickConfirm(e, order.id)}
                            disabled={confirmingId === order.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-xs press-tactile"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{confirmingId === order.id ? "Confirming..." : "Confirm PO"}</span>
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-[#0052CC] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                            <span>Manage</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
