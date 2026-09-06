export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'DISPUTED';

export type PaymentStatus =
  | 'PENDING'
  | 'INITIATED'
  | 'PROOF_UPLOADED'
  | 'CONFIRMED'
  | 'FAILED'
  | 'DISPUTED'
  | 'REFUNDED';

export type PaymentMode =
  | 'NEFT'
  | 'RTGS'
  | 'IMPS'
  | 'UPI'
  | 'CHEQUE'
  | 'LETTER_OF_CREDIT'
  | 'WIRE_TRANSFER'
  | 'OTHER';

export type GstRegistrationType =
  | 'REGISTERED_REGULAR'
  | 'REGISTERED_COMPOSITION'
  | 'UNREGISTERED'
  | 'CONSUMER'
  | 'OVERSEAS'
  | 'SPECIAL_ECONOMIC_ZONE'
  | 'DEEMED_EXPORT';

export interface BusinessTaxProfile {
  id?: string;
  userId?: string;
  legalBusinessName: string;
  tradeName?: string;
  gstin?: string;
  isGstRegistered: boolean;
  gstRegistrationType: GstRegistrationType;
  panNumber?: string;
  registeredAddress: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  country: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  id: string;
  itemNumber: number;
  productName: string;
  productCode?: string;
  casNumber?: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountAmount: number;
  taxableValue: number;
  gstRate: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalAmount: number;
  createdAt?: string;
}

export interface InvoicePaymentRecord {
  id: string;
  invoiceId: string;
  purchaseOrderId?: string;
  poNumber?: string;
  buyerId?: string;
  supplierId?: number;
  recordedById: string;
  paymentReference: string;
  paymentMode: PaymentMode;
  paymentDate: string;
  amountPaid: number;
  currency?: string;
  notes?: string;
  bankName?: string;
  proofDocumentId?: string;
  proofFileName?: string;
  proofFileSize?: number;
  proofContentType?: string;
  status: PaymentStatus;
  reviewedById?: string;
  reviewedAt?: string;
  confirmedById?: string;
  confirmedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  infoRequestedNotes?: string;
  disputeReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceAudit {
  id: string;
  invoiceId: string;
  actorId?: string;
  action: string;
  details?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  financialYear: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;

  purchaseOrderId?: string;
  poNumber?: string;
  rfqId?: string;
  rfqReference?: string;
  quotationId?: string;
  quotationReference?: string;

  supplierId: number;
  supplierUserId?: string;
  supplierLegalName: string;
  supplierTradeName?: string;
  supplierGstin?: string;
  supplierPan?: string;
  supplierAddress: string;
  supplierCity?: string;
  supplierState: string;
  supplierStateCode: string;
  supplierPostalCode?: string;
  supplierEmail?: string;
  supplierPhone?: string;

  buyerId: string;
  buyerLegalName: string;
  buyerTradeName?: string;
  buyerGstin?: string;
  buyerPan?: string;
  buyerBillingAddress: string;
  buyerShippingAddress: string;
  buyerCity?: string;
  buyerState: string;
  buyerStateCode: string;
  buyerPostalCode?: string;
  buyerEmail?: string;
  buyerPhone?: string;

  isInterstate: boolean;
  placeOfSupplyStateCode: string;
  placeOfSupplyState: string;
  currency: string;

  taxableAmount: number;
  discountAmount: number;
  additionalCharges: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTaxAmount: number;
  grandTotal: number;
  amountPaid: number;
  amountDue: number;

  version: number;
  originalInvoiceId?: string;
  revisedInvoiceId?: string;
  cancellationReason?: string;
  disputeReason?: string;
  notes?: string;
  termsAndConditions?: string;
  issuedAt?: string;
  issuedBy?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt: string;

  items: InvoiceItem[];
  paymentRecords: InvoicePaymentRecord[];
  audits: InvoiceAudit[];
}

export interface IssueInvoiceRequest {
  purchaseOrderId: string;
  invoiceDate?: string;
  dueDate?: string;
  hsnCode?: string;
  gstRate?: number;
  discountAmount?: number;
  additionalCharges?: number;
  notes?: string;
  termsAndConditions?: string;
}

export interface RecordPaymentRequest {
  paymentReference: string;
  paymentMode: PaymentMode;
  paymentDate: string;
  amountPaid: number;
  currency?: string;
  notes?: string;
  bankName?: string;
  proofDocumentId?: string;
}

export interface ConfirmPaymentRequest {
  reviewNotes?: string;
}

export interface RejectPaymentRequest {
  rejectionReason: string;
}

export interface RequestPaymentInfoRequest {
  message: string;
}

export interface DisputePaymentRequest {
  disputeReason: string;
}

export interface CancelInvoiceRequest {
  cancellationReason: string;
}

export interface DisputeInvoiceRequest {
  disputeReason: string;
}
