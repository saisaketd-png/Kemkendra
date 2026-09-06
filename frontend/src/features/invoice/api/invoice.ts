import { authenticatedFetch } from "@/features/auth/api/authenticatedFetch";
import {
  BusinessTaxProfile,
  CancelInvoiceRequest,
  ConfirmPaymentRequest,
  DisputeInvoiceRequest,
  DisputePaymentRequest,
  Invoice,
  InvoiceStatus,
  IssueInvoiceRequest,
  RecordPaymentRequest,
} from "../types/invoice";

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 1. Tax Profile
export async function getMyTaxProfile(): Promise<BusinessTaxProfile> {
  const res = await authenticatedFetch("/api/v1/tax-profile/me", { method: "GET" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to load business tax profile");
  }
  return res.json();
}

export async function updateMyTaxProfile(profile: Partial<BusinessTaxProfile>): Promise<BusinessTaxProfile> {
  const res = await authenticatedFetch("/api/v1/tax-profile/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to save business tax profile");
  }
  return res.json();
}

// 2. Issue Invoice (Supplier)
export async function issueInvoice(request: IssueInvoiceRequest): Promise<Invoice> {
  const res = await authenticatedFetch("/api/v1/invoices/issue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to issue tax invoice");
  }
  return res.json();
}

// 3. Buyer Endpoints
export async function getBuyerInvoices(
  status?: InvoiceStatus,
  page: number = 0,
  size: number = 10
): Promise<PageResponse<Invoice>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) params.append("status", status);

  const res = await authenticatedFetch(`/api/v1/invoices/buyer?${params.toString()}`, { method: "GET" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to fetch invoices");
  }
  return res.json();
}

export async function getBuyerInvoice(id: string): Promise<Invoice> {
  const res = await authenticatedFetch(`/api/v1/invoices/buyer/${id}`, { method: "GET" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Invoice not found");
  }
  return res.json();
}

export async function recordPayment(
  invoiceId: string,
  request: RecordPaymentRequest,
  file?: File
): Promise<Invoice> {
  if (file) {
    const formData = new FormData();
    formData.append("paymentReference", request.paymentReference);
    formData.append("paymentMode", request.paymentMode);
    formData.append("paymentDate", request.paymentDate);
    formData.append("amountPaid", String(request.amountPaid));
    if (request.currency) formData.append("currency", request.currency);
    if (request.bankName) formData.append("bankName", request.bankName);
    if (request.notes) formData.append("notes", request.notes);
    formData.append("file", file);

    const res = await authenticatedFetch(`/api/v1/invoices/${invoiceId}/payments`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Failed to record payment proof");
    }
    return res.json();
  }

  const res = await authenticatedFetch(`/api/v1/invoices/${invoiceId}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to record payment proof");
  }
  return res.json();
}

export async function disputeInvoice(invoiceId: string, request: DisputeInvoiceRequest): Promise<Invoice> {
  const res = await authenticatedFetch(`/api/v1/invoices/${invoiceId}/dispute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to dispute invoice");
  }
  return res.json();
}

// 4. Supplier Endpoints
export async function getSupplierInvoices(
  status?: InvoiceStatus,
  page: number = 0,
  size: number = 10
): Promise<PageResponse<Invoice>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) params.append("status", status);

  const res = await authenticatedFetch(`/api/v1/invoices/supplier?${params.toString()}`, { method: "GET" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to fetch invoices");
  }
  return res.json();
}

export async function getSupplierInvoice(id: string): Promise<Invoice> {
  const res = await authenticatedFetch(`/api/v1/invoices/supplier/${id}`, { method: "GET" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Invoice not found");
  }
  return res.json();
}

export async function confirmPayment(
  invoiceId: string,
  paymentId: string,
  request?: ConfirmPaymentRequest
): Promise<Invoice> {
  const res = await authenticatedFetch(`/api/v1/invoices/${invoiceId}/payments/${paymentId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request || {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to confirm payment");
  }
  return res.json();
}

export async function rejectPayment(
  invoiceId: string,
  paymentId: string,
  request: { rejectionReason: string }
): Promise<Invoice> {
  const res = await authenticatedFetch(`/api/v1/invoices/${invoiceId}/payments/${paymentId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to reject payment");
  }
  return res.json();
}

export async function requestPaymentInfo(
  invoiceId: string,
  paymentId: string,
  request: { message: string }
): Promise<Invoice> {
  const res = await authenticatedFetch(`/api/v1/invoices/${invoiceId}/payments/${paymentId}/request-info`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to request payment information");
  }
  return res.json();
}

export async function uploadPaymentProof(file: File): Promise<{
  storageKey: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await authenticatedFetch("/api/v1/payments/proof/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to upload payment proof document");
  }
  return res.json();
}

export async function downloadPaymentProofBlob(paymentRecordId: string, filename: string = "payment-proof"): Promise<void> {
  const res = await authenticatedFetch(`/api/v1/payments/${paymentRecordId}/proof`, { method: "GET" });
  if (!res.ok) {
    throw new Error("Failed to download payment proof");
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function disputePayment(
  invoiceId: string,
  paymentId: string,
  request: DisputePaymentRequest
): Promise<Invoice> {
  const res = await authenticatedFetch(`/api/v1/invoices/${invoiceId}/payments/${paymentId}/dispute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to dispute payment");
  }
  return res.json();
}

export async function cancelInvoice(invoiceId: string, request: CancelInvoiceRequest): Promise<Invoice> {
  const res = await authenticatedFetch(`/api/v1/invoices/${invoiceId}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to cancel invoice");
  }
  return res.json();
}

// 5. Admin Endpoints
export async function getAdminInvoices(
  status?: InvoiceStatus,
  page: number = 0,
  size: number = 20
): Promise<PageResponse<Invoice>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) params.append("status", status);

  const res = await authenticatedFetch(`/api/v1/admin/transactions/invoices?${params.toString()}`, { method: "GET" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to fetch admin invoices");
  }
  return res.json();
}

export async function getAdminInvoice(id: string): Promise<Invoice> {
  const res = await authenticatedFetch(`/api/v1/admin/transactions/invoices/${id}`, { method: "GET" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Invoice not found");
  }
  return res.json();
}

// 6. PDF Download Helper
export async function downloadInvoicePdfBlob(invoiceId: string, filename: string = "invoice.pdf"): Promise<void> {
  const res = await authenticatedFetch(`/api/v1/invoices/${invoiceId}/pdf`, { method: "GET" });
  if (!res.ok) {
    throw new Error("Failed to download invoice PDF");
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
