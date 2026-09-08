export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'WAITING_FOR_INFORMATION'
  | 'RESOLVED'
  | 'REJECTED'
  | 'ESCALATED';

export type DisputeReason =
  | 'PAYMENT_NOT_RECEIVED'
  | 'INCORRECT_PAYMENT_AMOUNT'
  | 'INVALID_PAYMENT_PROOF'
  | 'DUPLICATE_PAYMENT'
  | 'INVOICE_MISMATCH'
  | 'ORDER_DELIVERY_ISSUE'
  | 'OTHER';

export interface DisputeAttachment {
  id: string;
  disputeId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedById: string;
  createdAt: string;
}

export interface DisputeTimelineEvent {
  id: string;
  disputeId: string;
  actorId?: string;
  actorRole: string;
  action: string;
  notes?: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  disputeNumber: string;
  invoiceId?: string;
  invoiceNumber?: string;
  purchaseOrderId?: string;
  poNumber?: string;
  buyerId: string;
  supplierId: number;
  assignedAdminId?: string;
  reason: DisputeReason;
  customReason?: string;
  description: string;
  disputedAmount?: number;
  currency: string;
  status: DisputeStatus;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedById?: string;
  createdAt: string;
  updatedAt: string;
  attachments: DisputeAttachment[];
  timelineEvents: DisputeTimelineEvent[];
}

export interface CreateDisputeRequest {
  invoiceId?: string;
  purchaseOrderId?: string;
  reason: DisputeReason;
  customReason?: string;
  description: string;
  disputedAmount?: number;
  currency?: string;
}

export interface RespondDisputeRequest {
  message: string;
}

export interface ResolveDisputeRequest {
  resolutionNotes: string;
}

export interface RejectDisputeRequest {
  rejectionReason: string;
}

export interface AssignDisputeRequest {
  assignedAdminId: string;
}

export interface UpdateDisputeStatusRequest {
  status: DisputeStatus;
  notes?: string;
}
