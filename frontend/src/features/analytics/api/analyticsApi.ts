import { authenticatedFetch } from "@/features/auth/api/authenticatedFetch";

export interface AdminDashboardKpiResponse {
  totalBuyers: number;
  totalSuppliers: number;
  verifiedSuppliers: number;
  totalProducts: number;
  activeCommercialOfferings: number;
  totalRfqs: number;
  activeRfqs: number;
  totalQuotations: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalInvoiceValue: number;
  paidInvoiceValue: number;
  outstandingInvoiceValue: number;
  openDisputes: number;
}

export interface DataPoint {
  date: string;
  value: number;
}

export interface RfqQuotationAnalyticsResponse {
  rfqsOverTime: DataPoint[];
  totalRfqs: number;
  rfqsReceivingQuotations: number;
  averageQuotationsPerRfq: number;
  rfqToQuotationConversionRate: number;
  quotationAcceptanceRate: number;
  averageQuotationResponseTimeHours: number;
  pendingRfqs: number;
  expiredRfqs: number;
}

export interface TopProduct {
  masterProductId: string;
  productCode: string;
  productName: string;
  orderCount: number;
  totalQuantity: number;
  totalAmount: number;
  unit: string;
}

export interface TopSupplier {
  supplierId: number;
  supplierName: string;
  orderCount: number;
  completedCount: number;
  totalGmv: number;
}

export interface OrderAnalyticsReportResponse {
  ordersOverTime: DataPoint[];
  ordersByStatus: Record<string, number>;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  averageOrderCompletionTimeDays: number;
  mostOrderedProducts: TopProduct[];
  mostActiveSuppliers: TopSupplier[];
}

export interface SupplierPerformanceRow {
  supplierId: number;
  supplierName: string;
  verificationStatus: string;
  rfqsReceived: number;
  quotationsSubmitted: number;
  quotationsAccepted: number;
  ordersCompleted: number;
  quoteAcceptanceRate: number;
  averageResponseTimeHours: number;
}

export interface SupplierAnalyticsReportResponse {
  totalSuppliers: number;
  verifiedSuppliers: number;
  pendingSuppliers: number;
  underReviewSuppliers: number;
  rejectedSuppliers: number;
  totalRfqsReceived: number;
  totalQuotationsSubmitted: number;
  totalQuotationsAccepted: number;
  totalOrdersCompleted: number;
  averageResponseTimeHours: number;
  supplierPerformanceList: SupplierPerformanceRow[];
}

export interface SearchTermCount {
  searchTerm: string;
  searchCount: number;
}

export interface ProductCount {
  masterProductId: string;
  productName: string;
  productCode: string;
  count: number;
}

export interface ProductDemand {
  masterProductId: string;
  chemicalName: string;
  casNumber: string;
  category: string;
  rfqCount: number;
  totalRequestedQuantity: number;
  unit: string;
}

export interface CategoryActivity {
  category: string;
  rfqCount: number;
  orderCount: number;
  offeringCount: number;
}

export interface ProductSummary {
  masterProductId: string;
  masterProductCode: string;
  name: string;
  casNumber: string;
  category: string;
}

export interface ProductDemandGrowth {
  masterProductId: string;
  productName: string;
  casNumber: string;
  currentPeriodRfqCount: number;
  previousPeriodRfqCount: number;
  growthPercentage: number;
}

export interface ProductAnalyticsReportResponse {
  mostSearched: SearchTermCount[];
  mostViewed: ProductCount[];
  mostRequestedChemicals: ProductDemand[];
  mostActiveCategories: CategoryActivity[];
  productsWithNoActiveOfferings: ProductSummary[];
  productsWithIncreasingDemand: ProductDemandGrowth[];
}

export interface InvoicePaymentReportResponse {
  totalInvoiceValue: number;
  paidAmount: number;
  partiallyPaidAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
  cancelledInvoicesCount: number;
  cancelledInvoicesAmount: number;
  paymentConfirmationStatusBreakdown: Record<string, number>;
  disputedPaymentsCount: number;
  disputedPaymentsAmount: number;
  platformRevenueNotice: string;
}

export interface BuyerAnalyticsSummaryResponse {
  totalRfqs: number;
  activeRfqs: number;
  quotationsReceived: number;
  ordersPlaced: number;
  completedOrders: number;
  totalSpent: number;
  outstandingInvoicesAmount: number;
  averageQuotationTurnaroundHours: number;
  spendTrends: DataPoint[];
  ordersByStatus: Record<string, number>;
  mostPurchasedProducts: TopProduct[];
}

export interface SupplierAnalyticsSummaryResponse {
  rfqsReceived: number;
  activeRfqs: number;
  quotationsSubmitted: number;
  quotationsAccepted: number;
  quotationAcceptanceRate: number;
  averageResponseTimeHours: number;
  ordersReceived: number;
  ordersCompleted: number;
  totalFulfilledGmv: number;
  outstandingReceivablesAmount: number;
  fulfillmentTrends: DataPoint[];
  ordersByStatus: Record<string, number>;
  topSellingProducts: TopProduct[];
}

export interface AnalyticsFilterParams {
  period?: string;
  from?: string;
  to?: string;
  supplierId?: string | number;
  buyerId?: string;
  status?: string;
  category?: string;
}

function buildQuery(params?: AnalyticsFilterParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.period) q.append("period", params.period);
  if (params.from) q.append("from", params.from);
  if (params.to) q.append("to", params.to);
  if (params.supplierId) q.append("supplierId", String(params.supplierId));
  if (params.buyerId) q.append("buyerId", params.buyerId);
  if (params.status && params.status !== "ALL") q.append("status", params.status);
  if (params.category && params.category !== "ALL") q.append("category", params.category);
  const s = q.toString();
  return s ? `?${s}` : "";
}

// -------------------------------------------------------------
// Admin Analytics APIs
// -------------------------------------------------------------
export async function getAdminDashboardKpis(): Promise<AdminDashboardKpiResponse> {
  const res = await authenticatedFetch("/api/v1/admin/analytics/dashboard");
  if (!res.ok) throw new Error("Failed to fetch admin dashboard KPIs");
  return res.json();
}

export async function getAdminRfqAnalytics(params?: AnalyticsFilterParams): Promise<RfqQuotationAnalyticsResponse> {
  const res = await authenticatedFetch(`/api/v1/admin/analytics/rfqs${buildQuery(params)}`);
  if (!res.ok) throw new Error("Failed to fetch RFQ analytics");
  return res.json();
}

export async function getAdminOrderAnalytics(params?: AnalyticsFilterParams): Promise<OrderAnalyticsReportResponse> {
  const res = await authenticatedFetch(`/api/v1/admin/analytics/orders${buildQuery(params)}`);
  if (!res.ok) throw new Error("Failed to fetch order analytics");
  return res.json();
}

export async function getAdminSupplierAnalytics(params?: AnalyticsFilterParams): Promise<SupplierAnalyticsReportResponse> {
  const res = await authenticatedFetch(`/api/v1/admin/analytics/suppliers${buildQuery(params)}`);
  if (!res.ok) throw new Error("Failed to fetch supplier analytics");
  return res.json();
}

export async function getAdminProductAnalytics(params?: AnalyticsFilterParams): Promise<ProductAnalyticsReportResponse> {
  const res = await authenticatedFetch(`/api/v1/admin/analytics/products${buildQuery(params)}`);
  if (!res.ok) throw new Error("Failed to fetch product analytics");
  return res.json();
}

export async function getAdminInvoiceAnalytics(params?: AnalyticsFilterParams): Promise<InvoicePaymentReportResponse> {
  const res = await authenticatedFetch(`/api/v1/admin/analytics/invoices${buildQuery(params)}`);
  if (!res.ok) throw new Error("Failed to fetch invoice analytics");
  return res.json();
}

export async function downloadAdminExport(reportType: string, params?: AnalyticsFilterParams): Promise<void> {
  const url = `/api/v1/admin/analytics/export/${encodeURIComponent(reportType)}${buildQuery(params)}`;
  const res = await authenticatedFetch(url);
  if (!res.ok) throw new Error(`Export failed for ${reportType}`);
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  let filename = `kemkendra_${reportType}_export.csv`;
  if (disposition) {
    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) filename = match[1];
  }
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

// -------------------------------------------------------------
// Buyer Analytics APIs
// -------------------------------------------------------------
export async function getBuyerAnalyticsSummary(params?: AnalyticsFilterParams): Promise<BuyerAnalyticsSummaryResponse> {
  const res = await authenticatedFetch(`/api/v1/buyer/analytics/summary${buildQuery(params)}`);
  if (!res.ok) throw new Error("Failed to fetch buyer procurement summary");
  return res.json();
}

export async function downloadBuyerExport(reportType: string, params?: AnalyticsFilterParams): Promise<void> {
  const url = `/api/v1/buyer/analytics/export/${encodeURIComponent(reportType)}${buildQuery(params)}`;
  const res = await authenticatedFetch(url);
  if (!res.ok) throw new Error(`Export failed for ${reportType}`);
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  let filename = `buyer_${reportType}_export.csv`;
  if (disposition) {
    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) filename = match[1];
  }
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

// -------------------------------------------------------------
// Supplier Analytics APIs
// -------------------------------------------------------------
export async function getSupplierAnalyticsSummary(params?: AnalyticsFilterParams): Promise<SupplierAnalyticsSummaryResponse> {
  const res = await authenticatedFetch(`/api/v1/supplier/analytics/summary${buildQuery(params)}`);
  if (!res.ok) throw new Error("Failed to fetch supplier performance summary");
  return res.json();
}

export async function downloadSupplierExport(reportType: string, params?: AnalyticsFilterParams): Promise<void> {
  const url = `/api/v1/supplier/analytics/export/${encodeURIComponent(reportType)}${buildQuery(params)}`;
  const res = await authenticatedFetch(url);
  if (!res.ok) throw new Error(`Export failed for ${reportType}`);
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  let filename = `supplier_${reportType}_export.csv`;
  if (disposition) {
    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) filename = match[1];
  }
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}
