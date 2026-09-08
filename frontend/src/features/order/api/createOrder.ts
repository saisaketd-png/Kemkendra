import { authenticatedFetch } from "@/features/auth/api/authenticatedFetch";

export interface PurchaseOrderResponse {
  id: string;
  poNumber: string;
  rfqId: string;
  quotationId: string;
  buyerId: string;
  supplierId: number;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  agreedLeadTimeDays: number | null;
  shippingAddress: string;
  billingContact: string;
  notes: string | null;
  status:
    | "PENDING_CONFIRMATION"
    | "PLACED"
    | "CONFIRMED"
    | "PROCESSING"
    | "READY_FOR_DISPATCH"
    | "DISPATCHED"
    | "SHIPPED"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED"
    | "REJECTED"
    | "DISPUTED";
  subtotal?: number | null;
  taxAmount?: number | null;
  expectedDeliveryDate?: string | null;
  paymentTerms?: string | null;
  deliveryTerms?: string | null;
  incoterms?: string | null;
  placedAt: string;
  confirmedAt: string | null;
  confirmedBy?: string | null;
  processingAt?: string | null;
  readyForDispatchAt?: string | null;
  shippedAt?: string | null;
  inTransitAt?: string | null;
  deliveredAt?: string | null;
  completedAt?: string | null;
  rejectedAt?: string | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
  disputedAt?: string | null;
  disputedBy?: string | null;
  disputeId?: string | null;
  rfqReference?: string | null;
  quotationReference?: string | null;
  quotationVersion?: number | null;
  masterProductId?: string | null;
  masterProductCode?: string | null;
  supplierOfferingId?: number | null;
  purity?: string | null;
  grade?: string | null;
  packaging?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderRequest {
  rfqId: string;
  shippingAddress: string;
  billingContact: string;
  notes?: string;
}

export async function createOrder(
  data: CreatePurchaseOrderRequest
): Promise<PurchaseOrderResponse> {
  const response = await authenticatedFetch("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to create purchase order");
  }

  return response.json();
}
