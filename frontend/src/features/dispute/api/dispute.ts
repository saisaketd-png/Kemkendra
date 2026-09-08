import { authenticatedFetch } from "@/features/auth/api/authenticatedFetch";
import { PageResponse } from "@/features/invoice/api/invoice";
import {
  AssignDisputeRequest,
  CreateDisputeRequest,
  Dispute,
  DisputeStatus,
  RejectDisputeRequest,
  ResolveDisputeRequest,
  RespondDisputeRequest,
  UpdateDisputeStatusRequest,
} from "../types/dispute";

// 1. Buyer Endpoints
export async function createDispute(request: CreateDisputeRequest, file?: File): Promise<Dispute> {
  const formData = new FormData();
  formData.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));
  if (file) {
    formData.append("file", file);
  }

  const res = await authenticatedFetch("/api/v1/disputes", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to raise dispute");
  }
  return res.json();
}

export async function getBuyerDisputes(
  status?: DisputeStatus,
  page: number = 0,
  size: number = 10
): Promise<PageResponse<Dispute>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) params.append("status", status);

  const res = await authenticatedFetch(`/api/v1/disputes/my?${params.toString()}`, { method: "GET" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to load disputes");
  }
  return res.json();
}

export async function getBuyerDispute(id: string): Promise<Dispute> {
  const res = await authenticatedFetch(`/api/v1/disputes/my/${id}`, { method: "GET" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Dispute not found");
  }
  return res.json();
}

export async function respondToBuyerDispute(
  id: string,
  request: RespondDisputeRequest,
  file?: File
): Promise<Dispute> {
  const formData = new FormData();
  formData.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));
  if (file) {
    formData.append("file", file);
  }

  const res = await authenticatedFetch(`/api/v1/disputes/my/${id}/respond`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to submit response");
  }
  return res.json();
}

// 2. Supplier Endpoints
export async function getSupplierDisputes(
  status?: DisputeStatus,
  page: number = 0,
  size: number = 10
): Promise<PageResponse<Dispute>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) params.append("status", status);

  const res = await authenticatedFetch(`/api/v1/disputes/supplier?${params.toString()}`, { method: "GET" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to load disputes");
  }
  return res.json();
}

export async function getSupplierDispute(id: string): Promise<Dispute> {
  const res = await authenticatedFetch(`/api/v1/disputes/supplier/${id}`, { method: "GET" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Dispute not found");
  }
  return res.json();
}

export async function respondToSupplierDispute(
  id: string,
  request: RespondDisputeRequest,
  file?: File
): Promise<Dispute> {
  const formData = new FormData();
  formData.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));
  if (file) {
    formData.append("file", file);
  }

  const res = await authenticatedFetch(`/api/v1/disputes/supplier/${id}/respond`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to submit response");
  }
  return res.json();
}

// 3. Admin Endpoints
export async function getAdminDisputes(
  status?: DisputeStatus,
  page: number = 0,
  size: number = 20
): Promise<PageResponse<Dispute>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) params.append("status", status);

  const res = await authenticatedFetch(`/api/v1/admin/disputes?${params.toString()}`, { method: "GET" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to fetch admin disputes");
  }
  return res.json();
}

export async function getAdminDispute(id: string): Promise<Dispute> {
  const res = await authenticatedFetch(`/api/v1/admin/disputes/${id}`, { method: "GET" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Dispute not found");
  }
  return res.json();
}

export async function assignDispute(id: string, request: AssignDisputeRequest): Promise<Dispute> {
  const res = await authenticatedFetch(`/api/v1/admin/disputes/${id}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to assign dispute");
  }
  return res.json();
}

export async function updateDisputeStatus(id: string, request: UpdateDisputeStatusRequest): Promise<Dispute> {
  const res = await authenticatedFetch(`/api/v1/admin/disputes/${id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to update dispute status");
  }
  return res.json();
}

export async function resolveDispute(id: string, request: ResolveDisputeRequest): Promise<Dispute> {
  const res = await authenticatedFetch(`/api/v1/admin/disputes/${id}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to resolve dispute");
  }
  return res.json();
}

export async function rejectDispute(id: string, request: RejectDisputeRequest): Promise<Dispute> {
  const res = await authenticatedFetch(`/api/v1/admin/disputes/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to reject dispute");
  }
  return res.json();
}

export async function respondToAdminDispute(
  id: string,
  request: RespondDisputeRequest,
  file?: File
): Promise<Dispute> {
  const formData = new FormData();
  formData.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));
  if (file) {
    formData.append("file", file);
  }

  const res = await authenticatedFetch(`/api/v1/admin/disputes/${id}/respond`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to post message to dispute");
  }
  return res.json();
}

// 4. Attachment Download
export async function downloadDisputeAttachment(
  disputeId: string,
  attachmentId: string,
  filename: string
): Promise<void> {
  const res = await authenticatedFetch(`/api/v1/disputes/${disputeId}/attachments/${attachmentId}`, {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error("Failed to download dispute attachment");
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
