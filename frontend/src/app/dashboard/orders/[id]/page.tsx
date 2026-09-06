"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBuyerOrder } from "@/features/order/api/getBuyerOrder";
import { PurchaseOrderResponse } from "@/features/order/api/createOrder";
import {
  ShipmentResponse,
  getShipment,
  confirmReceiptBuyer,
  completeOrder,
  cancelBuyerOrder,
} from "@/features/order/api/fulfillment";
import { CompleteOrderModal } from "@/features/order/components/CompleteOrderModal";
import { CancelOrderModal } from "@/features/order/components/CancelOrderModal";
import { OrderInvoicePaymentCard } from "@/features/order/components/OrderInvoicePaymentCard";
import { OrderTimelineSection } from "@/features/order/components/OrderTimelineSection";
import { GenericDocumentManager } from "@/features/documents/components/GenericDocumentManager";
import { getSupplierPublicProfile } from "@/features/suppliers/api";
import { SupplierPublicProfile } from "@/features/suppliers/types";
import { useToast } from "@/shared/context/ToastContext";
import {
  ProcurementBreadcrumb,
  ProcurementHero,
  CommercialMetricRibbon,
  WorkflowStepper,
  ShipmentTrackingCard,
} from "@/shared/components/procurement/ProcurementUI";
import { TransactionTimeline } from "@/shared/components/procurement/TransactionTimeline";
import { StatusBadge } from "@/shared/components/ui/KemkendraUI";
import {
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  MapPin,
  FileCheck2,
  Package,
  Layers,
  FileText,
  DollarSign,
  Boxes,
  Receipt,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";

export default function BuyerOrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<PurchaseOrderResponse | null>(null);
  const [supplierProfile, setSupplierProfile] = useState<SupplierPublicProfile | null>(null);
  const [supplierName, setSupplierName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipment, setShipment] = useState<ShipmentResponse | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const toast = useToast();

  const loadOrder = useCallback(async (silent = false) => {
    if (!orderId) return;
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      const data = await getBuyerOrder(orderId);
      setOrder(data);

      // Resolve supplier profile non-blocking
      if (data.supplierId && !supplierProfile) {
        getSupplierPublicProfile(data.supplierId)
          .then((s) => {
            if (s) {
              setSupplierProfile(s);
              if (s.name) setSupplierName(s.name);
            }
          })
          .catch(() => {});
      }

      if (["SHIPPED", "DISPATCHED", "IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(data.status)) {
        getShipment(data.id)
          .then((s) => setShipment(s))
          .catch(() => {});
      }
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Failed to load purchase order");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [orderId, supplierProfile]);

  useEffect(() => {
    loadOrder(false);

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadOrder(true);
      }
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadOrder(true);
      }
    };

    const handleWindowFocus = () => {
      loadOrder(true);
    };

    const handleOrderUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<{ orderId?: string }>;
      if (!customEvt.detail?.orderId || customEvt.detail.orderId === orderId) {
        loadOrder(true);
      }
    };

    const handleNotificationsUpdate = () => {
      loadOrder(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("order-updated", handleOrderUpdate);
    window.addEventListener("notifications-updated", handleNotificationsUpdate);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("order-updated", handleOrderUpdate);
      window.removeEventListener("notifications-updated", handleNotificationsUpdate);
    };
  }, [loadOrder, orderId]);

  const handleConfirmReceipt = async () => {
    if (!order) return;
    try {
      setActionLoading(true);
      const updated = await confirmReceiptBuyer(order.id);
      setOrder(updated);
      toast.success("Delivery acknowledged. Purchase order status updated to delivered.");
      await loadOrder(true);
      window.dispatchEvent(new CustomEvent("order-updated", { detail: { orderId } }));
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to confirm receipt";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!order) return;
    try {
      setActionLoading(true);
      const updated = await completeOrder(order.id);
      setOrder(updated);
      setShowCompleteModal(false);
      toast.success("Purchase order marked as completed & settled.");
      await loadOrder(true);
      window.dispatchEvent(new CustomEvent("order-updated", { detail: { orderId } }));
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to complete purchase order";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (reason: string) => {
    if (!order) return;
    try {
      setActionLoading(true);
      const updated = await cancelBuyerOrder(order.id, reason);
      setOrder(updated);
      setShowCancelModal(false);
      toast.success("Purchase order has been cancelled.");
      await loadOrder(true);
      window.dispatchEvent(new CustomEvent("order-updated", { detail: { orderId } }));
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to cancel purchase order";
      toast.error(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1560px] mx-auto p-8 min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#0052CC] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono font-bold text-[#5E6C84] uppercase tracking-wider">
          Loading Purchase Order Workspace...
        </span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-[1560px] mx-auto p-8">
        <div className="bg-white border border-rose-200 rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h2 className="text-base font-bold text-[#091E42]">Purchase Order Unavailable</h2>
          <p className="text-xs text-[#5E6C84]">{error || "Order record could not be retrieved."}</p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/dashboard/orders"
              className="px-4 py-2 border border-[#DFE1E6] text-xs font-bold rounded-xl"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isTransitOrShipped = ["SHIPPED", "DISPATCHED", "IN_TRANSIT"].includes(order.status);
  const isDeliveredOrShipped = isTransitOrShipped || order.status === "DELIVERED" || order.status === "COMPLETED";
  const isDelivered = order.status === "DELIVERED";
  const isCancellable = ["PLACED", "PENDING_CONFIRMATION", "CONFIRMED", "PROCESSING"].includes(order.status);

  return (
    <div className="max-w-[1560px] mx-auto space-y-6 pb-20">
      {/* 1. Breadcrumb Navigation */}
      <ProcurementBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/buyer" },
          { label: "Purchase Orders", href: "/dashboard/orders" },
          { label: order.poNumber },
        ]}
      />

      {/* 2. Primary PO Hero */}
      <ProcurementHero
        eyebrow="PURCHASE ORDER"
        referenceNumber={order.poNumber}
        title={order.productName || "Specialty Chemical Material"}
        subtitle={`Linked to RFQ Reference: RFQ-${order.rfqId.substring(0, 8).toUpperCase()}`}
        status={order.status}
        date={new Date(order.placedAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
        counterpartLabel="Supplier"
        counterpartName={supplierProfile?.name || supplierName || `Supplier #${order.supplierId}`}
        counterpartVerified={true}
        primaryAction={
          isTransitOrShipped ? (
            <button
              type="button"
              onClick={handleConfirmReceipt}
              disabled={actionLoading}
              className="h-11 px-6 bg-[#00875A] hover:bg-[#006644] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionLoading ? "Confirming..." : "Confirm Consignment Receipt"}</span>
            </button>
          ) : isDelivered ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#E3FCEF] border border-[#ABF5D1] text-[#006644] text-xs font-bold uppercase tracking-wider rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-[#00875A]" />
                <span>Consignment Received</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCompleteModal(true)}
                disabled={actionLoading}
                className="h-11 px-6 bg-[#006644] hover:bg-[#005236] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Order</span>
              </button>
            </div>
          ) : order.status === "COMPLETED" ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#E3FCEF] border border-[#ABF5D1] text-[#006644] text-xs font-bold uppercase tracking-wider rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-[#00875A]" />
              <span>Order Completed & Settled</span>
            </div>
          ) : order.status === "DISPUTED" ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#FFF7ED] border border-[#FED7AA] text-[#C2410C] text-xs font-bold uppercase tracking-wider rounded-xl">
              <ShieldAlert className="w-4 h-4 text-[#EA580C]" />
              <span>Dispute Under Formal Review</span>
            </div>
          ) : null
        }
        secondaryAction={
          <div className="flex items-center gap-2">
            {isCancellable && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                disabled={actionLoading}
                className="h-10 px-4 bg-white hover:bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Cancel Order</span>
              </button>
            )}

            {order.disputeId ? (
              <Link
                href={`/dashboard/disputes/${order.disputeId}`}
                className="h-10 px-4 bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#C2410C] border border-[#FDBA74] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>View Dispute</span>
              </Link>
            ) : order.status !== "CANCELLED" && order.status !== "REJECTED" && (
              <Link
                href={`/dashboard/disputes/new?orderId=${order.id}`}
                className="h-10 px-4 bg-white hover:bg-[#FAFAFA] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Raise Dispute</span>
              </Link>
            )}
          </div>
        }
      />

      {/* 3. Financial Commercial Ribbon */}
      <CommercialMetricRibbon
        metrics={[
          {
            label: "Total Contract Value",
            value: `${order.currency} ${order.totalAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            subtext: "Binding commercial amount",
            highlight: true,
          },
          {
            label: "Order Volume",
            value: `${order.quantity.toLocaleString()} ${order.unit.toUpperCase()}`,
            subtext: "Batch consignment volume",
          },
          {
            label: "Contracted Unit Price",
            value: `${order.currency} ${order.unitPrice.toFixed(2)}`,
            subtext: `Per ${order.unit.toUpperCase()}`,
          },
          {
            label: "Committed Lead Time",
            value: order.agreedLeadTimeDays ? `${order.agreedLeadTimeDays} Days` : "Standard",
            subtext: "Agreed fulfillment SLA",
          },
          {
            label: "Order Placement Date",
            value: new Date(order.placedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            subtext: "Formal execution date",
          },
        ]}
      />

      {/* 4. Workflow Lifecycle Stepper */}
      <WorkflowStepper currentStatus={order.status} />

      {/* 4b. Unified End-to-End Transaction Timeline */}
      <TransactionTimeline
        order={order}
        shipment={shipment}
        userRole="BUYER"
      />

      {/* 5. 2-Column Order Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (8 Cols): Order Summary, Logistics, Immutable Terms, Document Vault */}
        <div className="lg:col-span-8 space-y-6">
          {/* Status Alert Banners */}
          {order.status === "DISPUTED" && (
            <div className="p-4 bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-[#C2410C]">Purchase Order Under Formal Dispute</h4>
                <p className="text-[#9A3412] leading-relaxed">
                  {order.disputedBy ? `A formal commercial dispute was lodged by ${order.disputedBy}.` : "A formal dispute has been initiated for this order."}
                  {" "}All settlement fulfillment actions are on hold pending resolution.
                </p>
                {order.disputeId && (
                  <div className="pt-1">
                    <Link
                      href={`/dashboard/disputes/${order.disputeId}`}
                      className="font-bold text-[#EA580C] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open Dispute Resolution Center</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {order.status === "CANCELLED" && (
            <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-[#991B1B]">Purchase Order Cancelled</h4>
                <p className="text-[#B91C1C] leading-relaxed">
                  {order.cancellationReason ? `Reason: "${order.cancellationReason}"` : "This purchase order was cancelled prior to consignment dispatch."}
                </p>
              </div>
            </div>
          )}

          {order.status === "REJECTED" && (
            <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-[#991B1B]">Purchase Order Rejected by Supplier</h4>
                <p className="text-[#B91C1C] leading-relaxed">
                  {order.rejectionReason ? `Reason: "${order.rejectionReason}"` : "The supplier was unable to accept this purchase order."}
                </p>
              </div>
            </div>
          )}

          {/* Shipment Tracking Card (if shipped/dispatched/delivered) */}
          {shipment && isDeliveredOrShipped && (
            <ShipmentTrackingCard
              carrier={shipment.carrier || "Freight Transporter"}
              trackingNumber={shipment.trackingNumber}
              shippedAt={shipment.shippedAt || shipment.dispatchDate || order.shippedAt || ""}
              estimatedDeliveryDate={shipment.estimatedDeliveryDate || order.expectedDeliveryDate}
              status={order.status}
            />
          )}

          {/* Commercial Invoice & Payment Settlement Card */}
          <OrderInvoicePaymentCard
            orderId={order.id}
            poNumber={order.poNumber}
            isBuyer={true}
          />

          {/* 1. Order Summary Card */}
          <div className="bg-white border border-[#DFE1E6] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFE1E6] pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#0052CC]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#091E42]">
                  Order Summary
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#0052CC] bg-[#DEEBFF] px-2 py-0.5 rounded uppercase">
                Contract #{order.poNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-[#FAFBFC] rounded-xl border border-[#DFE1E6] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E6C84] block">
                  Product / Compound
                </span>
                <strong className="text-sm font-bold text-[#091E42] block truncate">
                  {order.productName || "Specialty Chemical"}
                </strong>
                {order.masterProductCode && (
                  <span className="text-[10px] font-mono text-[#64748B] block">
                    Code: {order.masterProductCode}
                  </span>
                )}
              </div>

              <div className="p-3.5 bg-[#FAFBFC] rounded-xl border border-[#DFE1E6] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E6C84] block">
                  Consignment Quantity
                </span>
                <span className="font-mono text-sm font-bold text-[#091E42] block">
                  {order.quantity.toLocaleString()} {order.unit.toUpperCase()}
                </span>
              </div>

              <div className="p-3.5 bg-[#FAFBFC] rounded-xl border border-[#DFE1E6] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E6C84] block">
                  Unit Price
                </span>
                <span className="font-mono text-sm font-bold text-[#091E42] block">
                  {order.currency} {order.unitPrice.toFixed(2)} / {order.unit.toUpperCase()}
                </span>
              </div>

              <div className="p-3.5 bg-[#FAFBFC] rounded-xl border border-[#DFE1E6] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E6C84] block">
                  Tax / GST
                </span>
                <span className="font-mono text-sm font-semibold text-[#475569] block">
                  {order.currency} {(order.taxAmount ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="p-3.5 bg-[#FAFBFC] rounded-xl border border-[#DFE1E6] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E6C84] block">
                  Total Order Amount
                </span>
                <span className="font-mono text-sm font-bold text-[#006644] block">
                  {order.currency} {order.totalAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="p-3.5 bg-[#FAFBFC] rounded-xl border border-[#DFE1E6] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E6C84] block">
                  Expected Delivery
                </span>
                <span className="font-mono text-sm font-bold text-[#091E42] block">
                  {order.expectedDeliveryDate || (order.agreedLeadTimeDays ? `${order.agreedLeadTimeDays} Days SLA` : "Standard SLA")}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Agreed Procurement & Shipping Snapshot */}
          <div className="bg-white border border-[#DFE1E6] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFE1E6] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#0052CC]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#091E42]">
                  Agreed Procurement & Shipping
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#006644] bg-[#E3FCEF] px-2 py-0.5 rounded uppercase">
                Immutable Contract
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#FAFBFC] rounded-xl border border-[#DFE1E6] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E6C84] block">
                  Delivery / Consignment Destination
                </span>
                <p className="font-medium text-[#172B4D] leading-relaxed whitespace-pre-wrap">
                  {order.shippingAddress}
                </p>
              </div>

              <div className="p-4 bg-[#FAFBFC] rounded-xl border border-[#DFE1E6] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E6C84] block">
                  Billing & Procurement Contact
                </span>
                <p className="font-medium text-[#172B4D] leading-relaxed whitespace-pre-wrap">
                  {order.billingContact}
                </p>
              </div>
            </div>

            {order.notes && (
              <div className="p-4 bg-[#FAFBFC] rounded-xl border border-[#DFE1E6] text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E6C84] block mb-1">
                  Special Delivery Instructions
                </span>
                <p className="text-[#172B4D] italic">{order.notes}</p>
              </div>
            )}
          </div>

          {/* 3. Chronological Order Lifecycle Timeline */}
          <OrderTimelineSection orderId={order.id} />

          {/* 4. Commercial & Shipping Document Vault */}
          <div className="bg-white border border-[#DFE1E6] rounded-2xl p-5 sm:p-6 shadow-xs">
            <GenericDocumentManager
              title="Commercial & Shipping Document Vault"
              description="Official purchase orders, tax invoices, waybills, certificates of analysis, and delivery receipts."
              ownerType="PURCHASE_ORDER"
              ownerId={order.id}
              canUpload={true}
              canDelete={true}
              allowedCategories={[
                { value: "INVOICE", label: "Commercial Invoice" },
                { value: "WAYBILL", label: "Bill of Lading / Waybill" },
                { value: "PACKING_SLIP", label: "Packing Slip / Delivery Receipt" },
                { value: "COA", label: "Certificate of Analysis (COA)" },
                { value: "SPECIFICATION", label: "Technical Specification" },
              ]}
              emptyMessage="No commercial or shipping documents have been attached to this purchase order yet."
            />
          </div>
        </div>

        {/* Right Sidebar (4 Cols): Order Status, Supplier, Sourcing Reference */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Order Status & Actions Card */}
          <div className="bg-white border border-[#DFE1E6] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFE1E6] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#091E42]">
                Order Status
              </h3>
              <StatusBadge status={order.status} size="sm" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E6C84] block mb-0.5">
                  Next Step
                </span>
                <p className="text-xs text-[#091E42] leading-relaxed">
                  {order.status === "PLACED"
                    ? "Awaiting supplier confirmation of commercial terms and delivery schedule."
                    : order.status === "CONFIRMED"
                    ? "Supplier accepted the purchase order. Batch preparation will begin shortly."
                    : order.status === "PROCESSING"
                    ? "Consignment is undergoing batch processing and quality analysis."
                    : order.status === "SHIPPED"
                    ? "Consignment is in transit. Review tracking details and confirm receipt upon delivery."
                    : order.status === "DELIVERED"
                    ? "Consignment received. Commercial fulfillment complete."
                    : "Fulfillment completed."}
                </p>
              </div>

              <div className="pt-2 border-t border-[#DFE1E6] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#5E6C84]">Placed Date</span>
                  <span className="font-mono font-bold text-[#091E42]">
                    {new Date(order.placedAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5E6C84]">Confirmed Date</span>
                  <span className="font-mono font-bold text-[#091E42]">
                    {order.confirmedAt ? new Date(order.confirmedAt).toLocaleDateString("en-GB") : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5E6C84]">Dispatch Date</span>
                  <span className="font-mono font-bold text-[#091E42]">
                    {order.shippedAt ? new Date(order.shippedAt).toLocaleDateString("en-GB") : "Pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* Buyer Action Button */}
            {order.status === "SHIPPED" && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConfirmReceipt}
                  disabled={actionLoading}
                  className="w-full h-11 bg-[#00875A] hover:bg-[#006644] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{actionLoading ? "Confirming..." : "Confirm Consignment Receipt"}</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Supplier Profile Card */}
          <div className="bg-white border border-[#DFE1E6] rounded-2xl p-5 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#DFE1E6] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#091E42]">
                Supplier
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#006644] bg-[#E3FCEF] border border-[#ABF5D1] px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3 text-[#00875A]" /> Verified
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <strong className="text-sm font-bold text-[#091E42] block">
                  {supplierProfile?.name || supplierName || `Supplier #${order.supplierId}`}
                </strong>
                <span className="text-[11px] text-[#5E6C84]">
                  {supplierProfile?.countryName || "Certified Chemical Manufacturer"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#DFE1E6]">
                <div className="p-2.5 bg-[#FAFBFC] rounded-lg border border-[#DFE1E6]">
                  <span className="text-[10px] font-bold uppercase text-[#5E6C84] block">Country</span>
                  <strong className="text-xs text-[#091E42] block mt-0.5 truncate">
                    {supplierProfile?.countryName || "India"}
                  </strong>
                </div>

                <div className="p-2.5 bg-[#FAFBFC] rounded-lg border border-[#DFE1E6]">
                  <span className="text-[10px] font-bold uppercase text-[#5E6C84] block">Experience</span>
                  <strong className="text-xs text-[#091E42] block mt-0.5">
                    {supplierProfile?.yearsInBusiness ? `${supplierProfile.yearsInBusiness}+ Years` : "5+ Years"}
                  </strong>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-[#5E6C84]">Fulfillment Rate</span>
                <span className="font-bold text-[#00875A]">100% Verified</span>
              </div>

              {order.supplierId && (
                <div className="pt-2">
                  <Link
                    href={`/suppliers/${order.supplierId}`}
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-[#F4F5F7] hover:bg-[#EBECF0] text-[#0052CC] font-bold text-xs rounded-xl border border-[#DFE1E6] transition-colors"
                  >
                    <span>View Supplier Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Tax Invoice & Commercial Settlement Card */}
          <div className="bg-white border border-[#DFE1E6] rounded-2xl p-5 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#DFE1E6] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#091E42] flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#0052CC]" />
                <span>Invoices & Settlement</span>
              </h3>
              <span className="text-[10px] font-mono text-[#00875A] bg-[#E3FCEF] px-1.5 py-0.5 rounded font-bold">
                GST Ready
              </span>
            </div>
            <p className="text-[#5E6C84] leading-relaxed">
              Track statutory tax invoices, record direct non-custodial bank settlement proofs (UTR/NEFT/RTGS), or report discrepancies.
            </p>
            <div className="pt-1">
              <Link
                href="/dashboard/buyer/invoices"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-[#0052CC] hover:bg-[#0047B3] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
              >
                <span>View Invoices & Payments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 3. Sourcing Reference Card */}
          <div className="bg-white border border-[#DFE1E6] rounded-2xl p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#091E42] border-b border-[#DFE1E6] pb-2">
              Sourcing Reference
            </h3>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[#5E6C84]">RFQ Reference</span>
                <Link
                  href={`/dashboard/rfqs/${order.rfqId}`}
                  className="font-mono font-bold text-[#0052CC] hover:underline flex items-center gap-1"
                >
                  <span>RFQ-{order.rfqId.substring(0, 8).toUpperCase()}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#5E6C84]">Chemical Grade</span>
                <span className="font-bold text-[#091E42] uppercase">
                  {order.unit} Bulk Supply
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#5E6C84]">Quotation Terms</span>
                <span className="font-bold text-[#091E42]">Agreed Commercials</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Order Modal */}
      {order && (
        <CompleteOrderModal
          isOpen={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          onConfirm={handleCompleteOrder}
          poNumber={order.poNumber}
          counterpartLabel="Supplier"
          counterpartName={supplierProfile?.name || supplierName}
          productName={order.productName}
          quantity={order.quantity}
          unit={order.unit}
          totalAmount={order.totalAmount}
          currency={order.currency}
        />
      )}

      {/* Cancel Order Modal */}
      {order && (
        <CancelOrderModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelOrder}
          poNumber={order.poNumber}
        />
      )}
    </div>
  );
}

