import { NotificationResponse } from "@/features/notifications/types/notification";

export interface PendingActionDto {
  id: string;
  actionType: "PROFILE" | "VERIFICATION" | "RFQ" | "QUOTATION" | "ORDER" | "INVOICE" | "PAYMENT" | "DISPUTE" | "CATALOG" | string;
  title: string;
  description: string;
  count: number;
  severity: "HIGH" | "MEDIUM" | "LOW" | string;
  targetUrl: string;
  ctaText: string;
}

export interface DashboardActivityItemDto {
  id: string;
  activityType: string;
  title: string;
  description: string;
  entityType: "RFQ" | "QUOTATION" | "ORDER" | "INVOICE" | "PAYMENT" | "DISPUTE" | "VERIFICATION" | string;
  entityId: string;
  referenceCode: string;
  status: string;
  timestamp: string;
  targetUrl: string;
}

export interface BuyerDashboardSummaryResponse {
  buyerId: string;
  buyerName: string;
  companyName?: string;
  isTaxProfileComplete: boolean;
  totalRfqs: number;
  activeRfqs: number;
  quotationsReceived: number;
  pendingQuotations: number;
  acceptedQuotations: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  outstandingInvoiceAmount: number;
  paidInvoiceAmount: number;
  openDisputes: number;
  recentNotifications: NotificationResponse[];
  recentActivity: DashboardActivityItemDto[];
  pendingActions: PendingActionDto[];
}

export interface SupplierDashboardSummaryResponse {
  supplierId: number;
  supplierName: string;
  verificationStatus: string;
  isVerified: boolean;
  isProfileComplete: boolean;
  totalOfferings: number;
  activeOfferings: number;
  pendingReviewOfferings: number;
  rfqsReceived: number;
  pendingRfqs: number;
  quotationsSubmitted: number;
  acceptedQuotations: number;
  totalOrders: number;
  pendingOrders: number;
  outstandingInvoices: number;
  outstandingInvoiceAmount: number;
  confirmedPayments: number;
  confirmedPaymentAmount: number;
  openDisputes: number;
  recentNotifications: NotificationResponse[];
  recentActivity: DashboardActivityItemDto[];
  pendingActions: PendingActionDto[];
}
