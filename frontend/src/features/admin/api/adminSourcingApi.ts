import { authenticatedFetch } from "@/features/auth/api/authenticatedFetch";
import { resolveApiUrl } from "@/lib/apiUrl";

export interface SourcingStats {
  totalRequests: number;
  newRequests: number;
  inProgressRequests: number;
  proposalsSent: number;
  completedRequests: number;
  moreInfoRequired: number;
  rejectedRequests: number;
}

export type SourcingStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "MORE_INFORMATION_REQUIRED"
  | "ACCEPTED"
  | "SOURCING"
  | "SUPPLIER_CONTACTED"
  | "QUOTATIONS_RECEIVED"
  | "PROPOSAL_READY"
  | "PROPOSAL_SENT"
  | "NEGOTIATION"
  | "FULFILLED"
  | "CLOSED"
  | "REJECTED"
  | "OPEN"
  | "PARTIALLY_QUOTED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export interface SourcingRequestSummary {
  id: string;
  sourcingRequestReference: string;
  buyerId: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerCompany?: string;
  productName: string;
  casNumber?: string;
  category: string;
  grade?: string;
  quantity: number;
  unit: string;
  deliveryLocation: string;
  targetPrice?: number;
  currency: string;
  expectedDeliveryDate?: string;
  status: SourcingStatus;
  assignedToUserId?: string;
  assignedExecutiveName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SourcingStatusHistoryItem {
  id: string;
  sourcingRequestId: string;
  previousStatus?: string;
  newStatus: string;
  changedByUserId?: string;
  changedByUserName?: string;
  reasonOrNotes?: string;
  createdAt: string;
}

export interface SourcingAssignmentItem {
  id: string;
  sourcingRequestId: string;
  assignedToUserId: string;
  assignedToUserName?: string;
  assignedByUserId?: string;
  assignedByUserName?: string;
  role: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}

export interface SourcingSupplierItem {
  id: string;
  sourcingRequestId: string;
  supplierId?: number;
  supplierName: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  location?: string;
  supplierType?: "MANUFACTURER" | "DISTRIBUTOR" | "TRADER" | string;
  productsSupplied?: string;
  verificationStatus?: "UNVERIFIED" | "VERIFIED" | "PENDING" | string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SourcingOutreachLogItem {
  id: string;
  sourcingRequestId: string;
  sourcingSupplierId?: string;
  supplierName?: string;
  outreachChannel: "PHONE" | "EMAIL" | "OTHER" | string;
  contactDate?: string;
  contactPerson?: string;
  performedByUserId?: string;
  performedByUserName?: string;
  responseStatus: "PENDING" | "INTERESTED" | "NOT_INTERESTED" | "QUOTE_PROVIDED" | "NO_RESPONSE" | string;
  subject?: string;
  details: string;
  outcome?: string;
  nextFollowUpDate?: string;
  notes?: string;
  loggedAt: string;
}

export interface SourcingQuotationItem {
  id: string;
  sourcingRequestId: string;
  sourcingSupplierId?: string;
  supplierName?: string;
  quotationReference?: string;
  productName?: string;
  unitPrice: number;
  currency: string;
  unit?: string;
  minimumOrderQuantity?: number;
  availableQuantity?: number;
  productGrade?: string;
  puritySpecifications?: string;
  packaging?: string;
  leadTimeDays?: number;
  deliveryCharges?: number;
  paymentTerms?: string;
  incoterms?: string;
  validUntil?: string;
  notes?: string;
  attachmentUrl?: string;
  supportingDocuments?: string;
  status: string;
  shareWithBuyer?: boolean;
  totalLandedCostPerUnit?: number;
  totalEstimatedCost?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SourcingProposalOptionItem {
  id: string;
  sourcingProposalId: string;
  sourcingQuotationId?: string;
  optionLabel: string;
  supplierDisplayName: string;
  productName: string;
  grade?: string;
  puritySpecifications?: string;
  offeredPricePerUnit: number;
  currency: string;
  quantity: number;
  unit: string;
  moq?: number;
  leadTimeDays?: number;
  packaging?: string;
  deliveryTerms?: string;
  paymentTerms?: string;
  validUntil?: string;
  documentUrl?: string;
  recommendationNotes?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SourcingProposalItem {
  id: string;
  sourcingRequestId: string;
  proposalReference: string;
  title: string;
  offeredPricePerUnit: number;
  currency: string;
  quantity: number;
  unit: string;
  estimatedDeliveryDays?: number;
  termsAndConditions?: string;
  summaryNotes?: string;
  recommendationNotes?: string;
  proposalDocumentUrl?: string;
  status: string;
  selectedOptionId?: string;
  buyerFeedback?: string;
  sentToBuyerAt?: string;
  buyerDecisionAt?: string;
  options: SourcingProposalOptionItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface SourcingRequestDetail extends SourcingRequestSummary {
  specifications?: string;
  pharmacopeialStandard?: string;
  packaging?: string;
  additionalRequirements?: string;
  attachmentReferences?: string;
  notes?: string;
  statusHistory: SourcingStatusHistoryItem[];
  assignments: SourcingAssignmentItem[];
  suppliers: SourcingSupplierItem[];
  outreachLogs: SourcingOutreachLogItem[];
  quotations: SourcingQuotationItem[];
  proposals: SourcingProposalItem[];
}

export interface PaginatedSourcingResponse {
  content: SourcingRequestSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AddSupplierPayload {
  supplierId?: number;
  supplierName: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  location?: string;
  supplierType?: string;
  productsSupplied?: string;
  verificationStatus?: string;
  notes?: string;
}

export interface UpdateSupplierPayload extends AddSupplierPayload {
  status?: string;
}

export interface CreateOutreachPayload {
  sourcingSupplierId?: string;
  outreachChannel: string;
  contactDate?: string;
  contactPerson?: string;
  responseStatus?: string;
  subject?: string;
  details: string;
  outcome?: string;
  nextFollowUpDate?: string;
  notes?: string;
}

export interface RegisteredSupplierLookup {
  id: number;
  name: string;
  legalName?: string;
  businessType?: string;
  businessEmail?: string;
  businessPhone?: string;
  contactPerson?: string;
  website?: string;
  location?: string;
  verified?: boolean;
  verificationStatus?: string;
  primaryCategories?: string;
}

export async function fetchSourcingStats(): Promise<SourcingStats> {
  const res = await authenticatedFetch("/api/v1/admin/sourcing/stats");
  if (!res.ok) {
    throw new Error("Failed to fetch sourcing overview statistics");
  }
  return res.json();
}

export async function fetchAdminSourcingRequests(params: {
  page?: number;
  size?: number;
  status?: string;
  query?: string;
}): Promise<PaginatedSourcingResponse> {
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.set("page", String(params.page));
  if (params.size !== undefined) queryParams.set("size", String(params.size));
  if (params.status) queryParams.set("status", params.status);
  if (params.query?.trim()) queryParams.set("query", params.query.trim());

  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch sourcing requests");
  }
  return res.json();
}

export async function fetchAdminSourcingRequestDetail(id: string): Promise<SourcingRequestDetail> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch sourcing request detail");
  }
  return res.json();
}

export async function updateSourcingRequestStatus(
  id: string,
  data: { status: string; reasonOrNotes?: string }
): Promise<SourcingRequestDetail> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to update request status");
  }
  return res.json();
}

export async function assignSourcingExecutive(
  id: string,
  data: { assignedToUserId: string; role?: string; notes?: string }
): Promise<SourcingRequestDetail> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${id}/assign`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to assign sourcing executive");
  }
  return res.json();
}

export async function updateSourcingNotes(
  id: string,
  data: { notes: string }
): Promise<SourcingRequestDetail> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${id}/notes`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to update internal notes");
  }
  return res.json();
}

export async function fetchAdminUsersDirectory(): Promise<{ id: string; name: string; email: string }[]> {
  try {
    const res = await authenticatedFetch("/api/v1/admin/users?role=ADMIN&size=50");
    if (!res.ok) return [];
    const data = await res.json();
    return (data.content || []).map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
    }));
  } catch {
    return [];
  }
}

// =============================================================================
// SUPPLIER & OUTREACH MANAGEMENT APIS
// =============================================================================

export async function fetchSuppliersForRequest(requestId: string): Promise<SourcingSupplierItem[]> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${requestId}/suppliers`);
  if (!res.ok) {
    throw new Error("Failed to fetch suppliers for request");
  }
  return res.json();
}

export async function addSupplierToRequest(
  requestId: string,
  payload: AddSupplierPayload
): Promise<SourcingSupplierItem> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${requestId}/suppliers`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to add supplier to sourcing request");
  }
  return res.json();
}

export async function updateSupplierInRequest(
  requestId: string,
  supplierId: string,
  payload: UpdateSupplierPayload
): Promise<SourcingSupplierItem> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${requestId}/suppliers/${supplierId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to update supplier information");
  }
  return res.json();
}

export async function deleteSupplierFromRequest(
  requestId: string,
  supplierId: string
): Promise<void> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${requestId}/suppliers/${supplierId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to remove supplier");
  }
}

export async function logSupplierOutreach(
  requestId: string,
  payload: CreateOutreachPayload
): Promise<SourcingOutreachLogItem> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${requestId}/outreach`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to log supplier outreach interaction");
  }
  return res.json();
}

export async function fetchSupplierOutreachHistory(
  requestId: string,
  supplierId: string
): Promise<SourcingOutreachLogItem[]> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${requestId}/suppliers/${supplierId}/outreach`);
  if (!res.ok) {
    throw new Error("Failed to fetch supplier outreach history");
  }
  return res.json();
}

export async function searchRegisteredSuppliers(
  query: string
): Promise<RegisteredSupplierLookup[]> {
  if (!query || query.trim().length === 0) return [];
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/directory/suppliers?query=${encodeURIComponent(query.trim())}`);
  if (!res.ok) return [];
  return res.json();
}

// =============================================================================
// QUOTATION & PROPOSAL PAYLOADS AND APIS
// =============================================================================

export interface AddQuotationPayload {
  sourcingSupplierId?: string;
  productName: string;
  unitPrice: number;
  currency?: string;
  unit?: string;
  minimumOrderQuantity?: number;
  availableQuantity?: number;
  productGrade?: string;
  puritySpecifications?: string;
  packaging?: string;
  leadTimeDays?: number;
  deliveryCharges?: number;
  paymentTerms?: string;
  incoterms?: string;
  validUntil?: string;
  notes?: string;
  attachmentUrl?: string;
  supportingDocuments?: string;
  status?: string;
  shareWithBuyer?: boolean;
}

export interface UpdateQuotationPayload extends AddQuotationPayload {
  status?: string;
}

export interface CreateProposalOptionPayload {
  sourcingQuotationId?: string;
  optionLabel: string;
  supplierDisplayName: string;
  productName: string;
  grade?: string;
  puritySpecifications?: string;
  offeredPricePerUnit: number;
  currency?: string;
  quantity: number;
  unit: string;
  moq?: number;
  leadTimeDays?: number;
  packaging?: string;
  deliveryTerms?: string;
  paymentTerms?: string;
  validUntil?: string;
  documentUrl?: string;
  recommendationNotes?: string;
}

export interface CreateProposalPayload {
  title: string;
  summaryNotes?: string;
  recommendationNotes?: string;
  termsAndConditions?: string;
  proposalDocumentUrl?: string;
  options: CreateProposalOptionPayload[];
  publishImmediately?: boolean;
}

export interface BuyerOptionDecisionPayload {
  decision: "ACCEPTED" | "DECLINED" | string;
  remarks?: string;
}

export interface BuyerClarificationPayload {
  question: string;
  subject?: string;
}

export async function fetchQuotationsForRequest(requestId: string): Promise<SourcingQuotationItem[]> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${requestId}/quotations`);
  if (!res.ok) {
    throw new Error("Failed to fetch quotations for request");
  }
  return res.json();
}

export async function addQuotationToRequest(
  requestId: string,
  payload: AddQuotationPayload
): Promise<SourcingQuotationItem> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${requestId}/quotations`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to add quotation");
  }
  return res.json();
}

export async function updateQuotationInRequest(
  requestId: string,
  quotationId: string,
  payload: UpdateQuotationPayload
): Promise<SourcingQuotationItem> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${requestId}/quotations/${quotationId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to update quotation");
  }
  return res.json();
}

export async function deleteQuotationFromRequest(
  requestId: string,
  quotationId: string
): Promise<void> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${requestId}/quotations/${quotationId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to delete quotation");
  }
}

export async function createProposalForRequest(
  requestId: string,
  payload: CreateProposalPayload
): Promise<SourcingProposalItem> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${requestId}/proposals`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to create sourcing proposal");
  }
  return res.json();
}

export async function publishProposalForRequest(
  requestId: string,
  proposalId: string
): Promise<SourcingProposalItem> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${requestId}/proposals/${proposalId}/publish`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to publish proposal to buyer");
  }
  return res.json();
}

export async function deleteProposalFromRequest(
  requestId: string,
  proposalId: string
): Promise<void> {
  const res = await authenticatedFetch(`/api/v1/admin/sourcing/requests/${requestId}/proposals/${proposalId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to delete proposal");
  }
}

// Buyer-facing functions:
export async function fetchBuyerSourcingRequests(): Promise<SourcingRequestSummary[]> {
  const res = await authenticatedFetch("/api/v1/sourcing/requests/my");
  if (!res.ok) {
    throw new Error("Failed to fetch your sourcing requests");
  }
  return res.json();
}

export async function fetchBuyerSourcingRequestDetail(id: string): Promise<SourcingRequestDetail> {
  const res = await authenticatedFetch(`/api/v1/sourcing/requests/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch sourcing request details");
  }
  return res.json();
}

export async function fetchBuyerPublishedProposals(requestId: string): Promise<SourcingProposalItem[]> {
  const res = await authenticatedFetch(`/api/v1/sourcing/requests/${requestId}/proposals`);
  if (!res.ok) {
    throw new Error("Failed to fetch published proposals");
  }
  return res.json();
}

export async function submitBuyerOptionDecision(
  requestId: string,
  proposalId: string,
  optionId: string,
  payload: BuyerOptionDecisionPayload
): Promise<SourcingProposalItem> {
  const res = await authenticatedFetch(`/api/v1/sourcing/requests/${requestId}/proposals/${proposalId}/options/${optionId}/interest`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to record decision on option");
  }
  return res.json();
}

export async function submitBuyerClarificationInquiry(
  requestId: string,
  proposalId: string,
  payload: BuyerClarificationPayload
): Promise<SourcingProposalItem> {
  const res = await authenticatedFetch(`/api/v1/sourcing/requests/${requestId}/proposals/${proposalId}/clarification`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to submit clarification question");
  }
  return res.json();
}

export interface BuyerProvideAdditionalInfoPayload {
  additionalInfo: string;
  attachmentReferences?: string;
}

export async function submitBuyerAdditionalInformation(
  requestId: string,
  payload: BuyerProvideAdditionalInfoPayload
): Promise<SourcingRequestDetail> {
  const res = await authenticatedFetch(`/api/v1/sourcing/requests/${requestId}/additional-info`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to submit additional information");
  }
  return res.json();
}
