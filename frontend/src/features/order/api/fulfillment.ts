import { authenticatedFetch } from "@/features/auth/api/authenticatedFetch";
import { PurchaseOrderResponse } from "./createOrder";

export interface ShipOrderRequest {
  carrier: string;
  trackingNumber: string;
  estimatedDeliveryDate?: string;
}

export interface ShipmentResponse {
  id: string;
  carrier?: string | null;
  trackingNumber: string;
  shipmentStatus?: "DISPATCHED" | "IN_TRANSIT" | "DELIVERED";
  dispatchDate?: string | null;
  estimatedDeliveryDate: string | null;
  shippedAt: string;
  deliveredAt?: string | null;
  deliveryNotes?: string | null;
}

export interface OrderTimelineEventDto {
  step: string;
  title: string;
  description: string;
  actorRole: string;
  actorName?: string | null;
  timestamp?: string | null;
  completed: boolean;
  current: boolean;
}

export interface OrderInvoiceSummaryDto {
  orderId: string;
  poNumber: string;
  hasInvoice: boolean;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  status?: string | null;
  totalAmount?: number | null;
  taxAmount?: number | null;
  paidAmount?: number | null;
  balanceDue?: number | null;
  currency?: string | null;
  issueDate?: string | null;
  dueDate?: string | null;
  paymentRecorded: boolean;
  paymentProofUploaded: boolean;
  proofVerified: boolean;
  downloadPdfUrl?: string | null;
}

export interface DispatchOrderRequest {
  trackingNumber: string;
  carrier?: string;
  dispatchDate?: string;
  estimatedDeliveryDate?: string;
  deliveryNotes?: string;
}

export interface UpdateShipmentStatusRequest {
  shipmentStatus: "DISPATCHED" | "IN_TRANSIT" | "DELIVERED";
  carrier?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  deliveryNotes?: string;
}

export async function markReadyForDispatchSupplierOrder(orderId: string): Promise<PurchaseOrderResponse> {
  const response = await authenticatedFetch(`/api/v1/orders/supplier/${orderId}/ready-for-dispatch`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to mark order ready for dispatch");
  }

  return response.json();
}

export async function dispatchSupplierOrder(
  orderId: string,
  data: DispatchOrderRequest
): Promise<PurchaseOrderResponse> {
  const response = await authenticatedFetch(`/api/v1/orders/supplier/${orderId}/dispatch`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to dispatch order");
  }

  return response.json();
}

export async function updateShipmentStatus(
  orderId: string,
  data: UpdateShipmentStatusRequest
): Promise<ShipmentResponse> {
  const response = await authenticatedFetch(`/api/v1/orders/supplier/${orderId}/shipment-status`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to update shipment status");
  }

  return response.json();
}

export async function getOrderTimeline(orderId: string): Promise<OrderTimelineEventDto[]> {
  const response = await authenticatedFetch(`/api/v1/orders/${orderId}/timeline`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to load order timeline");
  }

  return response.json();
}

export async function getOrderInvoiceSummary(orderId: string): Promise<OrderInvoiceSummaryDto> {
  const response = await authenticatedFetch(`/api/v1/orders/${orderId}/invoice-summary`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to load invoice and payment summary");
  }

  return response.json();
}

export async function startProcessingSupplierOrder(orderId: string): Promise<PurchaseOrderResponse> {
  const response = await authenticatedFetch(`/api/v1/orders/supplier/${orderId}/process`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to start processing order");
  }

  return response.json();
}

export async function shipSupplierOrder(orderId: string, data: ShipOrderRequest): Promise<PurchaseOrderResponse> {
  const response = await authenticatedFetch(`/api/v1/orders/supplier/${orderId}/ship`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to ship order");
  }

  return response.json();
}

export async function getShipment(orderId: string): Promise<ShipmentResponse> {
  const response = await authenticatedFetch(`/api/v1/orders/${orderId}/shipment`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to load shipment information");
  }

  return response.json();
}

export async function markOrderDeliveredSupplier(orderId: string): Promise<PurchaseOrderResponse> {
  const response = await authenticatedFetch(`/api/v1/orders/${orderId}/deliver`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to mark order as delivered");
  }

  return response.json();
}

export async function confirmReceiptBuyer(orderId: string): Promise<PurchaseOrderResponse> {
  const response = await authenticatedFetch(`/api/v1/orders/${orderId}/receive`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to confirm receipt of order");
  }

  return response.json();
}

export async function rejectSupplierOrder(orderId: string, reason: string): Promise<PurchaseOrderResponse> {
  const response = await authenticatedFetch(`/api/v1/orders/supplier/${orderId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to reject purchase order");
  }

  return response.json();
}

export async function completeOrder(orderId: string): Promise<PurchaseOrderResponse> {
  const response = await authenticatedFetch(`/api/v1/orders/${orderId}/complete`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to complete purchase order");
  }

  return response.json();
}

export async function cancelBuyerOrder(orderId: string, reason: string): Promise<PurchaseOrderResponse> {
  const response = await authenticatedFetch(`/api/v1/orders/${orderId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to cancel purchase order");
  }

  return response.json();
}



