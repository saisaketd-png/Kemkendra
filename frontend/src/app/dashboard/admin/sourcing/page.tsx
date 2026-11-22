"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FlaskConical,
  Search,
  Filter,
  RefreshCw,
  Eye,
  UserCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Send,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  FileCheck,
  Upload,
  Lock,
  Copy,
  Check,
  Plus,
  Edit3,
  Trash2,
  History,
  Globe,
  ExternalLink,
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  Scale,
  Sparkles,
  SendHorizonal,
  FileSpreadsheet,
  Download,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  SourcingStats,
  SourcingRequestSummary,
  SourcingRequestDetail,
  SourcingStatus,
  SourcingSupplierItem,
  SourcingOutreachLogItem,
  SourcingQuotationItem,
  SourcingProposalItem,
  SourcingProposalOptionItem,
  RegisteredSupplierLookup,
  AddSupplierPayload,
  UpdateSupplierPayload,
  CreateOutreachPayload,
  AddQuotationPayload,
  UpdateQuotationPayload,
  CreateProposalPayload,
  CreateProposalOptionPayload,
  fetchSourcingStats,
  fetchAdminSourcingRequests,
  fetchAdminSourcingRequestDetail,
  updateSourcingRequestStatus,
  assignSourcingExecutive,
  updateSourcingNotes,
  fetchAdminUsersDirectory,
  addSupplierToRequest,
  updateSupplierInRequest,
  deleteSupplierFromRequest,
  logSupplierOutreach,
  fetchSupplierOutreachHistory,
  searchRegisteredSuppliers,
  addQuotationToRequest,
  updateQuotationInRequest,
  deleteQuotationFromRequest,
  createProposalForRequest,
  publishProposalForRequest,
  deleteProposalFromRequest,
} from "@/features/admin/api/adminSourcingApi";

const ALL_STATUSES: { value: SourcingStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "SUBMITTED", label: "New (Submitted)" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "MORE_INFORMATION_REQUIRED", label: "More Info Required" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "SOURCING", label: "Sourcing in Progress" },
  { value: "SUPPLIER_CONTACTED", label: "Supplier Contacted" },
  { value: "QUOTATIONS_RECEIVED", label: "Quotations Received" },
  { value: "PROPOSAL_READY", label: "Proposal Ready" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "FULFILLED", label: "Fulfilled" },
  { value: "CLOSED", label: "Closed" },
  { value: "REJECTED", label: "Rejected" },
];

export default function AdminSourcingPage() {
  // Stats state
  const [stats, setStats] = useState<SourcingStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Requests table state
  const [requests, setRequests] = useState<SourcingRequestSummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 15;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Drawer / Detail modal state
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SourcingRequestDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"requirements" | "suppliers" | "quotations" | "proposals" | "management" | "history">("requirements");

  // =========================================================================
  // SUPPLIER QUOTATION STATES
  // =========================================================================
  const [isAddQuotationOpen, setIsAddQuotationOpen] = useState(false);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);
  const [quotationForm, setQuotationForm] = useState<AddQuotationPayload>({
    sourcingSupplierId: "",
    productName: "",
    unitPrice: 0,
    currency: "INR",
    unit: "",
    minimumOrderQuantity: 0,
    availableQuantity: 0,
    productGrade: "",
    puritySpecifications: "",
    packaging: "",
    leadTimeDays: 7,
    deliveryCharges: 0,
    paymentTerms: "100% Against PI / Advance",
    incoterms: "EXW",
    validUntil: "",
    notes: "",
    attachmentUrl: "",
    supportingDocuments: "",
    shareWithBuyer: false,
  });
  const [quotationSubmitting, setQuotationSubmitting] = useState(false);
  const [quotationActionError, setQuotationActionError] = useState<string | null>(null);

  // Selected quotations for building proposals
  const [selectedQuotationIdsForProposal, setSelectedQuotationIdsForProposal] = useState<string[]>([]);

  // =========================================================================
  // BUYER PROPOSAL STATES
  // =========================================================================
  const [isCreateProposalOpen, setIsCreateProposalOpen] = useState(false);
  const [proposalForm, setProposalForm] = useState<CreateProposalPayload>({
    title: "",
    summaryNotes: "",
    recommendationNotes: "",
    termsAndConditions: "Standard KemKendra commercial escrow terms apply. Pre-shipment batch analysis and COA verification mandatory before dispatch.",
    proposalDocumentUrl: "",
    publishImmediately: false,
    options: [],
  });
  const [proposalSubmitting, setProposalSubmitting] = useState(false);
  const [proposalActionError, setProposalActionError] = useState<string | null>(null);

  // Admin users for executive assignment
  const [adminUsers, setAdminUsers] = useState<{ id: string; name: string; email: string }[]>([]);

  // Form states for management actions
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusReason, setStatusReason] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  const [selectedExecutiveId, setSelectedExecutiveId] = useState("");
  const [assignmentNote, setAssignmentNote] = useState("");
  const [assignmentUpdating, setAssignmentUpdating] = useState(false);

  const [internalNotesText, setInternalNotesText] = useState("");
  const [notesUpdating, setNotesUpdating] = useState(false);

  const [copiedRef, setCopiedRef] = useState(false);

  // =========================================================================
  // SUPPLIER MANAGEMENT STATES
  // =========================================================================
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [addSupplierForm, setAddSupplierForm] = useState<AddSupplierPayload>({
    supplierName: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    location: "",
    supplierType: "MANUFACTURER",
    productsSupplied: "",
    verificationStatus: "UNVERIFIED",
    notes: "",
    supplierId: undefined,
  });
  const [addSupplierLoading, setAddSupplierLoading] = useState(false);
  const [addSupplierError, setAddSupplierError] = useState<string | null>(null);

  // Autocomplete directory search for registered KemKendra suppliers
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [directoryResults, setDirectoryResults] = useState<RegisteredSupplierLookup[]>([]);
  const [directorySearching, setDirectorySearching] = useState(false);

  // Edit Supplier Modal
  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SourcingSupplierItem | null>(null);
  const [editSupplierForm, setEditSupplierForm] = useState<UpdateSupplierPayload>({
    supplierName: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    location: "",
    supplierType: "MANUFACTURER",
    productsSupplied: "",
    verificationStatus: "UNVERIFIED",
    status: "IDENTIFIED",
    notes: "",
  });
  const [editSupplierLoading, setEditSupplierLoading] = useState(false);
  const [editSupplierError, setEditSupplierError] = useState<string | null>(null);

  // Log Outreach Modal
  const [isOutreachOpen, setIsOutreachOpen] = useState(false);
  const [outreachSupplier, setOutreachSupplier] = useState<SourcingSupplierItem | null>(null);
  const [outreachForm, setOutreachForm] = useState<CreateOutreachPayload>({
    outreachChannel: "PHONE",
    contactDate: new Date().toISOString().slice(0, 16),
    contactPerson: "",
    responseStatus: "PENDING",
    subject: "",
    details: "",
    nextFollowUpDate: "",
    notes: "",
  });
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachError, setOutreachError] = useState<string | null>(null);

  // Outreach History Modal
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySupplier, setHistorySupplier] = useState<SourcingSupplierItem | null>(null);
  const [supplierHistoryLogs, setSupplierHistoryLogs] = useState<SourcingOutreachLogItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load stats
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await fetchSourcingStats();
      setStats(data);
    } catch {
      // stats error handled gracefully
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Load table requests
  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminSourcingRequests({
        page: currentPage,
        size: pageSize,
        status: statusFilter || undefined,
        query: searchQuery.trim() || undefined,
      });
      setRequests(res.content || []);
      setTotalElements(res.totalElements || 0);
      setTotalPages(res.totalPages || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load sourcing requests");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery]);

  // Load admin users list for executive assignment
  useEffect(() => {
    fetchAdminUsersDirectory().then(setAdminUsers).catch(() => {});
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Load Request Details
  const handleOpenDetail = async (id: string) => {
    setSelectedRequestId(id);
    setDetailLoading(true);
    setDetailError(null);
    setActiveTab("requirements");
    setIsAddSupplierOpen(false);

    try {
      const data = await fetchAdminSourcingRequestDetail(id);
      setDetail(data);
      setNewStatus(data.status);
      setSelectedExecutiveId(data.assignedToUserId || "");
      setInternalNotesText(data.notes || "");
    } catch (err: any) {
      setDetailError(err.message || "Failed to load request details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRefreshDetail = async () => {
    if (!selectedRequestId) return;
    try {
      const data = await fetchAdminSourcingRequestDetail(selectedRequestId);
      setDetail(data);
      setNewStatus(data.status);
      setSelectedExecutiveId(data.assignedToUserId || "");
      setInternalNotesText(data.notes || "");
      loadStats();
      loadRequests();
    } catch {}
  };

  const handleCloseDetail = () => {
    setSelectedRequestId(null);
    setDetail(null);
    setDetailError(null);
    setIsAddSupplierOpen(false);
  };

  // Status Update Handler
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !newStatus) return;

    setStatusUpdating(true);
    try {
      const updated = await updateSourcingRequestStatus(selectedRequestId, {
        status: newStatus,
        reasonOrNotes: statusReason.trim() || undefined,
      });
      setDetail(updated);
      setStatusReason("");
      loadStats();
      loadRequests();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Assign Executive Handler
  const handleAssignExecutive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !selectedExecutiveId) return;

    setAssignmentUpdating(true);
    try {
      const updated = await assignSourcingExecutive(selectedRequestId, {
        assignedToUserId: selectedExecutiveId,
        notes: assignmentNote.trim() || undefined,
      });
      setDetail(updated);
      setAssignmentNote("");
      loadStats();
      loadRequests();
    } catch (err: any) {
      alert(err.message || "Failed to assign executive");
    } finally {
      setAssignmentUpdating(false);
    }
  };

  // Save Internal Notes Handler
  const handleSaveNotes = async () => {
    if (!selectedRequestId) return;
    setNotesUpdating(true);
    try {
      const updated = await updateSourcingNotes(selectedRequestId, {
        notes: internalNotesText,
      });
      setDetail(updated);
    } catch (err: any) {
      alert(err.message || "Failed to save notes");
    } finally {
      setNotesUpdating(false);
    }
  };

  // Request Info from Buyer shortcut
  const handleRequestMoreInfo = async () => {
    if (!selectedRequestId) return;
    const note = window.prompt("Enter specific details or missing documents required from the buyer:");
    if (!note || !note.trim()) return;

    setStatusUpdating(true);
    try {
      const updated = await updateSourcingRequestStatus(selectedRequestId, {
        status: "MORE_INFORMATION_REQUIRED",
        reasonOrNotes: note.trim(),
      });
      setDetail(updated);
      setNewStatus("MORE_INFORMATION_REQUIRED");
      loadStats();
      loadRequests();
    } catch (err: any) {
      alert(err.message || "Failed to request information");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Copy reference
  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // =========================================================================
  // SUPPLIER DIRECTORY SEARCH & SELECTION HANDLERS
  // =========================================================================
  const handleSearchDirectory = async () => {
    if (!directoryQuery.trim()) {
      setDirectoryResults([]);
      return;
    }
    setDirectorySearching(true);
    try {
      const results = await searchRegisteredSuppliers(directoryQuery.trim());
      setDirectoryResults(results);
    } catch {
      setDirectoryResults([]);
    } finally {
      setDirectorySearching(false);
    }
  };

  const handleSelectRegisteredSupplier = (supp: RegisteredSupplierLookup) => {
    setAddSupplierForm((prev) => ({
      ...prev,
      supplierId: supp.id,
      supplierName: supp.name,
      contactPerson: supp.contactPerson || "",
      contactEmail: supp.businessEmail || "",
      contactPhone: supp.businessPhone || "",
      website: supp.website || "",
      location: supp.location || "",
      supplierType: supp.businessType || "MANUFACTURER",
      verificationStatus: supp.verificationStatus || (supp.verified ? "VERIFIED" : "UNVERIFIED"),
      productsSupplied: supp.primaryCategories || "",
    }));
    setDirectoryResults([]);
    setDirectoryQuery("");
  };

  // Add Supplier Submit
  const handleAddSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !addSupplierForm.supplierName.trim()) return;

    setAddSupplierLoading(true);
    setAddSupplierError(null);
    try {
      await addSupplierToRequest(selectedRequestId, addSupplierForm);
      await handleRefreshDetail();
      setIsAddSupplierOpen(false);
      setAddSupplierForm({
        supplierName: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        website: "",
        location: "",
        supplierType: "MANUFACTURER",
        productsSupplied: "",
        verificationStatus: "UNVERIFIED",
        notes: "",
        supplierId: undefined,
      });
    } catch (err: any) {
      setAddSupplierError(err.message || "Failed to add supplier");
    } finally {
      setAddSupplierLoading(false);
    }
  };

  // Edit Supplier Modal Handlers
  const handleOpenEditSupplier = (s: SourcingSupplierItem) => {
    setEditingSupplier(s);
    setEditSupplierForm({
      supplierName: s.supplierName,
      contactPerson: s.contactPerson || "",
      contactEmail: s.contactEmail || "",
      contactPhone: s.contactPhone || "",
      website: s.website || "",
      location: s.location || "",
      supplierType: s.supplierType || "MANUFACTURER",
      productsSupplied: s.productsSupplied || "",
      verificationStatus: s.verificationStatus || "UNVERIFIED",
      status: s.status || "IDENTIFIED",
      notes: s.notes || "",
      supplierId: s.supplierId,
    });
    setEditSupplierError(null);
    setIsEditSupplierOpen(true);
  };

  const handleEditSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !editingSupplier) return;

    setEditSupplierLoading(true);
    setEditSupplierError(null);
    try {
      await updateSupplierInRequest(selectedRequestId, editingSupplier.id, editSupplierForm);
      await handleRefreshDetail();
      setIsEditSupplierOpen(false);
      setEditingSupplier(null);
    } catch (err: any) {
      setEditSupplierError(err.message || "Failed to update supplier");
    } finally {
      setEditSupplierLoading(false);
    }
  };

  // Delete Supplier
  const handleDeleteSupplier = async (supplierId: string, supplierName: string) => {
    if (!selectedRequestId) return;
    if (!window.confirm(`Are you sure you want to remove "${supplierName}" from this sourcing request?`)) return;

    try {
      await deleteSupplierFromRequest(selectedRequestId, supplierId);
      await handleRefreshDetail();
    } catch (err: any) {
      alert(err.message || "Failed to delete supplier");
    }
  };

  // Log Outreach Modal Handlers
  const handleOpenOutreach = (s: SourcingSupplierItem) => {
    setOutreachSupplier(s);
    setOutreachForm({
      sourcingSupplierId: s.id,
      outreachChannel: "PHONE",
      contactDate: new Date().toISOString().slice(0, 16),
      contactPerson: s.contactPerson || "",
      responseStatus: "PENDING",
      subject: `Inquired regarding ${detail?.productName || "Product"} specifications & pricing`,
      details: "",
      nextFollowUpDate: "",
      notes: "",
    });
    setOutreachError(null);
    setIsOutreachOpen(true);
  };

  const handleOutreachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !outreachForm.details.trim()) return;

    setOutreachLoading(true);
    setOutreachError(null);
    try {
      const payload: CreateOutreachPayload = {
        ...outreachForm,
        sourcingSupplierId: outreachSupplier?.id,
        contactDate: outreachForm.contactDate ? new Date(outreachForm.contactDate).toISOString() : undefined,
        nextFollowUpDate: outreachForm.nextFollowUpDate ? new Date(outreachForm.nextFollowUpDate).toISOString() : undefined,
      };
      await logSupplierOutreach(selectedRequestId, payload);
      await handleRefreshDetail();
      setIsOutreachOpen(false);
      setOutreachSupplier(null);
    } catch (err: any) {
      setOutreachError(err.message || "Failed to log outreach");
    } finally {
      setOutreachLoading(false);
    }
  };

  // View Outreach History
  const handleOpenHistory = async (s: SourcingSupplierItem) => {
    if (!selectedRequestId) return;
    setHistorySupplier(s);
    setHistoryLoading(true);
    setIsHistoryOpen(true);
    try {
      const logs = await fetchSupplierOutreachHistory(selectedRequestId, s.id);
      setSupplierHistoryLogs(logs);
    } catch {
      setSupplierHistoryLogs([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // =========================================================================
  // QUOTATION MANAGEMENT HANDLERS
  // =========================================================================
  const handleOpenAddQuotation = () => {
    if (!detail) return;
    setEditingQuotationId(null);
    setQuotationForm({
      sourcingSupplierId: detail.suppliers?.[0]?.id || "",
      productName: detail.productName || "",
      unitPrice: detail.targetPrice || 0,
      currency: detail.currency || "INR",
      unit: detail.unit || "KG",
      minimumOrderQuantity: detail.quantity ? Math.max(1, Math.round(detail.quantity * 0.1)) : 10,
      availableQuantity: detail.quantity || 100,
      productGrade: detail.grade || "",
      puritySpecifications: detail.specifications || "",
      packaging: detail.packaging || "Standard Export Packaging",
      leadTimeDays: 7,
      deliveryCharges: 0,
      paymentTerms: "100% Against PI / Advance",
      incoterms: "EXW",
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      notes: "",
      attachmentUrl: "",
      supportingDocuments: "",
      shareWithBuyer: false,
    });
    setQuotationActionError(null);
    setIsAddQuotationOpen(true);
  };

  const handleOpenEditQuotation = (q: SourcingQuotationItem) => {
    setEditingQuotationId(q.id);
    setQuotationForm({
      sourcingSupplierId: q.sourcingSupplierId || "",
      productName: q.productName || detail?.productName || "",
      unitPrice: q.unitPrice || 0,
      currency: q.currency || "INR",
      unit: q.unit || detail?.unit || "KG",
      minimumOrderQuantity: q.minimumOrderQuantity || 0,
      availableQuantity: q.availableQuantity || 0,
      productGrade: q.productGrade || "",
      puritySpecifications: q.puritySpecifications || "",
      packaging: q.packaging || "",
      leadTimeDays: q.leadTimeDays || 7,
      deliveryCharges: q.deliveryCharges || 0,
      paymentTerms: q.paymentTerms || "100% Against PI / Advance",
      incoterms: q.incoterms || "EXW",
      validUntil: q.validUntil ? q.validUntil.split("T")[0] : "",
      notes: q.notes || "",
      attachmentUrl: q.attachmentUrl || "",
      supportingDocuments: q.supportingDocuments || "",
      status: q.status || "RECEIVED",
      shareWithBuyer: Boolean(q.shareWithBuyer),
    });
    setQuotationActionError(null);
    setIsAddQuotationOpen(true);
  };

  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId) return;
    if (!quotationForm.productName.trim() || Number(quotationForm.unitPrice) <= 0) {
      setQuotationActionError("Valid product name and positive unit price are required");
      return;
    }

    setQuotationSubmitting(true);
    setQuotationActionError(null);

    try {
      const payload: AddQuotationPayload = {
        ...quotationForm,
        unitPrice: Number(quotationForm.unitPrice),
        minimumOrderQuantity: quotationForm.minimumOrderQuantity ? Number(quotationForm.minimumOrderQuantity) : undefined,
        availableQuantity: quotationForm.availableQuantity ? Number(quotationForm.availableQuantity) : undefined,
        deliveryCharges: quotationForm.deliveryCharges ? Number(quotationForm.deliveryCharges) : 0,
        leadTimeDays: quotationForm.leadTimeDays ? Number(quotationForm.leadTimeDays) : undefined,
        sourcingSupplierId: quotationForm.sourcingSupplierId || undefined,
        validUntil: quotationForm.validUntil ? new Date(quotationForm.validUntil).toISOString() : undefined,
      };

      if (editingQuotationId) {
        await updateQuotationInRequest(selectedRequestId, editingQuotationId, payload);
      } else {
        await addQuotationToRequest(selectedRequestId, payload);
      }

      await handleRefreshDetail();
      await loadStats();
      setIsAddQuotationOpen(false);
      setEditingQuotationId(null);
    } catch (err: any) {
      setQuotationActionError(err.message || "Failed to save quotation");
    } finally {
      setQuotationSubmitting(false);
    }
  };

  const handleDeleteQuotation = async (quotationId: string) => {
    if (!selectedRequestId) return;
    if (!confirm("Are you sure you want to remove this supplier quotation?")) return;

    try {
      await deleteQuotationFromRequest(selectedRequestId, quotationId);
      await handleRefreshDetail();
    } catch (err: any) {
      alert(err.message || "Failed to delete quotation");
    }
  };

  const toggleSelectQuotationForProposal = (quotationId: string) => {
    setSelectedQuotationIdsForProposal((prev) =>
      prev.includes(quotationId) ? prev.filter((id) => id !== quotationId) : [...prev, quotationId]
    );
  };

  // =========================================================================
  // PROPOSAL MANAGEMENT HANDLERS
  // =========================================================================
  const handleOpenCreateProposal = (quotationIdsToUse?: string[]) => {
    if (!detail) return;
    const targetQuoteIds = quotationIdsToUse || selectedQuotationIdsForProposal;
    const matchingQuotes = (detail.quotations || []).filter((q) => targetQuoteIds.includes(q.id));

    const options: CreateProposalOptionPayload[] = matchingQuotes.length > 0
      ? matchingQuotes.map((q, idx) => {
          const labelLetter = String.fromCharCode(65 + idx);
          return {
            sourcingQuotationId: q.id,
            optionLabel: `Option ${labelLetter}${idx === 0 ? " (Recommended)" : ""}`,
            supplierDisplayName: q.supplierName ? `${q.supplierName} (Verified Partner)` : `Option ${labelLetter} Manufacturer`,
            productName: q.productName || detail.productName,
            grade: q.productGrade || detail.grade || "Commercial Standard",
            puritySpecifications: q.puritySpecifications || detail.specifications || "Standard Specifications",
            offeredPricePerUnit: q.totalLandedCostPerUnit || q.unitPrice,
            currency: q.currency || detail.currency || "INR",
            quantity: detail.quantity,
            unit: detail.unit,
            moq: q.minimumOrderQuantity || detail.quantity,
            leadTimeDays: q.leadTimeDays || 7,
            packaging: q.packaging || detail.packaging || "Export Standard Drums",
            deliveryTerms: q.incoterms ? `${q.incoterms} - Delivered to ${detail.deliveryLocation}` : `Door Delivery to ${detail.deliveryLocation}`,
            paymentTerms: q.paymentTerms || "Escrow / Commercial Terms",
            validUntil: q.validUntil,
            documentUrl: q.attachmentUrl,
            recommendationNotes: `Verified batch quality. Delivery within ${q.leadTimeDays || 7} days.`,
          };
        })
      : [
          {
            optionLabel: "Option A (Primary Recommendation)",
            supplierDisplayName: "WHO-GMP Certified Domestic Manufacturer",
            productName: detail.productName,
            grade: detail.grade || "Standard Grade",
            puritySpecifications: detail.specifications || "Meets commercial specifications",
            offeredPricePerUnit: detail.targetPrice || 100,
            currency: detail.currency || "INR",
            quantity: detail.quantity,
            unit: detail.unit,
            moq: detail.quantity,
            leadTimeDays: 7,
            packaging: detail.packaging || "Standard Drum Packaging",
            deliveryTerms: `Door Delivery to ${detail.deliveryLocation}`,
            paymentTerms: "100% Escrow / Against Delivery",
            recommendationNotes: "Best commercial pricing with immediate batch availability.",
          },
        ];

    setProposalForm({
      title: `Curated Sourcing Options for ${detail.productName} (${detail.quantity} ${detail.unit})`,
      summaryNotes: `Our sourcing team has contacted verified manufacturers for ${detail.productName}. Below are curated supplier options matching your technical purity, regulatory, and delivery requirements.`,
      recommendationNotes: `Option A is recommended for fastest dispatch and quality consistency. All batches undergo pre-shipment COA verification.`,
      termsAndConditions: "All transactions are executed through KemKendra platform escrow. COA and sample verification are guaranteed prior to dispatch.",
      proposalDocumentUrl: "",
      publishImmediately: false,
      options,
    });
    setProposalActionError(null);
    setIsCreateProposalOpen(true);
  };

  const handleAddProposalOption = () => {
    if (!detail) return;
    const nextIdx = proposalForm.options.length;
    const labelLetter = String.fromCharCode(65 + nextIdx);
    const newOption: CreateProposalOptionPayload = {
      optionLabel: `Option ${labelLetter}`,
      supplierDisplayName: `Option ${labelLetter} Manufacturer`,
      productName: detail.productName,
      grade: detail.grade || "Standard Grade",
      puritySpecifications: detail.specifications || "",
      offeredPricePerUnit: detail.targetPrice || 100,
      currency: detail.currency || "INR",
      quantity: detail.quantity,
      unit: detail.unit,
      moq: detail.quantity,
      leadTimeDays: 10,
      packaging: detail.packaging || "Standard Packaging",
      deliveryTerms: `Door Delivery to ${detail.deliveryLocation}`,
      paymentTerms: "Standard Terms",
      recommendationNotes: "",
    };
    setProposalForm({
      ...proposalForm,
      options: [...proposalForm.options, newOption],
    });
  };

  const handleRemoveProposalOption = (index: number) => {
    if (proposalForm.options.length <= 1) return;
    setProposalForm({
      ...proposalForm,
      options: proposalForm.options.filter((_, i) => i !== index),
    });
  };

  const handleUpdateProposalOption = (index: number, updates: Partial<CreateProposalOptionPayload>) => {
    setProposalForm({
      ...proposalForm,
      options: proposalForm.options.map((opt, i) => (i === index ? { ...opt, ...updates } : opt)),
    });
  };

  const handleSaveProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId) return;
    if (!proposalForm.title.trim() || proposalForm.options.length === 0) {
      setProposalActionError("Proposal title and at least one option are required");
      return;
    }

    setProposalSubmitting(true);
    setProposalActionError(null);

    try {
      const sanitizedPayload: CreateProposalPayload = {
        ...proposalForm,
        options: proposalForm.options.map((opt) => ({
          ...opt,
          offeredPricePerUnit: Number(opt.offeredPricePerUnit),
          quantity: Number(opt.quantity),
          moq: opt.moq ? Number(opt.moq) : undefined,
          leadTimeDays: opt.leadTimeDays ? Number(opt.leadTimeDays) : undefined,
        })),
      };

      await createProposalForRequest(selectedRequestId, sanitizedPayload);
      await handleRefreshDetail();
      await loadStats();
      setIsCreateProposalOpen(false);
      setSelectedQuotationIdsForProposal([]);
    } catch (err: any) {
      setProposalActionError(err.message || "Failed to create sourcing proposal");
    } finally {
      setProposalSubmitting(false);
    }
  };

  const handlePublishProposal = async (proposalId: string) => {
    if (!selectedRequestId) return;
    if (!confirm("Are you sure you want to publish this proposal to the buyer? It will become visible on their dashboard.")) return;

    try {
      await publishProposalForRequest(selectedRequestId, proposalId);
      await handleRefreshDetail();
      await loadStats();
    } catch (err: any) {
      alert(err.message || "Failed to publish proposal");
    }
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (!selectedRequestId) return;
    if (!confirm("Are you sure you want to delete this sourcing proposal?")) return;

    try {
      await deleteProposalFromRequest(selectedRequestId, proposalId);
      await handleRefreshDetail();
      await loadStats();
    } catch (err: any) {
      alert(err.message || "Failed to delete proposal");
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: SourcingStatus | string) => {
    switch (status) {
      case "SUBMITTED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">SUBMITTED</span>;
      case "UNDER_REVIEW":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">UNDER_REVIEW</span>;
      case "MORE_INFORMATION_REQUIRED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FCD34D]">MORE_INFO_REQ</span>;
      case "ACCEPTED":
      case "SOURCING":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">SOURCING</span>;
      case "SUPPLIER_CONTACTED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]">SUPPLIER_CONTACTED</span>;
      case "QUOTATIONS_RECEIVED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">QUOTES_RECEIVED</span>;
      case "PROPOSAL_READY":
      case "PROPOSAL_SENT":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]">PROPOSAL_SENT</span>;
      case "NEGOTIATION":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF]">NEGOTIATION</span>;
      case "FULFILLED":
      case "CLOSED":
      case "COMPLETED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0]">COMPLETED</span>;
      case "REJECTED":
      case "CANCELLED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">REJECTED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F1F5F9] text-[#475569]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#64748B] mb-1">
            <span>OPERATIONS</span>
            <span>/</span>
            <span className="text-[#0052CC] font-semibold">SOURCING DESK</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[#0052CC]" />
            Managed Chemical Sourcing Management
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manual procurement desk to discover chemical suppliers, collect quotations, schedule outreach, and prepare client proposals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              loadStats();
              loadRequests();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] rounded-[6px] hover:bg-[#F8FAFC] transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Overview KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Total Inquiries */}
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-3 shadow-xs">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#64748B] block">
            Total Inquiries
          </span>
          <div className="text-2xl font-bold font-mono text-[#0F172A] mt-1">
            {statsLoading ? "—" : stats?.totalRequests.toLocaleString() || "0"}
          </div>
          <span className="text-[10px] text-[#64748B] mt-1 block">All registered inquiries</span>
        </div>

        {/* New / Submitted */}
        <div className="bg-white border border-[#BFDBFE] rounded-[8px] p-3 shadow-xs bg-gradient-to-br from-white to-[#EFF6FF]">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#1D4ED8] block">
            New Requests
          </span>
          <div className="text-2xl font-bold font-mono text-[#1D4ED8] mt-1">
            {statsLoading ? "—" : stats?.newRequests.toLocaleString() || "0"}
          </div>
          <span className="text-[10px] text-[#1E40AF] mt-1 block">Pending initial review</span>
        </div>

        {/* Sourcing in Progress */}
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-3 shadow-xs">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#D97706] block">
            In Progress
          </span>
          <div className="text-2xl font-bold font-mono text-[#0F172A] mt-1">
            {statsLoading ? "—" : stats?.inProgressRequests.toLocaleString() || "0"}
          </div>
          <span className="text-[10px] text-[#64748B] mt-1 block">Under review & outreach</span>
        </div>

        {/* Proposals Sent */}
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-3 shadow-xs">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#4338CA] block">
            Proposals Sent
          </span>
          <div className="text-2xl font-bold font-mono text-[#0F172A] mt-1">
            {statsLoading ? "—" : stats?.proposalsSent.toLocaleString() || "0"}
          </div>
          <span className="text-[10px] text-[#64748B] mt-1 block">Awaiting buyer decision</span>
        </div>

        {/* Completed Requests */}
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-3 shadow-xs">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#16A34A] block">
            Completed
          </span>
          <div className="text-2xl font-bold font-mono text-[#0F172A] mt-1">
            {statsLoading ? "—" : stats?.completedRequests.toLocaleString() || "0"}
          </div>
          <span className="text-[10px] text-[#64748B] mt-1 block">Fulfilled & closed</span>
        </div>
      </div>

      {/* 3. Search and Status Filters */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ref, chemical name, CAS, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 pl-8 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#0052CC] text-[#0F172A]"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="h-8.5 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#0052CC] text-[#0F172A] font-medium"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-[#64748B] self-end md:self-center font-mono">
          Showing {requests.length} of {totalElements} requests
        </div>
      </div>

      {/* 4. Requests Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-6 h-6 border-2 border-[#0052CC] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-[#64748B]">Loading sourcing inquiries...</span>
          </div>
        ) : error ? (
          <div className="py-12 px-4 text-center">
            <AlertCircle className="w-6 h-6 text-[#DC2626] mx-auto mb-2" />
            <div className="text-xs font-semibold text-[#DC2626]">{error}</div>
            <button
              onClick={loadRequests}
              className="mt-3 text-xs text-[#0052CC] hover:underline font-medium"
            >
              Retry
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#64748B]">
            <FlaskConical className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
            <p className="font-semibold text-[#0F172A]">No sourcing inquiries found</p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              {statusFilter || searchQuery ? "Try adjusting your search criteria" : "New requests submitted by buyers will appear here"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-mono uppercase tracking-wider text-[#64748B]">
                <tr>
                  <th className="py-2.5 px-4">Request Ref</th>
                  <th className="py-2.5 px-4">Buyer</th>
                  <th className="py-2.5 px-4">Chemical Product</th>
                  <th className="py-2.5 px-4">Quantity</th>
                  <th className="py-2.5 px-4">Submitted Date</th>
                  <th className="py-2.5 px-4">Assigned Executive</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-[#0052CC]">
                      {r.sourcingRequestReference}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#0F172A]">{r.buyerName}</div>
                      <div className="text-[11px] text-[#64748B]">{r.buyerEmail || "—"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#0F172A]">{r.productName}</div>
                      <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mt-0.5">
                        <span className="bg-[#F1F5F9] px-1.5 py-0.2 rounded text-[10px]">{r.category}</span>
                        {r.casNumber && <span className="font-mono text-[10px]">CAS: {r.casNumber}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-[#0F172A]">
                      {r.quantity} {r.unit}
                    </td>
                    <td className="py-3 px-4 text-[#64748B] font-mono text-[11px]">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {r.assignedExecutiveName ? (
                        <div className="inline-flex items-center gap-1 text-xs text-[#0F172A] font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span>{r.assignedExecutiveName}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(r.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(r.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0052CC] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs text-[#64748B]">
            <div>
              Page <span className="font-semibold text-[#0F172A]">{currentPage + 1}</span> of {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="p-1.5 rounded hover:bg-[#E2E8F0] disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                className="p-1.5 rounded hover:bg-[#E2E8F0] disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. SLIDE-OUT MANAGEMENT DRAWER */}
      {selectedRequestId && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#0052CC]">
                  {detail?.sourcingRequestReference || "Loading..."}
                </span>
                {detail && (
                  <button
                    onClick={() => handleCopyRef(detail.sourcingRequestReference)}
                    className="p-1 text-[#64748B] hover:text-[#0F172A] rounded hover:bg-[#E2E8F0]"
                    title="Copy reference"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
                {detail && getStatusBadge(detail.status)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseDetail}
                  className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-[6px] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-[#E2E8F0] px-4 bg-white shrink-0 text-xs font-medium overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("requirements")}
                className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "requirements"
                    ? "border-[#0052CC] text-[#0052CC]"
                    : "border-transparent text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Buyer Requirements
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("suppliers")}
                className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "suppliers"
                    ? "border-[#0052CC] text-[#0052CC]"
                    : "border-transparent text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <span>Suppliers & Outreach</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#F1F5F9] rounded-full text-[#475569]">
                  {detail?.suppliers?.length || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("quotations")}
                className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "quotations"
                    ? "border-[#0052CC] text-[#0052CC]"
                    : "border-transparent text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Quotations & Pricing</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#F1F5F9] rounded-full text-[#475569]">
                  {detail?.quotations?.length || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("proposals")}
                className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "proposals"
                    ? "border-[#0052CC] text-[#0052CC]"
                    : "border-transparent text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buyer Proposals</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#F1F5F9] rounded-full text-[#475569]">
                  {detail?.proposals?.length || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("management")}
                className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "management"
                    ? "border-[#0052CC] text-[#0052CC]"
                    : "border-transparent text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Request Management
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`py-3 px-3 border-b-2 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "history"
                    ? "border-[#0052CC] text-[#0052CC]"
                    : "border-transparent text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Audit History
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="py-20 text-center">
                  <div className="w-6 h-6 border-2 border-[#0052CC] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs text-[#64748B]">Loading detailed requirement profile...</span>
                </div>
              ) : detailError ? (
                <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-[6px] text-xs text-[#DC2626]">
                  {detailError}
                </div>
              ) : !detail ? null : (
                <>
                  {/* TAB 1: BUYER REQUIREMENTS */}
                  {activeTab === "requirements" && (
                    <div className="space-y-6">
                      {/* Buyer Identity */}
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] p-4 space-y-2">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
                          Buyer Account Details
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[#64748B] block text-[11px]">Contact Name</span>
                            <span className="font-semibold text-[#0F172A]">{detail.buyerName}</span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[11px]">Email Address</span>
                            <span className="font-mono text-[#0F172A]">{detail.buyerEmail || "—"}</span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[11px]">Phone / Mobile</span>
                            <span className="font-mono text-[#0F172A]">{detail.buyerPhone || "—"}</span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[11px]">Delivery Location</span>
                            <span className="text-[#0F172A] font-medium">{detail.deliveryLocation}</span>
                          </div>
                        </div>
                      </div>

                      {/* Chemical Product Specifications */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#E2E8F0] pb-2">
                          Chemical & Technical Specifications
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-[#64748B] block text-[11px]">Chemical / Product Name</span>
                            <span className="font-bold text-[#0F172A] text-sm">{detail.productName}</span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[11px]">CAS Number</span>
                            <span className="font-mono text-[#0F172A] font-medium">{detail.casNumber || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[11px]">Category</span>
                            <span className="font-medium text-[#0F172A]">{detail.category}</span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[11px]">Required Quantity</span>
                            <span className="font-mono font-bold text-[#0F172A]">
                              {detail.quantity} {detail.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[11px]">Required Grade</span>
                            <span className="text-[#0F172A] font-medium">{detail.grade || "Standard Industrial"}</span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[11px]">Pharmacopeial Standard</span>
                            <span className="text-[#0F172A] font-mono">{detail.pharmacopeialStandard || "None / Industrial"}</span>
                          </div>
                        </div>

                        {detail.specifications && (
                          <div className="pt-2">
                            <span className="text-[#64748B] block text-[11px] mb-1">Purity & Technical Notes</span>
                            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs text-[#334155] whitespace-pre-wrap">
                              {detail.specifications}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Commercial & Packaging */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#E2E8F0] pb-2">
                          Commercial & Delivery Terms
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-[#64748B] block text-[11px]">Target Price</span>
                            <span className="font-mono font-bold text-[#0F172A]">
                              {detail.targetPrice ? `${detail.currency} ${detail.targetPrice.toLocaleString()}` : "Not specified"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[11px]">Expected Delivery Date</span>
                            <span className="font-mono text-[#0F172A]">
                              {detail.expectedDeliveryDate || "Flexible"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block text-[11px]">Packaging Type</span>
                            <span className="text-[#0F172A]">{detail.packaging || "Standard Export / Drums"}</span>
                          </div>
                        </div>

                        {detail.additionalRequirements && (
                          <div className="pt-2">
                            <span className="text-[#64748B] block text-[11px] mb-1">Additional Requirements</span>
                            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs text-[#334155] whitespace-pre-wrap">
                              {detail.additionalRequirements}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Uploaded Documents */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#E2E8F0] pb-2">
                          Attached Specifications & Documents
                        </h4>
                        {detail.attachmentReferences ? (
                          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#0052CC]" />
                              <span className="font-mono text-[#0F172A]">{detail.attachmentReferences}</span>
                            </div>
                            <a
                              href={detail.attachmentReferences}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-[#0052CC] hover:underline font-semibold"
                            >
                              Download File
                            </a>
                          </div>
                        ) : (
                          <p className="text-xs text-[#94A3B8] italic">No technical documents attached with this request.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: SUPPLIERS & OUTREACH MANAGEMENT */}
                  {activeTab === "suppliers" && (
                    <div className="space-y-6">
                      {/* Section Header with Add Supplier Button */}
                      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                            Potential Manufacturers & Suppliers ({detail.suppliers?.length || 0})
                          </h4>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            Manage candidate suppliers, record outreach calls and emails, schedule follow-ups, and track responses.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setIsAddSupplierOpen(!isAddSupplierOpen);
                            setAddSupplierError(null);
                          }}
                          className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded-[6px] transition-colors cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isAddSupplierOpen ? "Close Form" : "Add Potential Supplier"}</span>
                        </button>
                      </div>

                      {/* ADD SUPPLIER FORM PANEL */}
                      {isAddSupplierOpen && (
                        <div className="bg-[#F8FAFC] border-2 border-[#BFDBFE] rounded-[8px] p-4 space-y-4 shadow-sm animate-in fade-in duration-150">
                          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-[#0052CC]" />
                              Add Supplier to Sourcing Desk
                            </h5>
                            <button
                              type="button"
                              onClick={() => setIsAddSupplierOpen(false)}
                              className="text-[#64748B] hover:text-[#0F172A]"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Autocomplete Search in Platform Directory (Reuse Profiles & Avoid Duplicates) */}
                          <div className="bg-white border border-[#CBD5E1] rounded-[6px] p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-semibold text-[#0F172A] flex items-center gap-1">
                                <Search className="w-3.5 h-3.5 text-[#0052CC]" />
                                Search KemKendra Registered Directory (Reuse Profile & Avoid Duplicates)
                              </label>
                              <span className="text-[10px] text-[#64748B]">Optional Auto-link</span>
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Type supplier trade name, legal name, or email..."
                                value={directoryQuery}
                                onChange={(e) => setDirectoryQuery(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSearchDirectory();
                                  }
                                }}
                                className="flex-1 h-8 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#0052CC]"
                              />
                              <button
                                type="button"
                                onClick={handleSearchDirectory}
                                disabled={directorySearching}
                                className="h-8 px-3 text-xs font-semibold text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded-[6px] transition-colors cursor-pointer"
                              >
                                {directorySearching ? "Searching..." : "Look up"}
                              </button>
                            </div>

                            {/* Autocomplete Results Dropdown */}
                            {directoryResults.length > 0 && (
                              <div className="border border-[#BFDBFE] rounded-[6px] bg-[#EFF6FF] divide-y divide-[#DBEAFE] max-h-48 overflow-y-auto mt-2">
                                {directoryResults.map((cand) => (
                                  <div
                                    key={cand.id}
                                    className="p-2 text-xs flex items-center justify-between hover:bg-[#DBEAFE] transition-colors"
                                  >
                                    <div>
                                      <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                                        <span>{cand.name}</span>
                                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white text-[#1D4ED8] rounded border border-[#BFDBFE]">
                                          {cand.businessType || "SUPPLIER"}
                                        </span>
                                        {cand.verified && (
                                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#DCFCE7] text-[#15803D] rounded border border-[#BBF7D0]">
                                            VERIFIED
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-[#475569] mt-0.5">
                                        {cand.location || "Location not specified"} • {cand.businessEmail || "No email"}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleSelectRegisteredSupplier(cand)}
                                      className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded cursor-pointer"
                                    >
                                      Use Profile
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {addSupplierForm.supplierId && (
                              <div className="text-[11px] font-medium text-[#15803D] bg-[#DCFCE7] border border-[#BBF7D0] px-2.5 py-1 rounded flex items-center justify-between">
                                <span>✓ Linked to KemKendra Platform Partner #{addSupplierForm.supplierId}</span>
                                <button
                                  type="button"
                                  onClick={() => setAddSupplierForm((prev) => ({ ...prev, supplierId: undefined }))}
                                  className="text-[10px] text-[#B91C1C] hover:underline"
                                >
                                  Unlink
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Supplier Detail Inputs */}
                          <form onSubmit={handleAddSupplierSubmit} className="space-y-3">
                            {addSupplierError && (
                              <div className="p-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded text-xs text-[#DC2626]">
                                {addSupplierError}
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <label className="text-[11px] text-[#475569] block mb-1 font-medium">Company Name *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Gujarat Organics Pvt Ltd"
                                  value={addSupplierForm.supplierName}
                                  onChange={(e) => setAddSupplierForm({ ...addSupplierForm, supplierName: e.target.value })}
                                  className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] text-[#475569] block mb-1 font-medium">Contact Person</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Dr. Ramesh Patel (Sales Head)"
                                  value={addSupplierForm.contactPerson || ""}
                                  onChange={(e) => setAddSupplierForm({ ...addSupplierForm, contactPerson: e.target.value })}
                                  className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] text-[#475569] block mb-1 font-medium">Contact Email</label>
                                <input
                                  type="email"
                                  placeholder="e.g. sales@gujaratorganics.com"
                                  value={addSupplierForm.contactEmail || ""}
                                  onChange={(e) => setAddSupplierForm({ ...addSupplierForm, contactEmail: e.target.value })}
                                  className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] text-[#475569] block mb-1 font-medium">Contact Phone</label>
                                <input
                                  type="text"
                                  placeholder="e.g. +91 98765 43210"
                                  value={addSupplierForm.contactPhone || ""}
                                  onChange={(e) => setAddSupplierForm({ ...addSupplierForm, contactPhone: e.target.value })}
                                  className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] text-[#475569] block mb-1 font-medium">Website</label>
                                <input
                                  type="text"
                                  placeholder="e.g. https://gujaratorganics.com"
                                  value={addSupplierForm.website || ""}
                                  onChange={(e) => setAddSupplierForm({ ...addSupplierForm, website: e.target.value })}
                                  className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] text-[#475569] block mb-1 font-medium">Plant / Office Location</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Ankleshwar GIDC, Gujarat"
                                  value={addSupplierForm.location || ""}
                                  onChange={(e) => setAddSupplierForm({ ...addSupplierForm, location: e.target.value })}
                                  className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] text-[#475569] block mb-1 font-medium">Supplier Type</label>
                                <select
                                  value={addSupplierForm.supplierType || "MANUFACTURER"}
                                  onChange={(e) => setAddSupplierForm({ ...addSupplierForm, supplierType: e.target.value })}
                                  className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                                >
                                  <option value="MANUFACTURER">Manufacturer (Direct Producer)</option>
                                  <option value="DISTRIBUTOR">Distributor (Authorized Stockist)</option>
                                  <option value="TRADER">Trader / Importer</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[11px] text-[#475569] block mb-1 font-medium">Verification Status</label>
                                <select
                                  value={addSupplierForm.verificationStatus || "UNVERIFIED"}
                                  onChange={(e) => setAddSupplierForm({ ...addSupplierForm, verificationStatus: e.target.value })}
                                  className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                                >
                                  <option value="UNVERIFIED">Unverified / External</option>
                                  <option value="PENDING">Verification Pending</option>
                                  <option value="VERIFIED">Verified / Audited</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] text-[#475569] block mb-1 font-medium">Products Supplied / Portfolio</label>
                              <input
                                type="text"
                                placeholder="e.g. Ketoconazole USP, Clotrimazole, Azole intermediates"
                                value={addSupplierForm.productsSupplied || ""}
                                onChange={(e) => setAddSupplierForm({ ...addSupplierForm, productsSupplied: e.target.value })}
                                className="w-full h-8 px-3 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-[#475569] block mb-1 font-medium">Internal Sourcing Notes</label>
                              <textarea
                                rows={2}
                                placeholder="Reason for shortlisting, lead source, estimated capacity, or pricing insights..."
                                value={addSupplierForm.notes || ""}
                                onChange={(e) => setAddSupplierForm({ ...addSupplierForm, notes: e.target.value })}
                                className="w-full p-2.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                              />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                              <button
                                type="button"
                                onClick={() => setIsAddSupplierOpen(false)}
                                className="h-8 px-3 text-xs font-semibold text-[#475569] bg-white border border-[#CBD5E1] rounded hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={addSupplierLoading || !addSupplierForm.supplierName.trim()}
                                className="h-8 px-4 text-xs font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                              >
                                {addSupplierLoading ? "Saving..." : "Add Supplier to Sourcing"}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* LIST OF IDENTIFIED SUPPLIERS */}
                      {detail.suppliers && detail.suppliers.length > 0 ? (
                        <div className="space-y-3">
                          {detail.suppliers.map((s) => (
                            <div
                              key={s.id}
                              className="p-4 bg-white border border-[#E2E8F0] rounded-[8px] text-xs shadow-xs space-y-3 hover:border-[#CBD5E1] transition-colors"
                            >
                              {/* Supplier Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                                <div className="flex items-center flex-wrap gap-2">
                                  <span className="font-bold text-sm text-[#0F172A]">{s.supplierName}</span>

                                  {/* Business Type Badge */}
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]">
                                    {s.supplierType || "MANUFACTURER"}
                                  </span>

                                  {/* Verification Badge */}
                                  {s.verificationStatus === "VERIFIED" ? (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] inline-flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3" />
                                      VERIFIED
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded text-[#64748B] bg-[#F1F5F9]">
                                      {s.verificationStatus || "UNVERIFIED"}
                                    </span>
                                  )}

                                  {/* Registered Platform Profile Tag */}
                                  {s.supplierId && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                                      Platform Partner #{s.supplierId}
                                    </span>
                                  )}
                                </div>

                                {/* Current Status */}
                                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-[#F8FAFC] text-[#334155] border border-[#CBD5E1]">
                                    {s.status}
                                  </span>
                                </div>
                              </div>

                              {/* Supplier Info Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px] text-[#475569]">
                                {s.contactPerson && (
                                  <div>
                                    <span className="text-[#94A3B8] block text-[10px]">Contact Person</span>
                                    <span className="font-medium text-[#0F172A]">{s.contactPerson}</span>
                                  </div>
                                )}
                                {s.contactPhone && (
                                  <div>
                                    <span className="text-[#94A3B8] block text-[10px]">Phone</span>
                                    <span className="font-mono text-[#0F172A]">{s.contactPhone}</span>
                                  </div>
                                )}
                                {s.contactEmail && (
                                  <div>
                                    <span className="text-[#94A3B8] block text-[10px]">Email</span>
                                    <span className="font-mono text-[#0F172A] truncate block">{s.contactEmail}</span>
                                  </div>
                                )}
                                {s.location && (
                                  <div>
                                    <span className="text-[#94A3B8] block text-[10px]">Location</span>
                                    <span className="text-[#0F172A]">{s.location}</span>
                                  </div>
                                )}
                              </div>

                              {/* Portfolio & Website */}
                              {(s.productsSupplied || s.website) && (
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748B] pt-1">
                                  {s.website && (
                                    <a
                                      href={s.website.startsWith("http") ? s.website : `https://${s.website}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-[#0052CC] hover:underline font-mono"
                                    >
                                      <Globe className="w-3.5 h-3.5" />
                                      <span>Website</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                  {s.productsSupplied && (
                                    <div className="flex items-center gap-1">
                                      <Package className="w-3.5 h-3.5 text-[#64748B]" />
                                      <span>Supplies: {s.productsSupplied}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Notes */}
                              {s.notes && (
                                <p className="text-[11px] text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] rounded p-2 italic">
                                  "{s.notes}"
                                </p>
                              )}

                              {/* Actions Bar */}
                              <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenOutreach(s)}
                                    className="inline-flex items-center gap-1.5 h-7 px-3 text-[11px] font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded transition-colors cursor-pointer shadow-xs"
                                  >
                                    <PhoneCall className="w-3 h-3" />
                                    <span>Log Outreach</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenHistory(s)}
                                    className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] font-medium text-[#475569] bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded transition-colors cursor-pointer"
                                  >
                                    <Clock className="w-3 h-3 text-[#64748B]" />
                                    <span>Outreach History</span>
                                  </button>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditSupplier(s)}
                                    className="p-1 text-[#64748B] hover:text-[#0F172A] rounded hover:bg-[#F1F5F9]"
                                    title="Edit supplier details"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSupplier(s.id, s.supplierName)}
                                    className="p-1 text-[#94A3B8] hover:text-[#DC2626] rounded hover:bg-[#FEF2F2]"
                                    title="Remove supplier"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-[8px]">
                          <Building2 className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                          <p className="text-xs font-semibold text-[#0F172A]">No potential suppliers added yet</p>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            Click "+ Add Potential Supplier" above to search the verified platform directory or register new manufacturer contacts.
                          </p>
                        </div>
                      )}

                      {/* Customer Proposals Overview */}
                      <div className="space-y-2 pt-4 border-t border-[#E2E8F0]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                          Customer Sourcing Proposals ({detail.proposals?.length || 0})
                        </h4>
                        {detail.proposals && detail.proposals.length > 0 ? (
                          <div className="space-y-2">
                            {detail.proposals.map((p) => (
                              <div key={p.id} className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-[6px] text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#14532D]">{p.title}</span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 bg-white text-[#15803D] border border-[#BBF7D0] rounded">
                                    {p.status}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#166534]">
                                  Offered Price: {p.currency} {p.offeredPricePerUnit} • Qty: {p.quantity} {p.unit}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[#94A3B8] italic p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
                            No customer proposals prepared yet.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB: QUOTATIONS & COMPARATIVE PRICING */}
                  {activeTab === "quotations" && (
                    <div className="space-y-6">
                      {/* Section Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-[8px]">
                        <div>
                          <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-[#0052CC]" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                              Supplier Quotation Comparison Matrix
                            </h4>
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            Target: <span className="font-semibold text-[#0F172A]">{detail.productName}</span> • Quantity: <span className="font-semibold text-[#0F172A]">{detail.quantity} {detail.unit}</span> • Delivery SEZ: <span className="font-semibold text-[#0F172A]">{detail.deliveryLocation}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleOpenAddQuotation}
                            className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-[6px] transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Supplier Quotation</span>
                          </button>
                          {selectedQuotationIdsForProposal.length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleOpenCreateProposal()}
                              className="px-3 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-[6px] transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Assemble Proposal ({selectedQuotationIdsForProposal.length})</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Quotations Matrix Table */}
                      {detail.quotations && detail.quotations.length > 0 ? (
                        <div className="border border-[#E2E8F0] rounded-[8px] overflow-hidden bg-white shadow-2xs">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-mono uppercase tracking-wider text-[#64748B]">
                                <tr>
                                  <th className="py-2.5 px-3 text-center w-8">
                                    <span className="sr-only">Select</span>
                                  </th>
                                  <th className="py-2.5 px-3">Supplier & Quotation</th>
                                  <th className="py-2.5 px-3">Grade & Specs</th>
                                  <th className="py-2.5 px-3">Base Price</th>
                                  <th className="py-2.5 px-3">Freight / Delivery</th>
                                  <th className="py-2.5 px-3">Effective Landed Cost</th>
                                  <th className="py-2.5 px-3">Total Cost</th>
                                  <th className="py-2.5 px-3">MOQ / Lead Time</th>
                                  <th className="py-2.5 px-3">Share With Buyer</th>
                                  <th className="py-2.5 px-3 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#E2E8F0]">
                                {detail.quotations.map((q) => {
                                  const isSelected = selectedQuotationIdsForProposal.includes(q.id);
                                  const landedCost = q.totalLandedCostPerUnit || q.unitPrice;
                                  const totalEst = q.totalEstimatedCost || (q.unitPrice * detail.quantity);

                                  return (
                                    <tr key={q.id} className={`hover:bg-[#F8FAFC] transition-colors ${isSelected ? "bg-[#F0FDF4]/60" : ""}`}>
                                      <td className="py-3 px-3 text-center">
                                        <button
                                          type="button"
                                          onClick={() => toggleSelectQuotationForProposal(q.id)}
                                          className="text-[#64748B] hover:text-[#0052CC] cursor-pointer"
                                        >
                                          {isSelected ? (
                                            <CheckSquare className="w-4 h-4 text-[#15803D]" />
                                          ) : (
                                            <Square className="w-4 h-4 text-[#CBD5E1]" />
                                          )}
                                        </button>
                                      </td>
                                      <td className="py-3 px-3">
                                        <div className="font-bold text-[#0F172A]">{q.supplierName || "Direct Supplier"}</div>
                                        <div className="text-[10px] font-mono text-[#0052CC] font-semibold">{q.quotationReference}</div>
                                        {q.validUntil && (
                                          <div className="text-[10px] text-[#64748B] mt-0.5">
                                            Valid: {new Date(q.validUntil).toLocaleDateString()}
                                          </div>
                                        )}
                                      </td>
                                      <td className="py-3 px-3">
                                        <div className="font-semibold text-[#334155]">{q.productGrade || "Standard Commercial"}</div>
                                        {q.puritySpecifications && (
                                          <div className="text-[10px] text-[#64748B] truncate max-w-[140px]" title={q.puritySpecifications}>
                                            {q.puritySpecifications}
                                          </div>
                                        )}
                                        {q.packaging && (
                                          <div className="text-[10px] text-[#475569]">{q.packaging}</div>
                                        )}
                                      </td>
                                      <td className="py-3 px-3">
                                        <div className="font-mono font-bold text-[#0F172A]">
                                          {q.currency} {Number(q.unitPrice).toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-[#64748B]">per {q.unit || detail.unit}</div>
                                      </td>
                                      <td className="py-3 px-3">
                                        <div className="font-mono text-[#475569]">
                                          {q.deliveryCharges && Number(q.deliveryCharges) > 0 ? (
                                            `${q.currency} ${Number(q.deliveryCharges).toLocaleString()}`
                                          ) : (
                                            <span className="text-[#15803D] font-medium">Included / EXW</span>
                                          )}
                                        </div>
                                        <div className="text-[10px] text-[#64748B]">{q.incoterms || "EXW"}</div>
                                      </td>
                                      <td className="py-3 px-3">
                                        <div className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
                                          {q.currency} {Number(landedCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-[9px] text-[#64748B] mt-0.5">per {q.unit || detail.unit}</div>
                                      </td>
                                      <td className="py-3 px-3 font-mono font-bold text-[#0F172A]">
                                        {q.currency} {Number(totalEst).toLocaleString()}
                                      </td>
                                      <td className="py-3 px-3">
                                        <div className="text-[#334155] font-medium">MOQ: {q.minimumOrderQuantity || "None"} {q.unit || detail.unit}</div>
                                        <div className="text-[10px] text-[#64748B]">Lead: {q.leadTimeDays ? `${q.leadTimeDays} days` : "Immediate"}</div>
                                      </td>
                                      <td className="py-3 px-3">
                                        {q.shareWithBuyer ? (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#15803D] bg-[#F0FDF4] px-1.5 py-0.5 rounded border border-[#BBF7D0]">
                                            <Check className="w-3 h-3" /> Visible
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-[10px] text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                                            <Lock className="w-3 h-3" /> Internal Only
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-3 px-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => handleOpenEditQuotation(q)}
                                            className="p-1 text-[#64748B] hover:text-[#0052CC] hover:bg-[#F1F5F9] rounded cursor-pointer transition-colors"
                                            title="Edit Quotation"
                                          >
                                            <Edit3 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteQuotation(q.id)}
                                            className="p-1 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded cursor-pointer transition-colors"
                                            title="Delete Quotation"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-[8px]">
                          <Scale className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                          <p className="text-xs font-semibold text-[#0F172A]">No supplier quotations recorded yet</p>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            Record quotations received from manufacturers to compare commercial pricing and calculate landed costs.
                          </p>
                          <button
                            type="button"
                            onClick={handleOpenAddQuotation}
                            className="mt-3 px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-[6px] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add First Supplier Quotation</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: BUYER PROPOSALS */}
                  {activeTab === "proposals" && (
                    <div className="space-y-6">
                      {/* Section Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-[8px]">
                        <div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#0052CC]" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                              Buyer-Facing Sourcing Proposals
                            </h4>
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            Curated commercial options presented to the buyer. Only published proposals are visible on the buyer's procurement portal.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenCreateProposal()}
                          className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-[6px] transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Assemble New Proposal</span>
                        </button>
                      </div>

                      {/* Proposals List */}
                      {detail.proposals && detail.proposals.length > 0 ? (
                        <div className="space-y-6">
                          {detail.proposals.map((p) => {
                            const isDraft = p.status === "DRAFT";
                            const isPublished = p.status === "PUBLISHED";
                            const isAccepted = p.status === "ACCEPTED";

                            return (
                              <div
                                key={p.id}
                                className={`border rounded-[8px] p-5 space-y-4 bg-white shadow-2xs ${
                                  isAccepted
                                    ? "border-[#86EFAC] ring-1 ring-[#86EFAC]/50"
                                    : isPublished
                                    ? "border-[#BFDBFE]"
                                    : "border-[#E2E8F0]"
                                }`}
                              >
                                {/* Proposal Card Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="text-sm font-bold text-[#0F172A]">{p.title}</h5>
                                      <span
                                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                                          isAccepted
                                            ? "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"
                                            : isPublished
                                            ? "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]"
                                            : "bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]"
                                        }`}
                                      >
                                        {p.status}
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-mono text-[#64748B] mt-0.5 flex items-center gap-2">
                                      <span>Ref: {p.proposalReference}</span>
                                      <span>•</span>
                                      <span>Created: {new Date(p.createdAt).toLocaleDateString()}</span>
                                      {p.sentToBuyerAt && (
                                        <>
                                          <span>•</span>
                                          <span className="text-[#1D4ED8] font-medium">Published: {new Date(p.sentToBuyerAt).toLocaleDateString()}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {isDraft && (
                                      <button
                                        type="button"
                                        onClick={() => handlePublishProposal(p.id)}
                                        className="px-3 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-[6px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                      >
                                        <SendHorizonal className="w-3.5 h-3.5" />
                                        <span>Publish to Buyer</span>
                                      </button>
                                    )}
                                    {isDraft && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteProposal(p.id)}
                                        className="p-1.5 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded cursor-pointer transition-colors"
                                        title="Delete Draft Proposal"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Summary & Recommendations */}
                                {(p.summaryNotes || p.recommendationNotes) && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#F8FAFC] p-3.5 rounded-[6px] border border-[#E2E8F0]">
                                    {p.summaryNotes && (
                                      <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                                          Summary for Buyer
                                        </span>
                                        <p className="text-[#334155] leading-relaxed">{p.summaryNotes}</p>
                                      </div>
                                    )}
                                    {p.recommendationNotes && (
                                      <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0052CC] block mb-1">
                                          Sourcing Team Recommendations
                                        </span>
                                        <p className="text-[#1E293B] font-medium leading-relaxed">{p.recommendationNotes}</p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Buyer Feedback / Inquiry Banner */}
                                {p.buyerFeedback && (
                                  <div className="bg-[#FEFCE8] border border-[#FEF08A] rounded-[6px] p-3.5 text-xs space-y-1">
                                    <div className="flex items-center gap-1.5 font-bold text-[#854D0E]">
                                      <MessageSquare className="w-4 h-4" />
                                      <span>Buyer Inquiries & Feedback Thread</span>
                                    </div>
                                    <p className="text-[#713F12] whitespace-pre-line font-mono text-[11px] pl-5">
                                      {p.buyerFeedback}
                                    </p>
                                  </div>
                                )}

                                {/* Curated Options Matrix */}
                                <div className="space-y-2">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569] block">
                                    Curated Supplier Options ({p.options?.length || 0})
                                  </span>

                                  {p.options && p.options.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {p.options.map((opt) => {
                                        const isSelectedOption = p.selectedOptionId === opt.id || opt.status === "ACCEPTED";

                                        return (
                                          <div
                                            key={opt.id}
                                            className={`border rounded-[6px] p-3.5 space-y-2.5 text-xs relative ${
                                              isSelectedOption
                                                ? "bg-[#F0FDF4] border-[#86EFAC] ring-1 ring-[#86EFAC]"
                                                : "bg-[#FAFAFA] border-[#E2E8F0]"
                                            }`}
                                          >
                                            {isSelectedOption && (
                                              <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#15803D] text-white text-[10px] font-bold rounded-full">
                                                Selected by Buyer
                                              </span>
                                            )}

                                            <div>
                                              <div className="font-bold text-[#0F172A]">{opt.optionLabel}</div>
                                              <div className="text-[11px] text-[#0052CC] font-semibold">{opt.supplierDisplayName}</div>
                                            </div>

                                            <div className="p-2 bg-white border border-[#E2E8F0] rounded font-mono">
                                              <div className="text-sm font-bold text-[#0F172A]">
                                                {opt.currency} {Number(opt.offeredPricePerUnit).toLocaleString()} <span className="text-[10px] text-[#64748B] font-normal">/ {opt.unit}</span>
                                              </div>
                                              <div className="text-[10px] text-[#64748B]">
                                                Qty: {opt.quantity} {opt.unit} • MOQ: {opt.moq || opt.quantity} {opt.unit}
                                              </div>
                                            </div>

                                            <div className="space-y-1 text-[11px] text-[#475569]">
                                              <div><span className="font-semibold text-[#334155]">Grade:</span> {opt.grade || "Standard"}</div>
                                              <div><span className="font-semibold text-[#334155]">Lead Time:</span> {opt.leadTimeDays ? `${opt.leadTimeDays} days` : "Standard dispatch"}</div>
                                              <div><span className="font-semibold text-[#334155]">Delivery:</span> {opt.deliveryTerms || "Standard Terms"}</div>
                                              {opt.recommendationNotes && (
                                                <div className="italic text-[#0052CC] text-[10px]">"{opt.recommendationNotes}"</div>
                                              )}
                                            </div>

                                            {opt.documentUrl && (
                                              <a
                                                href={opt.documentUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-[10px] text-[#0052CC] hover:underline font-semibold"
                                              >
                                                <Download className="w-3 h-3" /> View Specs / COA Document
                                              </a>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-[#94A3B8] italic p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
                                      No options configured on this proposal.
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-[8px]">
                          <Sparkles className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                          <p className="text-xs font-semibold text-[#0F172A]">No customer proposals prepared yet</p>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            Assemble a curated proposal with multiple commercial options and recommendations to share with the buyer.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleOpenCreateProposal()}
                            className="mt-3 px-3 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-[6px] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Assemble First Proposal</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: REQUEST MANAGEMENT */}
                  {activeTab === "management" && (
                    <div className="space-y-6">
                      {/* Section A: Change Request Status */}
                      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 space-y-3 shadow-xs">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                          Lifecycle Status Management
                        </h4>

                        <form onSubmit={handleUpdateStatus} className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] text-[#64748B] block mb-1">Target Status</label>
                              <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#0052CC] font-medium text-[#0F172A]"
                              >
                                {ALL_STATUSES.filter((s) => s.value !== "").map((s) => (
                                  <option key={s.value} value={s.value}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] text-[#64748B] block mb-1">Transition Note / Reason</label>
                              <input
                                type="text"
                                placeholder="e.g. Quotations received from 2 Gujarat manufacturers"
                                value={statusReason}
                                onChange={(e) => setStatusReason(e.target.value)}
                                className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#0052CC]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={handleRequestMoreInfo}
                              disabled={statusUpdating}
                              className="text-xs text-[#D97706] hover:text-[#B45309] font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>Request Info from Buyer</span>
                            </button>

                            <button
                              type="submit"
                              disabled={statusUpdating || newStatus === detail.status}
                              className="h-8 px-4 text-xs font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded-[6px] transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {statusUpdating ? "Updating..." : "Update Status"}
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Section B: Assign Sourcing Executive */}
                      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 space-y-3 shadow-xs">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                          Assign Sourcing Executive
                        </h4>

                        <form onSubmit={handleAssignExecutive} className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] text-[#64748B] block mb-1">Select Executive</label>
                              <select
                                value={selectedExecutiveId}
                                onChange={(e) => setSelectedExecutiveId(e.target.value)}
                                className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#0052CC] text-[#0F172A]"
                              >
                                <option value="">-- Choose Administrator / Sourcer --</option>
                                {adminUsers.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.name} ({u.email})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] text-[#64748B] block mb-1">Assignment Note</label>
                              <input
                                type="text"
                                placeholder="e.g. Lead procurement for bulk pharma inquiry"
                                value={assignmentNote}
                                onChange={(e) => setAssignmentNote(e.target.value)}
                                className="w-full h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#0052CC]"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              type="submit"
                              disabled={assignmentUpdating || !selectedExecutiveId}
                              className="h-8 px-4 text-xs font-semibold text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded-[6px] transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {assignmentUpdating ? "Assigning..." : "Assign Executive"}
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Section C: Internal Private Notes */}
                      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-[#64748B]" />
                            Internal Private Notes
                          </h4>
                          <span className="text-[10px] font-mono text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded">
                            PRIVATE TO ADMINS
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B]">
                          Internal observations, price negotiations, supplier margins, and executive records. Strictly invisible to buyers.
                        </p>

                        <textarea
                          rows={4}
                          value={internalNotesText}
                          onChange={(e) => setInternalNotesText(e.target.value)}
                          placeholder="Record supplier leads, quotation discussions, margin estimates, or follow-up tasks here..."
                          className="w-full p-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:border-[#0052CC] focus:bg-white transition-colors"
                        />

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleSaveNotes}
                            disabled={notesUpdating}
                            className="h-8 px-4 text-xs font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded-[6px] transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {notesUpdating ? "Saving..." : "Save Internal Notes"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: STATUS HISTORY */}
                  {activeTab === "history" && (
                    <div className="space-y-4">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold">
                        Lifecycle Audit Trail
                      </div>

                      {detail.statusHistory && detail.statusHistory.length > 0 ? (
                        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0]">
                          {detail.statusHistory.map((h, i) => (
                            <div key={h.id || i} className="relative">
                              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#0052CC] ring-4 ring-white" />
                              <div className="text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold font-mono text-[#0F172A]">{h.newStatus}</span>
                                  {h.previousStatus && (
                                    <span className="text-[11px] text-[#64748B]">
                                      (from <span className="font-mono">{h.previousStatus}</span>)
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                                  {new Date(h.createdAt).toLocaleString("en-IN")} • by{" "}
                                  <span className="text-[#475569]">{h.changedByUserName || "System / User"}</span>
                                </div>
                                {h.reasonOrNotes && (
                                  <p className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded p-2 text-[#334155] mt-1.5 italic">
                                    "{h.reasonOrNotes}"
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#94A3B8] italic">No transition history recorded.</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end shrink-0">
              <button
                type="button"
                onClick={handleCloseDetail}
                className="h-8 px-4 text-xs font-semibold text-[#475569] bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-[6px] transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. LOG OUTREACH MODAL */}
      {isOutreachOpen && outreachSupplier && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] shadow-2xl max-w-lg w-full overflow-hidden border border-[#CBD5E1] animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-[#0052CC]" />
                  Log Outreach Interaction
                </h3>
                <span className="text-[11px] text-[#64748B] block mt-0.5">
                  Supplier: <strong className="text-[#0F172A]">{outreachSupplier.supplierName}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOutreachOpen(false)}
                className="text-[#64748B] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOutreachSubmit} className="p-4 space-y-3 text-xs">
              {outreachError && (
                <div className="p-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded text-xs text-[#DC2626]">
                  {outreachError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#475569] block mb-1 font-medium">Contact Channel *</label>
                  <select
                    value={outreachForm.outreachChannel}
                    onChange={(e) => setOutreachForm({ ...outreachForm, outreachChannel: e.target.value })}
                    className="w-full h-8.5 px-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC] font-medium text-[#0F172A]"
                  >
                    <option value="PHONE">Phone Call</option>
                    <option value="EMAIL">Email Outreach</option>
                    <option value="OTHER">Other (In-Person / WhatsApp / Meeting)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#475569] block mb-1 font-medium">Contact Date & Time</label>
                  <input
                    type="datetime-local"
                    value={outreachForm.contactDate || ""}
                    onChange={(e) => setOutreachForm({ ...outreachForm, contactDate: e.target.value })}
                    className="w-full h-8.5 px-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC] text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#475569] block mb-1 font-medium">Person Contacted</label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. Sharma"
                    value={outreachForm.contactPerson || ""}
                    onChange={(e) => setOutreachForm({ ...outreachForm, contactPerson: e.target.value })}
                    className="w-full h-8.5 px-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC] text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#475569] block mb-1 font-medium">Response Status *</label>
                  <select
                    value={outreachForm.responseStatus || "PENDING"}
                    onChange={(e) => setOutreachForm({ ...outreachForm, responseStatus: e.target.value })}
                    className="w-full h-8.5 px-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC] font-medium text-[#0F172A]"
                  >
                    <option value="PENDING">PENDING (Waiting for response)</option>
                    <option value="INTERESTED">INTERESTED (Can supply, checking specs)</option>
                    <option value="QUOTE_PROVIDED">QUOTE_PROVIDED (Quotation shared)</option>
                    <option value="NOT_INTERESTED">NOT_INTERESTED (Declined / Out of capacity)</option>
                    <option value="NO_RESPONSE">NO_RESPONSE (No answer)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#475569] block mb-1 font-medium">Subject / Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Inquired about batch availability & COA"
                  value={outreachForm.subject || ""}
                  onChange={(e) => setOutreachForm({ ...outreachForm, subject: e.target.value })}
                  className="w-full h-8.5 px-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC] text-[#0F172A]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#475569] block mb-1 font-medium">Conversation Details & Findings *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record summary of call, plant capacity, lead time mentioned, sample availability, or price ballparks..."
                  value={outreachForm.details}
                  onChange={(e) => setOutreachForm({ ...outreachForm, details: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC] text-[#0F172A]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#475569] block mb-1 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#0052CC]" />
                  Schedule Next Follow-Up Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={outreachForm.nextFollowUpDate || ""}
                  onChange={(e) => setOutreachForm({ ...outreachForm, nextFollowUpDate: e.target.value })}
                  className="w-full h-8.5 px-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC] text-[#0F172A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsOutreachOpen(false)}
                  className="h-8 px-3 text-xs font-semibold text-[#475569] bg-white border border-[#CBD5E1] rounded hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={outreachLoading || !outreachForm.details.trim()}
                  className="h-8 px-4 text-xs font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {outreachLoading ? "Saving..." : "Log Outreach"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. EDIT SUPPLIER MODAL */}
      {isEditSupplierOpen && editingSupplier && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] shadow-2xl max-w-lg w-full overflow-hidden border border-[#CBD5E1] animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-[#0052CC]" />
                Edit Supplier Information
              </h3>
              <button
                type="button"
                onClick={() => setIsEditSupplierOpen(false)}
                className="text-[#64748B] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSupplierSubmit} className="p-4 space-y-3 text-xs">
              {editSupplierError && (
                <div className="p-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded text-xs text-[#DC2626]">
                  {editSupplierError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#475569] block mb-1 font-medium">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={editSupplierForm.supplierName}
                    onChange={(e) => setEditSupplierForm({ ...editSupplierForm, supplierName: e.target.value })}
                    className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#475569] block mb-1 font-medium">Contact Person</label>
                  <input
                    type="text"
                    value={editSupplierForm.contactPerson || ""}
                    onChange={(e) => setEditSupplierForm({ ...editSupplierForm, contactPerson: e.target.value })}
                    className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#475569] block mb-1 font-medium">Contact Email</label>
                  <input
                    type="email"
                    value={editSupplierForm.contactEmail || ""}
                    onChange={(e) => setEditSupplierForm({ ...editSupplierForm, contactEmail: e.target.value })}
                    className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#475569] block mb-1 font-medium">Contact Phone</label>
                  <input
                    type="text"
                    value={editSupplierForm.contactPhone || ""}
                    onChange={(e) => setEditSupplierForm({ ...editSupplierForm, contactPhone: e.target.value })}
                    className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#475569] block mb-1 font-medium">Website</label>
                  <input
                    type="text"
                    value={editSupplierForm.website || ""}
                    onChange={(e) => setEditSupplierForm({ ...editSupplierForm, website: e.target.value })}
                    className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#475569] block mb-1 font-medium">Location</label>
                  <input
                    type="text"
                    value={editSupplierForm.location || ""}
                    onChange={(e) => setEditSupplierForm({ ...editSupplierForm, location: e.target.value })}
                    className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#475569] block mb-1 font-medium">Supplier Type</label>
                  <select
                    value={editSupplierForm.supplierType || "MANUFACTURER"}
                    onChange={(e) => setEditSupplierForm({ ...editSupplierForm, supplierType: e.target.value })}
                    className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                  >
                    <option value="MANUFACTURER">Manufacturer</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                    <option value="TRADER">Trader / Importer</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#475569] block mb-1 font-medium">Verification Status</label>
                  <select
                    value={editSupplierForm.verificationStatus || "UNVERIFIED"}
                    onChange={(e) => setEditSupplierForm({ ...editSupplierForm, verificationStatus: e.target.value })}
                    className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                  >
                    <option value="UNVERIFIED">Unverified</option>
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#475569] block mb-1 font-medium">Lifecycle Status</label>
                  <select
                    value={editSupplierForm.status || "IDENTIFIED"}
                    onChange={(e) => setEditSupplierForm({ ...editSupplierForm, status: e.target.value })}
                    className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                  >
                    <option value="IDENTIFIED">IDENTIFIED</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="RESPONDED">RESPONDED</option>
                    <option value="QUOTED">QUOTED</option>
                    <option value="SHORTLISTED">SHORTLISTED</option>
                    <option value="DECLINED">DECLINED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#475569] block mb-1 font-medium">Products Supplied</label>
                <input
                  type="text"
                  value={editSupplierForm.productsSupplied || ""}
                  onChange={(e) => setEditSupplierForm({ ...editSupplierForm, productsSupplied: e.target.value })}
                  className="w-full h-8 px-3 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#475569] block mb-1 font-medium">Notes</label>
                <textarea
                  rows={2}
                  value={editSupplierForm.notes || ""}
                  onChange={(e) => setEditSupplierForm({ ...editSupplierForm, notes: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsEditSupplierOpen(false)}
                  className="h-8 px-3 text-xs font-semibold text-[#475569] bg-white border border-[#CBD5E1] rounded hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSupplierLoading}
                  className="h-8 px-4 text-xs font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {editSupplierLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. OUTREACH HISTORY TIMELINE MODAL */}
      {isHistoryOpen && historySupplier && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] shadow-2xl max-w-lg w-full overflow-hidden border border-[#CBD5E1] animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#0052CC]" />
                  Outreach History & Responses
                </h3>
                <span className="text-[11px] text-[#64748B] block mt-0.5">
                  Supplier: <strong className="text-[#0F172A]">{historySupplier.supplierName}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="text-[#64748B] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-96 overflow-y-auto">
              {historyLoading ? (
                <div className="py-12 text-center text-xs text-[#64748B]">
                  <div className="w-5 h-5 border-2 border-[#0052CC] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading history...
                </div>
              ) : supplierHistoryLogs.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#94A3B8]">
                  <MessageSquare className="w-6 h-6 text-[#CBD5E1] mx-auto mb-2" />
                  No outreach logs recorded for this supplier yet.
                </div>
              ) : (
                <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0]">
                  {supplierHistoryLogs.map((log) => (
                    <div key={log.id} className="relative text-xs">
                      <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#0052CC] ring-4 ring-white" />
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#0F172A] flex items-center gap-1">
                            {log.outreachChannel === "PHONE" && <Phone className="w-3 h-3 text-[#1D4ED8]" />}
                            {log.outreachChannel === "EMAIL" && <Mail className="w-3 h-3 text-[#0D9488]" />}
                            {log.outreachChannel === "OTHER" && <MessageSquare className="w-3 h-3 text-[#7C3AED]" />}
                            {log.outreachChannel} OUTREACH
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-white text-[#1D4ED8] border border-[#BFDBFE]">
                            {log.responseStatus}
                          </span>
                        </div>

                        {log.subject && <div className="font-semibold text-[#1E293B]">{log.subject}</div>}

                        <p className="text-[#334155] whitespace-pre-wrap text-[11px]">{log.details}</p>

                        {log.nextFollowUpDate && (
                          <div className="flex items-center gap-1 text-[10px] font-medium text-[#1E40AF] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded w-fit">
                            <Calendar className="w-3 h-3" />
                            <span>Next Follow-up: {new Date(log.nextFollowUpDate).toLocaleString("en-IN")}</span>
                          </div>
                        )}

                        <div className="text-[10px] text-[#94A3B8] font-mono border-t border-[#E2E8F0] pt-1 mt-1 flex justify-between">
                          <span>By: {log.performedByUserName || "Sourcing Executive"}</span>
                          <span>{new Date(log.contactDate || log.loggedAt).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="h-7 px-3 text-xs font-semibold text-[#475569] bg-white border border-[#CBD5E1] rounded hover:bg-[#F1F5F9] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT SUPPLIER QUOTATION
      ========================================================================= */}
      {isAddQuotationOpen && detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-[10px] border border-[#E2E8F0] shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#0052CC]" />
                  <span>{editingQuotationId ? "Edit Supplier Quotation" : "Record Supplier Quotation"}</span>
                </h3>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Inquiry: <span className="font-semibold text-[#0F172A]">{detail.productName}</span> ({detail.quantity} {detail.unit})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddQuotationOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveQuotation} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {quotationActionError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[6px] text-[#991B1B] text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{quotationActionError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Supplier selection */}
                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">
                    Quoting Supplier <span className="text-[#DC2626]">*</span>
                  </label>
                  <select
                    value={quotationForm.sourcingSupplierId || ""}
                    onChange={(e) => setQuotationForm({ ...quotationForm, sourcingSupplierId: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                  >
                    <option value="">-- Direct External Manufacturer / Unassigned --</option>
                    {(detail.suppliers || []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.supplierName} ({s.supplierType || "Supplier"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Name */}
                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">
                    Quoted Product Name <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={quotationForm.productName}
                    onChange={(e) => setQuotationForm({ ...quotationForm, productName: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                    placeholder="e.g. Ketoconazole USP"
                  />
                </div>

                {/* Base Unit Price */}
                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">
                    Base Unit Price <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={quotationForm.currency || "INR"}
                      onChange={(e) => setQuotationForm({ ...quotationForm, currency: e.target.value })}
                      className="w-20 h-8 px-2 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC] font-mono font-medium"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      value={quotationForm.unitPrice || ""}
                      onChange={(e) => setQuotationForm({ ...quotationForm, unitPrice: parseFloat(e.target.value) || 0 })}
                      className="flex-1 h-8 px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC] font-mono font-bold"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Unit of Measurement */}
                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">Unit of Measurement</label>
                  <input
                    type="text"
                    value={quotationForm.unit || ""}
                    onChange={(e) => setQuotationForm({ ...quotationForm, unit: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                    placeholder="e.g. KG, MT, L"
                  />
                </div>

                {/* Freight / Delivery Charges */}
                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">
                    Delivery / Freight Charges ({quotationForm.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={quotationForm.deliveryCharges ?? 0}
                    onChange={(e) => setQuotationForm({ ...quotationForm, deliveryCharges: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC] font-mono"
                    placeholder="0.00 (Enter 0 if EXW / included)"
                  />
                </div>

                {/* Incoterms */}
                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">Commercial Delivery Terms (Incoterms)</label>
                  <select
                    value={quotationForm.incoterms || "EXW"}
                    onChange={(e) => setQuotationForm({ ...quotationForm, incoterms: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                  >
                    <option value="EXW">EXW - Ex Works (Factory / Warehouse)</option>
                    <option value="FOB">FOB - Free on Board (Port)</option>
                    <option value="CIF">CIF - Cost, Insurance & Freight</option>
                    <option value="DAP">DAP - Delivered at Place</option>
                    <option value="DDP">DDP - Delivered Duty Paid (Door Delivery)</option>
                  </select>
                </div>

                {/* MOQ & Available Quantity */}
                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">Minimum Order Qty (MOQ)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={quotationForm.minimumOrderQuantity || ""}
                    onChange={(e) => setQuotationForm({ ...quotationForm, minimumOrderQuantity: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                    placeholder="e.g. 25"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">Available Ready Stock</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={quotationForm.availableQuantity || ""}
                    onChange={(e) => setQuotationForm({ ...quotationForm, availableQuantity: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                    placeholder="e.g. 500"
                  />
                </div>

                {/* Grade & Lead Time */}
                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">Product Grade</label>
                  <input
                    type="text"
                    value={quotationForm.productGrade || ""}
                    onChange={(e) => setQuotationForm({ ...quotationForm, productGrade: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                    placeholder="e.g. USP / IP / Pharma Grade"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">Lead Time (Dispatch Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={quotationForm.leadTimeDays || ""}
                    onChange={(e) => setQuotationForm({ ...quotationForm, leadTimeDays: parseInt(e.target.value) || 7 })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                    placeholder="7"
                  />
                </div>

                {/* Packaging & Payment Terms */}
                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">Packaging Description</label>
                  <input
                    type="text"
                    value={quotationForm.packaging || ""}
                    onChange={(e) => setQuotationForm({ ...quotationForm, packaging: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                    placeholder="e.g. 25kg HDPE drum with double liner"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={quotationForm.paymentTerms || ""}
                    onChange={(e) => setQuotationForm({ ...quotationForm, paymentTerms: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                    placeholder="e.g. 100% Against PI / Advance"
                  />
                </div>

                {/* Validity Date & Attachment URL */}
                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">Quotation Validity</label>
                  <input
                    type="date"
                    value={quotationForm.validUntil || ""}
                    onChange={(e) => setQuotationForm({ ...quotationForm, validUntil: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">Attachment / COA URL</label>
                  <input
                    type="url"
                    value={quotationForm.attachmentUrl || ""}
                    onChange={(e) => setQuotationForm({ ...quotationForm, attachmentUrl: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                    placeholder="https://.../quote.pdf"
                  />
                </div>
              </div>

              {/* Technical Specifications */}
              <div>
                <label className="text-[11px] font-bold text-[#334155] block mb-1">Purity & Technical Specifications</label>
                <textarea
                  rows={2}
                  value={quotationForm.puritySpecifications || ""}
                  onChange={(e) => setQuotationForm({ ...quotationForm, puritySpecifications: e.target.value })}
                  className="w-full p-2 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                  placeholder="e.g. Purity >= 99.2%, Assay (HPLC): 99.5%, Moisture < 0.5%"
                />
              </div>

              {/* Internal Notes */}
              <div>
                <label className="text-[11px] font-bold text-[#334155] block mb-1 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#DC2626]" />
                  <span>Internal Sourcing Desk Notes (Strictly Confidential - Not Shared With Buyer)</span>
                </label>
                <textarea
                  rows={2}
                  value={quotationForm.notes || ""}
                  onChange={(e) => setQuotationForm({ ...quotationForm, notes: e.target.value })}
                  className="w-full p-2 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                  placeholder="Internal comments, margin calculations, supplier responsiveness notes..."
                />
              </div>

              {/* Share With Buyer Permission Toggle */}
              <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#0F172A] block">Share Quotation Details with Buyer</span>
                  <span className="text-[11px] text-[#64748B]">
                    Permits the buyer to see these commercial specs. Supplier corporate identity remains private by default.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(quotationForm.shareWithBuyer)}
                  onChange={(e) => setQuotationForm({ ...quotationForm, shareWithBuyer: e.target.checked })}
                  className="w-4 h-4 text-[#0052CC] rounded cursor-pointer"
                />
              </div>

              {/* Dynamic Landed Cost Calculation Box */}
              {quotationForm.unitPrice > 0 && (
                <div className="p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-[6px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#14532D] flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-[#15803D]" />
                      <span>Comparable Landed Cost Projection</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#166534]">
                      Inquiry Target: {detail.quantity} {quotationForm.unit || detail.unit}
                    </span>
                  </div>

                  {(() => {
                    const targetQty = detail.quantity > 0 ? detail.quantity : 1;
                    const basePrice = Number(quotationForm.unitPrice) || 0;
                    const delivery = Number(quotationForm.deliveryCharges) || 0;
                    const freightPerUnit = delivery / targetQty;
                    const landedUnitCost = basePrice + freightPerUnit;
                    const totalCost = (basePrice * targetQty) + delivery;

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
                        <div className="bg-white p-2 rounded border border-[#DCFCE7]">
                          <span className="text-[9px] text-[#64748B] block">Base Unit Price</span>
                          <span className="font-bold text-[#0F172A]">{quotationForm.currency} {basePrice.toFixed(2)}</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-[#DCFCE7]">
                          <span className="text-[9px] text-[#64748B] block">Freight / Unit</span>
                          <span className="font-bold text-[#475569]">{quotationForm.currency} {freightPerUnit.toFixed(2)}</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-[#86EFAC] ring-1 ring-[#86EFAC]">
                          <span className="text-[9px] text-[#15803D] font-bold block">Effective Landed Cost</span>
                          <span className="font-bold text-[#15803D] text-sm">{quotationForm.currency} {landedUnitCost.toFixed(2)}</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-[#DCFCE7]">
                          <span className="text-[9px] text-[#64748B] block">Total Inquiry Cost</span>
                          <span className="font-bold text-[#0F172A]">{quotationForm.currency} {totalCost.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddQuotationOpen(false)}
                  className="px-3.5 py-1.5 bg-white border border-[#CBD5E1] text-[#475569] font-semibold rounded-[4px] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quotationSubmitting}
                  className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-semibold rounded-[4px] transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {quotationSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingQuotationId ? "Update Quotation" : "Save Quotation"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ASSEMBLE BUYER-FACING PROPOSAL
      ========================================================================= */}
      {isCreateProposalOpen && detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-[10px] border border-[#E2E8F0] shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0052CC]" />
                  <span>Assemble Buyer-Facing Sourcing Proposal</span>
                </h3>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Package commercial options for <span className="font-semibold text-[#0F172A]">{detail.productName}</span>. Raw supplier contact info is masked automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateProposalOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProposal} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {proposalActionError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[6px] text-[#991B1B] text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{proposalActionError}</span>
                </div>
              )}

              {/* Proposal Title */}
              <div>
                <label className="text-[11px] font-bold text-[#334155] block mb-1">
                  Proposal Title <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={proposalForm.title}
                  onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC] font-semibold"
                  placeholder="e.g. Sourcing Proposal for Ketoconazole USP 250 KG"
                />
              </div>

              {/* Summary Notes & Recommendations for Buyer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-[#334155] block mb-1">
                    Procurement Executive Summary (Visible to Buyer)
                  </label>
                  <textarea
                    rows={3}
                    value={proposalForm.summaryNotes || ""}
                    onChange={(e) => setProposalForm({ ...proposalForm, summaryNotes: e.target.value })}
                    className="w-full p-2 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                    placeholder="Briefly summarize market availability and the options presented..."
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#0052CC] block mb-1">
                    Sourcing Recommendations & Guidance (Visible to Buyer)
                  </label>
                  <textarea
                    rows={3}
                    value={proposalForm.recommendationNotes || ""}
                    onChange={(e) => setProposalForm({ ...proposalForm, recommendationNotes: e.target.value })}
                    className="w-full p-2 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                    placeholder="Advise on which option offers optimal price vs lead time vs pharmacopeial compliance..."
                  />
                </div>
              </div>

              {/* Options Builder Section */}
              <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                      Curated Supplier Options ({proposalForm.options.length})
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      Configure options (e.g. Option A - Fastest Delivery, Option B - Economy Bulk).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddProposalOption}
                    className="px-2.5 py-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] font-semibold rounded-[4px] text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Option</span>
                  </button>
                </div>

                {/* Option Cards */}
                <div className="space-y-4">
                  {proposalForm.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="border border-[#CBD5E1] rounded-[8px] p-4 bg-[#F8FAFC] space-y-3 relative"
                    >
                      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                        <span className="font-bold text-[#0052CC] text-xs">
                          Option {idx + 1}: {opt.optionLabel}
                        </span>
                        {proposalForm.options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveProposalOption(idx)}
                            className="text-[#DC2626] hover:text-[#B91C1C] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Option</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-[#475569] block mb-0.5">Option Label</label>
                          <input
                            type="text"
                            required
                            value={opt.optionLabel}
                            onChange={(e) => handleUpdateProposalOption(idx, { optionLabel: e.target.value })}
                            className="w-full h-7 px-2 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                            placeholder="e.g. Option A (Recommended)"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#475569] block mb-0.5">Supplier Display Name</label>
                          <input
                            type="text"
                            required
                            value={opt.supplierDisplayName}
                            onChange={(e) => handleUpdateProposalOption(idx, { supplierDisplayName: e.target.value })}
                            className="w-full h-7 px-2 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                            placeholder="e.g. WHO-GMP Certified Domestic Manufacturer"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#475569] block mb-0.5">Offered Price / Unit</label>
                          <div className="flex gap-1.5">
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={opt.offeredPricePerUnit || ""}
                              onChange={(e) => handleUpdateProposalOption(idx, { offeredPricePerUnit: parseFloat(e.target.value) || 0 })}
                              className="flex-1 h-7 px-2 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC] font-mono font-bold"
                            />
                            <span className="text-[11px] font-mono text-[#64748B] flex items-center">
                              {opt.currency || "INR"} / {opt.unit || detail.unit}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#475569] block mb-0.5">Grade / Pharmacopoeia</label>
                          <input
                            type="text"
                            value={opt.grade || ""}
                            onChange={(e) => handleUpdateProposalOption(idx, { grade: e.target.value })}
                            className="w-full h-7 px-2 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                            placeholder="e.g. USP / IP"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#475569] block mb-0.5">Lead Time (Dispatch Days)</label>
                          <input
                            type="number"
                            value={opt.leadTimeDays || ""}
                            onChange={(e) => handleUpdateProposalOption(idx, { leadTimeDays: parseInt(e.target.value) || 7 })}
                            className="w-full h-7 px-2 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                            placeholder="7"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#475569] block mb-0.5">Delivery Terms</label>
                          <input
                            type="text"
                            value={opt.deliveryTerms || ""}
                            onChange={(e) => handleUpdateProposalOption(idx, { deliveryTerms: e.target.value })}
                            className="w-full h-7 px-2 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                            placeholder="e.g. Door Delivery to Hyderabad SEZ"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-[#475569] block mb-0.5">Purity & Technical Specifications</label>
                          <input
                            type="text"
                            value={opt.puritySpecifications || ""}
                            onChange={(e) => handleUpdateProposalOption(idx, { puritySpecifications: e.target.value })}
                            className="w-full h-7 px-2 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                            placeholder="e.g. Purity >= 99.0%, Assay 99.5%"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#475569] block mb-0.5">COA / Specs Document URL</label>
                          <input
                            type="url"
                            value={opt.documentUrl || ""}
                            onChange={(e) => handleUpdateProposalOption(idx, { documentUrl: e.target.value })}
                            className="w-full h-7 px-2 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                            placeholder="https://..."
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-bold text-[#475569] block mb-0.5">Recommendation Note for Option</label>
                          <input
                            type="text"
                            value={opt.recommendationNotes || ""}
                            onChange={(e) => handleUpdateProposalOption(idx, { recommendationNotes: e.target.value })}
                            className="w-full h-7 px-2 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0052CC]"
                            placeholder="e.g. Fastest turnaround, audit-ready manufacturing plant"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="text-[11px] font-bold text-[#334155] block mb-1">Commercial & Escrow Terms</label>
                <textarea
                  rows={2}
                  value={proposalForm.termsAndConditions || ""}
                  onChange={(e) => setProposalForm({ ...proposalForm, termsAndConditions: e.target.value })}
                  className="w-full p-2 text-xs bg-white border border-[#CBD5E1] rounded-[4px] focus:outline-none focus:border-[#0052CC]"
                />
              </div>

              {/* Publish Toggle */}
              <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-[6px] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#14532D] block">Publish Proposal Immediately</span>
                  <span className="text-[11px] text-[#166534]">
                    Makes proposal visible to buyer on their portal and updates inquiry status to PROPOSAL_SENT.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(proposalForm.publishImmediately)}
                  onChange={(e) => setProposalForm({ ...proposalForm, publishImmediately: e.target.checked })}
                  className="w-4 h-4 text-[#15803D] rounded cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateProposalOpen(false)}
                  className="px-3.5 py-1.5 bg-white border border-[#CBD5E1] text-[#475569] font-semibold rounded-[4px] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={proposalSubmitting}
                  className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-semibold rounded-[4px] transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {proposalSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Proposal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
