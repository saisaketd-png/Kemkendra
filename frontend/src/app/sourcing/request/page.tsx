"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
import {
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UploadCloud,
  FileText,
  X,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  Lock,
  ArrowRight,
  HelpCircle,
  BadgeAlert,
  Info,
} from "lucide-react";
import { getAuthUser, getAuthToken, getCurrentUserProfile, AuthUser, UserProfile } from "@/features/auth/api/auth";
import { resolveApiUrl } from "@/lib/apiUrl";

type SourcingUser = AuthUser & Partial<UserProfile>;

const PRODUCT_CATEGORIES = [
  "Industrial Chemicals",
  "Specialty Chemicals",
  "Pharmaceutical Ingredients",
  "APIs",
  "Intermediates",
  "Excipients",
  "Solvents",
  "Reagents",
  "Other",
] as const;

const UNITS_OF_MEASUREMENT = [
  { value: "KG", label: "Kilograms (kg)" },
  { value: "MT", label: "Metric Tons (MT)" },
  { value: "L", label: "Liters (L)" },
  { value: "G", label: "Grams (g)" },
  { value: "DRUM", label: "Drums (25kg / 200kg)" },
  { value: "IBC", label: "IBC Tanks (1000L)" },
  { value: "OTHER", label: "Other Unit" },
];

const PHARMACOPEIAL_STANDARDS = [
  "None / Not Applicable",
  "IP (Indian Pharmacopoeia)",
  "USP (United States Pharmacopeia)",
  "BP (British Pharmacopoeia)",
  "EP / Ph. Eur. (European Pharmacopoeia)",
  "JP (Japanese Pharmacopoeia)",
  "Multiple Pharmacopoeias (IP/USP/BP)",
];

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export default function SourcingRequestPage() {
  const router = useRouter();

  // Authentication State
  const [user, setUser] = useState<SourcingUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Form Fields - Required
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState<string>(PRODUCT_CATEGORIES[0]);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("KG");
  const [deliveryLocation, setDeliveryLocation] = useState("");

  // Form Fields - Optional
  const [casNumber, setCasNumber] = useState("");
  const [grade, setGrade] = useState("");
  const [purity, setPurity] = useState("");
  const [pharmacopeia, setPharmacopeia] = useState(PHARMACOPEIAL_STANDARDS[0]);
  const [packaging, setPackaging] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission State
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [generatedReference, setGeneratedReference] = useState("");
  const [submittedSummary, setSubmittedSummary] = useState<{
    productName: string;
    category: string;
    quantity: string;
    unit: string;
    reference: string;
  } | null>(null);

  // Load and prefill buyer authentication
  useEffect(() => {
    const auth = getAuthUser();
    if (auth) {
      getCurrentUserProfile()
        .then((profile) => {
          setUser({ ...auth, ...profile });
        })
        .catch(() => {
          setUser(auth);
        })
        .finally(() => {
          setAuthChecked(true);
        });
    } else {
      setUser(null);
      setAuthChecked(true);
    }
  }, []);

  // Handle file selection and validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Check extension
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError(`Invalid file format (${ext}). Supported formats: PDF, DOC, DOCX, JPG, PNG.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Check size (10 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File size exceeds 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a smaller file.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Form Validation & Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    // 1. Require Authentication
    if (!user) {
      setStatus("error");
      setErrorMessage("Buyer authentication is required to submit a sourcing request. Please sign in or register.");
      return;
    }

    // 2. Validate Required Fields
    if (!productName.trim()) {
      setStatus("error");
      setErrorMessage("Product or chemical name is required.");
      return;
    }

    if (!category.trim()) {
      setStatus("error");
      setErrorMessage("Please select a product category.");
      return;
    }

    const parsedQty = parseFloat(quantity);
    if (!quantity || isNaN(parsedQty) || parsedQty <= 0) {
      setStatus("error");
      setErrorMessage("Please enter a valid quantity greater than 0.");
      return;
    }

    if (!deliveryLocation.trim()) {
      setStatus("error");
      setErrorMessage("Delivery location (City, State or Port) is required.");
      return;
    }

    startTransition(async () => {
      try {
        const token = getAuthToken();
        const year = new Date().getFullYear();
        const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
        const clientReference = `SRQ-${year}-${randomHex}`;

        // 3. Optional Document Upload if attached
        let documentAttachmentRef: string | null = null;
        if (selectedFile) {
          try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("ownerType", "USER");
            formData.append("ownerId", user.id || user.email);
            formData.append("category", "COA");
            formData.append("title", `Sourcing Spec Sheet - ${productName.trim()}`);

            const docRes = await fetch(resolveApiUrl("/api/v1/documents"), {
              method: "POST",
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: formData,
            });

            if (docRes.ok) {
              const docData = await docRes.json();
              documentAttachmentRef = docData.id ? String(docData.id) : (docData.url || selectedFile.name);
            } else {
              documentAttachmentRef = selectedFile.name;
            }
          } catch {
            documentAttachmentRef = selectedFile.name;
          }
        }

        // 4. Construct Sourcing Request Payload for KemKendra Sourcing API
        const sourcingPayload = {
          productName: productName.trim(),
          category: category,
          quantity: parsedQty,
          unit: unit,
          deliveryLocation: deliveryLocation.trim(),
          casNumber: casNumber.trim() || undefined,
          grade: grade.trim() || undefined,
          specifications: purity.trim() || undefined,
          pharmacopeialStandard: pharmacopeia !== "None / Not Applicable" ? pharmacopeia : undefined,
          packaging: packaging.trim() || undefined,
          targetPrice: targetPrice.trim() ? parseFloat(targetPrice.trim()) : undefined,
          currency: currency || "INR",
          expectedDeliveryDate: expectedDeliveryDate || undefined,
          additionalRequirements: additionalRequirements.trim() || undefined,
          attachmentReferences: documentAttachmentRef || undefined,
        };

        // 5. Transmit directly to KemKendra Sourcing API endpoint
        const res = await fetch(resolveApiUrl("/api/v1/sourcing/requests"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(sourcingPayload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message || "Failed to submit sourcing request. Please try again.");
        }

        const data = await res.json();
        const serverRef = data.sourcingRequestReference || clientReference;

        setGeneratedReference(serverRef);
        setSubmittedSummary({
          productName: productName.trim(),
          category,
          quantity: `${parsedQty} ${unit}`,
          unit,
          reference: serverRef,
        });
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "An unexpected error occurred while communicating with the sourcing desk.");
      }
    });
  };

  const handleReset = () => {
    setProductName("");
    setCategory(PRODUCT_CATEGORIES[0]);
    setQuantity("");
    setUnit("KG");
    setDeliveryLocation("");
    setCasNumber("");
    setGrade("");
    setPurity("");
    setPharmacopeia(PHARMACOPEIAL_STANDARDS[0]);
    setPackaging("");
    setTargetPrice("");
    setCurrency("INR");
    setExpectedDeliveryDate("");
    setAdditionalRequirements("");
    setSelectedFile(null);
    setStatus("idle");
    setErrorMessage("");
    setGeneratedReference("");
    setSubmittedSummary(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] font-sans text-[#0F172A] antialiased">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
            <Link href="/" className="hover:text-[#0052CC] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <Link href="/sourcing" className="hover:text-[#0052CC] transition-colors">Sourcing</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="text-[#0F172A] font-extrabold">Submit Sourcing Request</span>
          </nav>

          {/* Header Title Banner */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-2xs">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] text-xs font-bold bg-[#EFF6FF] text-[#0052CC] border border-[#BFDBFE] mb-3">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>KemKendra Sourcing Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              Submit Sourcing Requirement
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] mt-2 max-w-2xl leading-relaxed">
              Tell us what chemical or pharmaceutical raw material you need. Our internal procurement team will review your specifications, connect with vetted manufacturers, and collect competitive quotations for your evaluation.
            </p>
          </div>

          {/* Authentication Check & Prefilled Buyer Banner */}
          {authChecked && (
            user ? (
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#14532D] block">
                      Authenticated Buyer Account: {user.name || user.email}
                    </span>
                    <span className="text-[#166534]">
                      {user.email}{user.phone ? ` • ${user.phone}` : ""}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-semibold px-2 py-1 bg-white rounded border border-[#BBF7D0] text-[#15803D] self-start sm:self-auto">
                  VERIFIED BUYER
                </span>
              </div>
            ) : (
              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#991B1B] block">
                      Buyer Authentication Required
                    </span>
                    <span className="text-[#B91C1C]">
                      Please sign in with your buyer account before submitting so our procurement team can deliver confidential quotations to your desk.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <Link
                    href="/login?redirect=/sourcing/request"
                    className="px-3 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-[6px] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register?redirect=/sourcing/request"
                    className="px-3 py-1.5 bg-white border border-[#FECACA] text-[#991B1B] font-semibold rounded-[6px] hover:bg-[#FFF5F5] transition-colors"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )
          )}

          {/* Submission Success Screen */}
          {status === "success" && submittedSummary ? (
            <div className="bg-white border border-[#BBF7D0] rounded-xl p-8 sm:p-12 text-center shadow-xs space-y-6">
              <div className="w-16 h-16 bg-[#DCFCE7] text-[#16A34A] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#16A34A] block mb-1">
                  Procurement Intake Confirmed
                </span>
                <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
                  Sourcing Request Successfully Submitted
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] mt-2 max-w-lg mx-auto">
                  Our internal chemical procurement team has received your requirement and begun outreach to suitable manufacturers.
                </p>
              </div>

              {/* Reference Details Box */}
              <div className="max-w-md mx-auto bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-5 text-left space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B] font-medium">Request Reference:</span>
                  <span className="font-bold text-[#0052CC]">{submittedSummary.reference}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B] font-medium">Product / Compound:</span>
                  <span className="font-semibold text-[#0F172A]">{submittedSummary.productName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B] font-medium">Category:</span>
                  <span className="text-[#0F172A]">{submittedSummary.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B] font-medium">Target Volume:</span>
                  <span className="text-[#0F172A]">{submittedSummary.quantity}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[6px] transition-colors shadow-xs"
                >
                  Submit Another Requirement
                </button>
                <Link
                  href="/dashboard/buyer/sourcing"
                  className="w-full sm:w-auto px-5 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#334155] text-xs font-semibold rounded-[6px] transition-colors"
                >
                  View in My Sourcing Desk
                </Link>
              </div>
            </div>
          ) : (
            /* Main Sourcing Request Form */
            <form onSubmit={handleSubmit} className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-10 shadow-2xs space-y-8">
              
              {status === "error" && (
                <div className="p-4 rounded-[6px] bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-3 text-xs text-[#B91C1C]">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SECTION 1: PRODUCT & CHEMICAL IDENTIFICATION */}
              {/* ========================================================================= */}
              <div className="space-y-4">
                <div className="border-b border-[#F1F5F9] pb-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0052CC] block">
                    Section 1 of 4
                  </span>
                  <h2 className="text-base font-bold text-[#0F172A]">
                    Chemical & Product Identification
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Product or Chemical Name <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g., 4-Hydroxycarbazole, Monomethyl Adipate, Natural Tocopherol Oil"
                      className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                    />
                  </div>

                  {/* Product Category */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Product Category <span className="text-[#DC2626]">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none"
                    >
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CAS Number */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      CAS Number <span className="text-[#64748B] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={casNumber}
                      onChange={(e) => setCasNumber(e.target.value)}
                      placeholder="e.g., 52602-39-8 or 1406-66-2"
                      className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                    />
                  </div>

                  {/* Pharmacopeial Standard */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Pharmacopeial Standard <span className="text-[#64748B] font-normal">(Optional)</span>
                    </label>
                    <select
                      value={pharmacopeia}
                      onChange={(e) => setPharmacopeia(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none"
                    >
                      {PHARMACOPEIAL_STANDARDS.map((std) => (
                        <option key={std} value={std}>
                          {std}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SECTION 2: VOLUME & DELIVERY REQUIREMENTS */}
              {/* ========================================================================= */}
              <div className="space-y-4 pt-4 border-t border-[#F1F5F9]">
                <div className="border-b border-[#F1F5F9] pb-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0052CC] block">
                    Section 2 of 4
                  </span>
                  <h2 className="text-base font-bold text-[#0F172A]">
                    Volume & Delivery Parameters
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Required Quantity */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Required Quantity <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g., 500 or 25"
                      className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                    />
                  </div>

                  {/* Unit of Measurement */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Unit of Measurement <span className="text-[#DC2626]">*</span>
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none"
                    >
                      {UNITS_OF_MEASUREMENT.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Delivery Location */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Delivery Location / Destination <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      placeholder="e.g., Hyderabad, Telangana / JNPT Port, Mumbai"
                      className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                    />
                  </div>

                  {/* Expected Delivery Date */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Expected Delivery Date <span className="text-[#64748B] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={expectedDeliveryDate}
                      onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SECTION 3: QUALITY, GRADE & PACKAGING */}
              {/* ========================================================================= */}
              <div className="space-y-4 pt-4 border-t border-[#F1F5F9]">
                <div className="border-b border-[#F1F5F9] pb-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0052CC] block">
                    Section 3 of 4
                  </span>
                  <h2 className="text-base font-bold text-[#0F172A]">
                    Quality, Grade & Packaging Specifications
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Required Grade */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Required Grade <span className="text-[#64748B] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="e.g., Pharma Grade, Technical, AR, Food Grade"
                      className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                    />
                  </div>

                  {/* Purity / Technical Specifications */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Purity or Assay Specifications <span className="text-[#64748B] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={purity}
                      onChange={(e) => setPurity(e.target.value)}
                      placeholder="e.g., NLT 99.0% (HPLC), Moisture < 0.5%"
                      className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                    />
                  </div>

                  {/* Packaging Requirements */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Packaging Requirements <span className="text-[#64748B] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={packaging}
                      onChange={(e) => setPackaging(e.target.value)}
                      placeholder="e.g., 25 kg Fiber Drum, 200 kg Steel Drum, 1000 kg IBC Tank, Nitrogen-flushed"
                      className="w-full h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                    />
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SECTION 4: COMMERCIAL TERMS & DOCUMENT UPLOAD */}
              {/* ========================================================================= */}
              <div className="space-y-4 pt-4 border-t border-[#F1F5F9]">
                <div className="border-b border-[#F1F5F9] pb-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0052CC] block">
                    Section 4 of 4
                  </span>
                  <h2 className="text-base font-bold text-[#0F172A]">
                    Commercial Terms & Supporting Documents
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Target Price */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Target Price <span className="text-[#64748B] font-normal">(Optional, per unit)</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-24 h-10 px-2 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        placeholder="e.g., 2400"
                        className="flex-1 h-10 px-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                      />
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Specification Document <span className="text-[#64748B] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      id="spec-file-input"
                    />
                    {!selectedFile ? (
                      <label
                        htmlFor="spec-file-input"
                        className="h-10 px-3 bg-white border border-dashed border-[#CBD5E1] hover:border-[#0052CC] rounded-[6px] flex items-center justify-center gap-2 text-xs text-[#64748B] hover:text-[#0052CC] cursor-pointer transition-colors"
                      >
                        <UploadCloud className="w-4 h-4 text-[#94A3B8]" />
                        <span>Upload TDS / COA / Spec Sheet (Max 10MB)</span>
                      </label>
                    ) : (
                      <div className="h-10 px-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-[6px] flex items-center justify-between text-xs text-[#166534]">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-[#16A34A] shrink-0" />
                          <span className="truncate font-medium">{selectedFile.name}</span>
                          <span className="text-[10px] text-[#64748B]">
                            ({(selectedFile.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={removeSelectedFile}
                          className="p-1 text-[#64748B] hover:text-[#DC2626] transition-colors cursor-pointer"
                          aria-label="Remove uploaded file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {fileError && (
                      <p className="text-[11px] text-[#DC2626] mt-1">{fileError}</p>
                    )}
                  </div>

                  {/* Additional Requirements / Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Additional Requirements & Notes <span className="text-[#64748B] font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={additionalRequirements}
                      onChange={(e) => setAdditionalRequirements(e.target.value)}
                      placeholder="Provide any specific manufacturer certifications (WHO-GMP, ISO 9001), regulatory compliance (REACH), inspection needs, or commercial constraints..."
                      className="w-full p-3 bg-white border border-[#CBD5E1] rounded-[6px] text-xs text-[#0F172A] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] focus:outline-none placeholder-[#94A3B8]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit & Auth Actions */}
              <div className="pt-4 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>Confidential inquiry handled exclusively by KemKendra procurement.</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    href="/sourcing"
                    className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#CBD5E1] text-[#475569] text-xs font-semibold rounded-[6px] hover:bg-[#F8FAFC] text-center transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isPending || !user}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] disabled:bg-[#94A3B8] disabled:cursor-not-allowed text-white text-xs font-bold rounded-[6px] transition-colors shadow-xs cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting Sourcing Request...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Sourcing Requirement</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
