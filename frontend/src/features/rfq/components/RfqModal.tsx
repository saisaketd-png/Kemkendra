"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  Clock,
  Lock,
  UserCheck,
  Sparkles,
  ChevronRight,
  Phone,
  Mail,
  KeyRound,
  FileCheck2,
} from "lucide-react";
import { createRfq } from "../api/createRfq";
import {
  getAuthToken,
  getAuthUser,
  setAuthToken,
  login,
  registerBuyer,
  AuthUser,
} from "@/features/auth/api/auth";
import { ChemicalStructureVisual } from "@/shared/components/ChemicalStructureVisual";

export type RfqModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  masterProductId?: string;
  supplierOfferingId?: string;
  productName: string;
  supplierId: number;
  supplierName: string;
  supplierCountry: string;
  defaultQuantity?: number;
  casNumber?: string;
};

const COMMON_VOLUME_PRESETS = [
  { label: "10 kg", qty: 10, unit: "kg" },
  { label: "50 kg", qty: 50, unit: "kg" },
  { label: "100 kg", qty: 100, unit: "kg" },
  { label: "500 kg", qty: 500, unit: "kg" },
  { label: "1 MT", qty: 1, unit: "MT" },
  { label: "5 MT", qty: 5, unit: "MT" },
];

export default function RfqModal({
  isOpen,
  onClose,
  productId,
  masterProductId,
  supplierOfferingId,
  productName,
  supplierId,
  supplierName,
  supplierCountry,
  defaultQuantity,
  casNumber,
}: RfqModalProps) {
  // Auth state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // RFQ Requirement state
  const [quantity, setQuantity] = useState<number | string>(defaultQuantity || 100);
  const [unit, setUnit] = useState("kg");
  const [deliveryLocation, setDeliveryLocation] = useState("Mumbai Port, India");
  const [messageText, setMessageText] = useState("");

  // Inline Auth Form state (for unauthenticated buyers)
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");

  // Process / Submission state
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRfq, setSubmittedRfq] = useState<any | null>(null);
  const [step, setStep] = useState<"form" | "success">("form");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const token = getAuthToken();
      const user = getAuthUser();
      const authed = Boolean(token && user);
      setIsAuthenticated(authed);
      setCurrentUser(user);
      if (user?.email) {
        setAuthEmail(user.email);
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setStep("form");
    setQuantity(defaultQuantity || 100);
    setUnit("kg");
    setDeliveryLocation("Mumbai Port, India");
    setMessageText("");
    setError(null);
    setSubmittedRfq(null);
    onClose();
  };

  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  // Primary Submission: Handles Requirements + Inline Authentication + Instant RFQ Transmission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setError(null);

    const numericQuantity = Number(quantity);
    if (!quantity || !Number.isFinite(numericQuantity) || numericQuantity <= 0) {
      setError("Please enter a valid requirement quantity greater than 0.");
      return;
    }

    if (!deliveryLocation.trim()) {
      setError("Please specify your delivery port or receiving destination.");
      return;
    }

    setSubmitting(true);
    submittingRef.current = true;

    try {
      let activeToken = getAuthToken();

      // If user is NOT signed in, perform seamless inline auth first
      if (!activeToken || !isAuthenticated) {
        if (!authEmail.trim() || !authPassword.trim()) {
          setError("Please enter your work email and password to authenticate your buyer account.");
          setSubmitting(false);
          submittingRef.current = false;
          return;
        }

        if (authMode === "register") {
          if (!authName.trim()) {
            setError("Please enter your full name or company name.");
            setSubmitting(false);
            submittingRef.current = false;
            return;
          }

          // Register new buyer
          await registerBuyer({
            name: authName.trim(),
            email: authEmail.trim().toLowerCase(),
            phone: authPhone.trim() || undefined,
            password: authPassword,
            termsAccepted: true,
            privacyAccepted: true,
          });
        }

        // Login to acquire verified JWT session
        const loginRes = await login({
          email: authEmail.trim().toLowerCase(),
          password: authPassword,
        });

        if (!loginRes?.token) {
          throw new Error("Authentication failed. Please verify your credentials.");
        }

        setAuthToken(loginRes.token);
        activeToken = loginRes.token;
        const loggedInUser = getAuthUser();
        setIsAuthenticated(true);
        setCurrentUser(loggedInUser);
        window.dispatchEvent(new Event("auth-changed"));
      }

      // Format payload and dispatch RFQ
      const fullMessage = deliveryLocation
        ? `Delivery Destination: ${deliveryLocation.trim()}\n\nTechnical Requirements & Standards:\n${messageText.trim() || "Standard commercial synthesis specifications with CoA."}`
        : messageText.trim();

      const payload = {
        productId: productId || undefined,
        masterProductId: masterProductId || undefined,
        supplierOfferingId: supplierOfferingId || undefined,
        supplierId,
        quantity: numericQuantity,
        unit,
        message: fullMessage,
      };

      const res = await createRfq(payload);
      setSubmittedRfq(res);
      setStep("success");
      window.dispatchEvent(new CustomEvent("rfq-updated", { detail: { rfqId: res.id } }));
    } catch (err: any) {
      setError(err.message || "Failed to submit quotation request. Please try again.");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rfq-modal-title"
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200/90 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-150">
        
        {/* ========================================================================= */}
        {/* HEADER: IndiaMART-style clean inquiry bar                                */}
        {/* ========================================================================= */}
        <div className="px-5 py-3.5 bg-[#0F172A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 id="rfq-modal-title" className="text-sm font-bold tracking-tight text-white">
              Request Best Quotation
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* PRODUCT SHOWCASE BANNER: Chemical 2D skeletal card + Verified Supplier    */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-4.5 bg-[#F8F9FA] border-b border-slate-200 flex items-center gap-3.5 shrink-0">
          {/* Chemical 2D structure preview */}
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
            <ChemicalStructureVisual chemicalName={productName} casNumber={casNumber} className="w-full h-full" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0052CC] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded">
                Verified Sourcing
              </span>
              {casNumber && (
                <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                  CAS: {casNumber}
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] truncate mt-0.5">
              {productName}
            </h3>

            <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5 truncate">
              <span>Manufacturer: <strong className="text-[#0F172A]">{supplierName}</strong></span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {supplierCountry}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL BODY                                                                */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {step === "form" ? (
            <form id="quote-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* 1. QUANTITY & UNIT ROW */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Required Quantity & Sourcing Volume <span className="text-[#DC2626]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      min="1"
                      step="any"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full h-10 px-3.5 text-base sm:text-xs font-bold text-[#0F172A] bg-white border border-slate-300 rounded-lg focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 focus:outline-none shadow-2xs transition-colors"
                    />
                  </div>
                  <div>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full h-10 px-3 text-base sm:text-xs font-medium text-[#0F172A] bg-white border border-slate-300 rounded-lg focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 focus:outline-none shadow-2xs transition-colors"
                    >
                      <option value="kg">kg</option>
                      <option value="MT">Metric Ton (MT)</option>
                      <option value="g">Grams (g)</option>
                      <option value="L">Liters (L)</option>
                      <option value="Drums">Drums (25/200kg)</option>
                    </select>
                  </div>
                </div>

                {/* IndiaMART-Style Fast Volume Preset Chips */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[11px] text-[#64748B]">Quick presets:</span>
                  {COMMON_VOLUME_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setQuantity(p.qty);
                        setUnit(p.unit);
                      }}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
                        quantity === p.qty && unit === p.unit
                          ? "bg-[#0052CC] text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. DELIVERY DESTINATION */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Delivery Destination / Discharge Port <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="e.g. Mumbai Port (JNPT), India or Rotterdam, Netherlands"
                  className="w-full h-10 px-3.5 text-base sm:text-xs text-[#0F172A] bg-white border border-slate-300 rounded-lg focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 focus:outline-none shadow-2xs transition-colors"
                />
              </div>

              {/* 3. TECHNICAL SPECIFICATIONS & PACKAGING */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Technical Specifications & Quality Notes <span className="text-[#64748B] font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="e.g. Purity ≥ 99.0%, USP/IP compendial grade, HDPE drums with batch Certificate of Analysis (CoA)."
                  className="w-full p-2.5 text-xs text-[#0F172A] bg-white border border-slate-300 rounded-lg focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 focus:outline-none resize-none shadow-2xs transition-colors"
                />
              </div>

              {/* ========================================================================= */}
              {/* 4. BUYER IDENTITY & INLINE AUTHENTICATION SECTION                         */}
              {/* ========================================================================= */}
              {isAuthenticated ? (
                /* Authenticated Buyer Profile Ribbon */
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-emerald-950 block">
                        Verified Buyer: {currentUser?.email}
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        Quotations will be routed securely to your procurement desk.
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    Ready
                  </span>
                </div>
              ) : (
                /* Unauthenticated: Seamless IndiaMART-style Inline Sign-In / Fast Register */
                <div className="p-4 bg-[#F8F9FA] border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#0052CC]" />
                      <strong className="text-xs font-bold text-[#0F172A]">
                        Buyer Account Required
                      </strong>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("login");
                          setError(null);
                        }}
                        className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                          authMode === "login"
                            ? "bg-[#0052CC] text-white"
                            : "text-[#64748B] hover:text-[#0F172A]"
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("register");
                          setError(null);
                        }}
                        className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                          authMode === "register"
                            ? "bg-[#0052CC] text-white"
                            : "text-[#64748B] hover:text-[#0F172A]"
                        }`}
                      >
                        New Buyer? Register
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#64748B]">
                    {authMode === "login"
                      ? "Sign in to deliver your inquiry directly to the verified manufacturer."
                      : "Create a verified buyer account in 10 seconds to receive factory-direct price proposals."}
                  </p>

                  {/* Input Fields */}
                  <div className="space-y-2">
                    {authMode === "register" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="Full Name / Company Name *"
                          className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-[#0F172A] focus:border-[#0052CC] focus:outline-none shadow-2xs"
                        />
                        <input
                          type="tel"
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                          placeholder="Phone / WhatsApp (optional)"
                          className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-[#0F172A] focus:border-[#0052CC] focus:outline-none shadow-2xs"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="Work Email Address *"
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-[#0F172A] focus:border-[#0052CC] focus:outline-none shadow-2xs"
                      />
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="Password *"
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-[#0F172A] focus:border-[#0052CC] focus:outline-none shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* IndiaMART-Style Big Primary Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 press-tactile cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Quotation Request...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-4 h-4" />
                      <span>
                        {isAuthenticated
                          ? "Submit Quotation Request →"
                          : authMode === "login"
                          ? "Sign In & Submit Quotation Request →"
                          : "Register & Submit Quotation Request →"}
                      </span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-2 px-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Direct Manufacturer RFQ
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#0052CC]" /> 24h Average Response SLA
                  </span>
                </div>
              </div>
            </form>
          ) : (
            /* SUCCESS STATE */
            <div className="py-6 sm:py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-block">
                  RFQ Dispatched
                </span>
                <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
                  Quotation Request Sent to {supplierName}
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  Your inquiry for <strong className="text-[#0F172A]">{quantity} {unit}</strong> of <strong className="text-[#0F172A]">{productName}</strong> has been transmitted.
                </p>
              </div>

              {submittedRfq?.rfqReference && (
                <div className="p-3.5 bg-[#F8F9FA] border border-slate-200 rounded-xl max-w-sm mx-auto flex items-center justify-between gap-3">
                  <div className="text-left">
                    <span className="text-[10px] text-[#64748B] block font-semibold">Inquiry Reference</span>
                    <span className="font-mono text-sm font-bold text-[#0052CC] block tracking-wide">
                      {submittedRfq.rfqReference}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyReference(submittedRfq.rfqReference)}
                    className="h-8 px-2.5 text-xs font-semibold rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-[#0F172A] inline-flex items-center gap-1 shadow-2xs press-tactile"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                You can review supplier proposals, request revisions, and issue purchase orders directly in your operations desk.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <Link
                  href="/dashboard/rfqs"
                  className="w-full sm:w-auto h-10 px-5 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 shadow-xs press-tactile"
                >
                  <span>View in Buyer Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto h-10 px-5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition-colors shadow-2xs press-tactile"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
