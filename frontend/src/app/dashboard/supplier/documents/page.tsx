"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileCheck,
  ShieldCheck,
  Award,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
  RefreshCw,
  Search,
} from "lucide-react";
import { authenticatedFetch } from "@/features/auth/api/authenticatedFetch";
import { DocumentList } from "@/shared/components/documents/DocumentList";
import { DocumentResponse, getDocuments } from "@/features/documents/api/documentApi";
import { PageHeader } from "@/shared/components/ui/KemkendraUI";

const COMPLIANCE_CATEGORIES = [
  { value: "GST_CERTIFICATE", label: "GST Certificate" },
  { value: "PAN_CARD", label: "PAN Card" },
  { value: "COMPANY_LICENSE", label: "Business / Incorporation License" },
  { value: "DRUG_LICENSE", label: "Drug Manufacturing License" },
  { value: "FACTORY_LICENSE", label: "Factory Operational License" },
  { value: "POLLUTION_CLEARANCE", label: "Pollution Control Board NOC" },
];

const QUALITY_CATEGORIES = [
  { value: "ISO_CERTIFICATE", label: "ISO / Quality Management Certificate" },
  { value: "GMP_CERTIFICATE", label: "Good Manufacturing Practice (GMP)" },
  { value: "REACH_COMPLIANCE", label: "REACH Compliance" },
  { value: "HALAL_CERTIFICATE", label: "Halal Certification" },
  { value: "KOSHER_CERTIFICATE", label: "Kosher Certification" },
];

const TECHNICAL_CATEGORIES = [
  { value: "TECHNICAL_DATA_SHEET", label: "Technical Data Sheet (TDS)" },
  { value: "SAFETY_DATA_SHEET", label: "Safety Data Sheet (MSDS/SDS)" },
  { value: "CERTIFICATE_OF_ANALYSIS", label: "Certificate of Analysis (COA)" },
];

const COMMERCIAL_CATEGORIES = [
  { value: "COMMERCIAL_INVOICE", label: "Commercial Invoice" },
  { value: "PACKING_LIST", label: "Packing List" },
  { value: "PURCHASE_ORDER", label: "Purchase Order Attachment" },
  { value: "RFQ_ATTACHMENT", label: "RFQ Attachment" },
  { value: "QUOTATION_ATTACHMENT", label: "Quotation Spec Attachment" },
  { value: "DELIVERY_CONFIRMATION", label: "Delivery Confirmation / POD" },
];

export default function SupplierDocumentsVaultPage() {
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("Supplier Vault");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "COMPLIANCE" | "QUALITY" | "TECHNICAL" | "COMMERCIAL">("ALL");

  // Summary Metrics
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    expiringSoon: 0,
    expired: 0,
    versions: 0,
  });

  const loadSupplierProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch("/api/v1/supplier/profile");
      if (res.ok) {
        const data = await res.json();
        // Use user ID or supplier ID as ownerId
        const resolvedId = data.userId || data.id?.toString();
        setSupplierId(resolvedId);
        setCompanyName(data.companyName || data.name || "Supplier Documents");

        // Load all active documents for stats
        const docs = await getDocuments("SUPPLIER", resolvedId, true);
        setDocuments(docs);

        const activeDocs = docs.filter((d) => d.isActive);
        setStats({
          total: activeDocs.length,
          valid: activeDocs.filter((d) => d.expiryStatus === "VALID" || d.expiryStatus === "NO_EXPIRY").length,
          expiringSoon: activeDocs.filter((d) => d.expiryStatus === "EXPIRING_SOON").length,
          expired: activeDocs.filter((d) => d.expiryStatus === "EXPIRED").length,
          versions: docs.length,
        });
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSupplierProfile();
  }, [loadSupplierProfile]);

  const getFilteredCategories = () => {
    switch (activeTab) {
      case "COMPLIANCE":
        return COMPLIANCE_CATEGORIES;
      case "QUALITY":
        return QUALITY_CATEGORIES;
      case "TECHNICAL":
        return TECHNICAL_CATEGORIES;
      case "COMMERCIAL":
        return COMMERCIAL_CATEGORIES;
      default:
        return [
          ...COMPLIANCE_CATEGORIES,
          ...QUALITY_CATEGORIES,
          ...TECHNICAL_CATEGORIES,
          ...COMMERCIAL_CATEGORIES,
          { value: "OTHER", label: "Other Governed Document" },
        ];
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-5 text-[#0F172A]">
      {/* 1. Page Header */}
      <PageHeader
        title="Compliance & Technical Documents Vault"
        description={`Cryptographic document repository (SHA-256 Governed) for ${companyName} statutory certificates, accreditations, and quality filings.`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/supplier/verification"
              className="h-9 px-3.5 text-xs font-semibold bg-white text-[#0F172A] border border-slate-200 hover:bg-[#F8F9FA] rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 press-tactile"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
              <span>Verification Status</span>
            </Link>
            <button
              onClick={loadSupplierProfile}
              className="h-9 px-3.5 text-xs font-semibold text-[#0F172A] bg-white border border-slate-200 hover:bg-[#F8F9FA] rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer press-tactile"
              title="Refresh documents"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {/* 2. Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-tactile-card">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-[11px] font-semibold">Active Records</span>
            <FolderOpen className="w-3.5 h-3.5 text-[#0052CC]" />
          </div>
          <div className="text-xl font-bold text-[#0F172A]">{stats.total}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Governed records</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-tactile-card">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-[11px] font-semibold">Valid & Verified</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
          </div>
          <div className="text-xl font-bold text-[#059669]">{stats.valid}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Compliant & current</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-tactile-card">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-[11px] font-semibold">Expiring Soon</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-600">{stats.expiringSoon}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Within 30 days</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-tactile-card">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-[11px] font-semibold">Expired</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-xl font-bold text-red-600">{stats.expired}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Requires renewal</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-tactile-card">
          <div className="flex items-center justify-between text-[#64748B] mb-1">
            <span className="text-[11px] font-semibold">Audit Lineage</span>
            <FileText className="w-3.5 h-3.5 text-[#64748B]" />
          </div>
          <div className="text-xl font-bold text-[#0F172A]">{stats.versions}</div>
          <div className="text-[11px] text-[#64748B] mt-0.5">Version revisions</div>
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`h-9 px-3.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer press-tactile ${
            activeTab === "ALL"
              ? "bg-[#0052CC] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
          }`}
        >
          All Vault Records
        </button>

        <button
          onClick={() => setActiveTab("COMPLIANCE")}
          className={`h-9 px-3.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer press-tactile ${
            activeTab === "COMPLIANCE"
              ? "bg-[#0052CC] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
          }`}
        >
          Statutory & Compliance
        </button>

        <button
          onClick={() => setActiveTab("QUALITY")}
          className={`h-9 px-3.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer press-tactile ${
            activeTab === "QUALITY"
              ? "bg-[#0052CC] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
          }`}
        >
          Quality & Certifications (ISO/GMP)
        </button>

        <button
          onClick={() => setActiveTab("TECHNICAL")}
          className={`h-9 px-3.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer press-tactile ${
            activeTab === "TECHNICAL"
              ? "bg-[#0052CC] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
          }`}
        >
          Technical Data (TDS/MSDS/COA)
        </button>

        <button
          onClick={() => setActiveTab("COMMERCIAL")}
          className={`h-9 px-3.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer press-tactile ${
            activeTab === "COMMERCIAL"
              ? "bg-[#0052CC] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100"
          }`}
        >
          Commercial & Shipments
        </button>
      </div>

      {/* Main Document List Area */}
      {loading || !supplierId ? (
        <div className="py-20 text-center text-zinc-400 text-sm">
          Loading your document vault...
        </div>
      ) : (
        <DocumentList
          key={`${supplierId}-${activeTab}`}
          ownerType="SUPPLIER"
          ownerId={supplierId}
          title={
            activeTab === "COMPLIANCE"
              ? "Statutory & Compliance Certificates"
              : activeTab === "QUALITY"
              ? "Quality Management & Certifications"
              : activeTab === "TECHNICAL"
              ? "Technical Specifications & Safety Data"
              : activeTab === "COMMERCIAL"
              ? "Commercial Records & Shipment Deliveries"
              : "All Documents in Vault"
          }
          description="Governed records with SHA-256 integrity digest, revision histories, and dynamic expiry tracking"
          availableCategories={getFilteredCategories()}
          canUpload={true}
          canManage={true}
        />
      )}
    </div>
  );
}
