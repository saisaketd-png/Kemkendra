import { authenticatedFetch } from "@/features/auth/api/authenticatedFetch";

export type DocumentExpiryStatus = "VALID" | "EXPIRING_SOON" | "EXPIRED" | "NO_EXPIRY";

export type DocumentVerificationStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "REPLACED"
  | "ARCHIVED"
  | "ACTIVE";

export interface DocumentResponse {
  id: string;
  documentGroupId?: string;
  ownerType: string;
  ownerId: string;
  category: string;
  title?: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  isPublic?: boolean;
  replacedById?: string;
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  version?: number;
  checksum?: string;
  description?: string;
  isActive?: boolean;
  status?: DocumentVerificationStatus;
  verificationStatus?: DocumentVerificationStatus;
  expiryStatus?: DocumentExpiryStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface DocumentComplianceStatsDto {
  totalCount: number;
  pendingReviewCount: number;
  approvedCount: number;
  rejectedCount: number;
  expiredCount: number;
  expiringSoonCount: number;
}

export interface DocumentPageResponse {
  content: DocumentResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface UploadDocumentParams {
  ownerType: string;
  ownerId: string;
  category: string;
  file: File;
  title?: string;
  isPublic?: boolean;
  documentGroupId?: string;
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  description?: string;
}

export async function getDocuments(
  ownerType: string,
  ownerId: string,
  includeHistory: boolean = false
): Promise<DocumentResponse[]> {
  const res = await authenticatedFetch(
    `/api/v1/documents?ownerType=${encodeURIComponent(ownerType)}&ownerId=${encodeURIComponent(ownerId)}&includeHistory=${includeHistory}`
  );
  if (!res.ok) {
    if (res.status === 403 || res.status === 404) return [];
    throw new Error("Failed to load documents");
  }
  return res.json();
}

export async function getDocumentVersions(documentGroupId: string): Promise<DocumentResponse[]> {
  const res = await authenticatedFetch(`/api/v1/documents/groups/${encodeURIComponent(documentGroupId)}/versions`);
  if (!res.ok) {
    if (res.status === 403 || res.status === 404) return [];
    throw new Error("Failed to load document version history");
  }
  return res.json();
}

export async function uploadDocument(
  paramsOrOwnerType: UploadDocumentParams | string,
  ownerId?: string,
  category?: string,
  file?: File
): Promise<DocumentResponse> {
  const formData = new FormData();

  if (typeof paramsOrOwnerType === "string") {
    formData.append("ownerType", paramsOrOwnerType);
    if (ownerId) formData.append("ownerId", ownerId);
    if (category) formData.append("category", category);
    if (file) formData.append("file", file);
  } else {
    const params = paramsOrOwnerType;
    formData.append("ownerType", params.ownerType);
    formData.append("ownerId", params.ownerId);
    formData.append("category", params.category);
    formData.append("file", params.file);

    if (params.title) {
      formData.append("title", params.title);
    }
    if (params.isPublic !== undefined) {
      formData.append("isPublic", String(params.isPublic));
    }
    if (params.documentGroupId) {
      formData.append("documentGroupId", params.documentGroupId);
    }
    if (params.documentNumber) {
      formData.append("documentNumber", params.documentNumber);
    }
    if (params.issuingAuthority) {
      formData.append("issuingAuthority", params.issuingAuthority);
    }
    if (params.issueDate) {
      formData.append("issueDate", params.issueDate);
    }
    if (params.expiryDate) {
      formData.append("expiryDate", params.expiryDate);
    }
    if (params.description) {
      formData.append("description", params.description);
    }
  }

  const res = await authenticatedFetch(`/api/v1/documents`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let err = "Failed to upload document";
    try {
      const data = await res.json();
      err = data.error || data.message || err;
    } catch {}
    throw new Error(err);
  }
  return res.json();
}

export async function deactivateDocument(documentId: string): Promise<DocumentResponse> {
  const res = await authenticatedFetch(`/api/v1/documents/${encodeURIComponent(documentId)}/deactivate`, {
    method: "PATCH",
  });
  if (!res.ok) {
    let err = "Failed to deactivate document";
    try {
      const data = await res.json();
      err = data.error || data.message || err;
    } catch {}
    throw new Error(err);
  }
  return res.json();
}

export async function deleteDocument(documentId: string): Promise<void> {
  const res = await authenticatedFetch(`/api/v1/documents/${encodeURIComponent(documentId)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    let err = "Failed to delete document";
    try {
      const data = await res.json();
      err = data.error || data.message || err;
    } catch {}
    throw new Error(err);
  }
}

export async function downloadDocument(documentId: string, filename: string): Promise<void> {
  const res = await authenticatedFetch(`/api/v1/documents/${encodeURIComponent(documentId)}/download`);
  if (!res.ok) {
    let err = "Failed to download document";
    try {
      const data = await res.json();
      err = data.error || data.message || err;
    } catch {}
    throw new Error(err);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// ---------------- Admin Compliance APIs ----------------

export async function getAdminComplianceStats(): Promise<DocumentComplianceStatsDto> {
  const res = await authenticatedFetch("/api/v1/admin/documents/stats");
  if (!res.ok) {
    throw new Error("Failed to fetch compliance stats");
  }
  return res.json();
}

export async function getAdminDocuments(params: {
  status?: string;
  category?: string;
  ownerType?: string;
  ownerId?: string;
  search?: string;
  page?: number;
  size?: number;
}): Promise<DocumentPageResponse> {
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== "ALL") searchParams.append("status", params.status);
  if (params.category && params.category !== "ALL") searchParams.append("category", params.category);
  if (params.ownerType && params.ownerType !== "ALL") searchParams.append("ownerType", params.ownerType);
  if (params.ownerId) searchParams.append("ownerId", params.ownerId);
  if (params.search) searchParams.append("search", params.search);
  if (params.page !== undefined) searchParams.append("page", String(params.page));
  if (params.size !== undefined) searchParams.append("size", String(params.size));

  const res = await authenticatedFetch(`/api/v1/admin/documents?${searchParams.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to load admin compliance documents");
  }
  return res.json();
}

export async function approveDocument(id: string, notes?: string): Promise<DocumentResponse> {
  const res = await authenticatedFetch(`/api/v1/admin/documents/${encodeURIComponent(id)}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reviewNotes: notes || "" }),
  });
  if (!res.ok) {
    let err = "Failed to approve document";
    try {
      const data = await res.json();
      err = data.error || data.message || err;
    } catch {}
    throw new Error(err);
  }
  return res.json();
}

export async function rejectDocument(id: string, reason: string): Promise<DocumentResponse> {
  const res = await authenticatedFetch(`/api/v1/admin/documents/${encodeURIComponent(id)}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reviewNotes: reason }),
  });
  if (!res.ok) {
    let err = "Failed to reject document";
    try {
      const data = await res.json();
      err = data.error || data.message || err;
    } catch {}
    throw new Error(err);
  }
  return res.json();
}

export async function expireDocument(id: string, reason?: string): Promise<DocumentResponse> {
  const res = await authenticatedFetch(`/api/v1/admin/documents/${encodeURIComponent(id)}/expire`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reviewNotes: reason || "Manually marked expired" }),
  });
  if (!res.ok) {
    let err = "Failed to expire document";
    try {
      const data = await res.json();
      err = data.error || data.message || err;
    } catch {}
    throw new Error(err);
  }
  return res.json();
}

export async function getDocumentAuditHistory(id: string): Promise<any[]> {
  const res = await authenticatedFetch(`/api/v1/admin/documents/${encodeURIComponent(id)}/audit`);
  if (!res.ok) {
    return [];
  }
  return res.json();
}
