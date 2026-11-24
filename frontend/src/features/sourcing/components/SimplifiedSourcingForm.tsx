"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  RotateCcw,
  Lock,
} from "lucide-react";
import { getAuthUser, getAuthToken, getCurrentUserProfile } from "@/features/auth/api/auth";
import { resolveApiUrl } from "@/lib/apiUrl";

interface SimplifiedSourcingFormProps {
  onSuccess?: (reference: string) => void;
  className?: string;
  variant?: "card" | "embedded";
}

const COMMON_PRESETS = [
  { label: "100 kg", qty: 100, unit: "KG" },
  { label: "500 kg", qty: 500, unit: "KG" },
  { label: "1 MT", qty: 1, unit: "MT" },
  { label: "5 MT", qty: 5, unit: "MT" },
  { label: "10 MT", qty: 10, unit: "MT" },
];

const SUGGESTED_COMPOUNDS = [
  "Paracetamol IP",
  "4-Hydroxycarbazole",
  "Glacial Acetic Acid",
  "4-Acetamidobenzenesulfonyl Chloride",
  "Ibuprofen BP",
];

export function SimplifiedSourcingForm({
  onSuccess,
  className = "",
  variant = "card",
}: SimplifiedSourcingFormProps) {
  const router = useRouter();

  // Authentication
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Form Fields
  const [productName, setProductName] = useState("");
  const [casNumber, setCasNumber] = useState("");
  const [quantity, setQuantity] = useState<number | string>(500);
  const [unit, setUnit] = useState("KG");
  const [deliveryLocation, setDeliveryLocation] = useState("Mumbai Port, India");
  const [specifications, setSpecifications] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [currency, setCurrency] = useState("INR");

  // UI States
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [generatedReference, setGeneratedReference] = useState("");

  useEffect(() => {
    const token = getAuthToken();
    const auth = getAuthUser();
    if (token && auth) {
      setIsAuthenticated(true);
      getCurrentUserProfile()
        .then((profile) => {
          setCurrentUser({ ...auth, ...profile });
        })
        .catch(() => {
          setCurrentUser(auth);
        });
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, []);

  const currentRedirectUrl =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.pathname + window.location.search)
      : "/sourcing/request";

  const handleCopyReference = () => {
    if (!generatedReference) return;
    navigator.clipboard.writeText(generatedReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setProductName("");
    setCasNumber("");
    setQuantity(500);
    setUnit("KG");
    setDeliveryLocation("Mumbai Port, India");
    setSpecifications("");
    setTargetPrice("");
    setShowAdvanced(false);
    setStatus("idle");
    setErrorMessage("");
    setGeneratedReference("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    const token = getAuthToken();
    if (!token || !isAuthenticated) {
      setStatus("error");
      setErrorMessage("Buyer authentication is required to submit a sourcing request. Please sign in or register.");
      setIsAuthenticated(false);
      return;
    }

    if (!productName.trim()) {
      setStatus("error");
      setErrorMessage("Please enter the chemical or product name.");
      return;
    }

    const numQty = parseFloat(String(quantity));
    if (!quantity || isNaN(numQty) || numQty <= 0) {
      setStatus("error");
      setErrorMessage("Please enter a valid quantity greater than 0.");
      return;
    }

    if (!deliveryLocation.trim()) {
      setStatus("error");
      setErrorMessage("Please enter the delivery destination or discharge port.");
      return;
    }

    startTransition(async () => {
      try {
        const year = new Date().getFullYear();
        const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
        const clientRef = `SRQ-${year}-${randomHex}`;

        const sourcingPayload = {
          productName: productName.trim(),
          category: "Chemical Raw Material",
          quantity: numQty,
          unit: unit,
          deliveryLocation: deliveryLocation.trim(),
          casNumber: casNumber.trim() || undefined,
          specifications: specifications.trim() || undefined,
          targetPrice: targetPrice.trim() ? parseFloat(targetPrice.trim()) : undefined,
          currency: currency || "INR",
        };

        const res = await fetch(resolveApiUrl("/api/v1/sourcing/requests"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(sourcingPayload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          if (res.status === 401 || res.status === 403) {
            setIsAuthenticated(false);
            throw new Error("Your session has expired. Please sign in again to submit.");
          }
          throw new Error(errData?.message || "Failed to submit sourcing request.");
        }

        const data = await res.json();
        const serverRef = data.sourcingRequestReference || clientRef;
        setGeneratedReference(serverRef);
        setStatus("success");
        if (onSuccess) onSuccess(serverRef);
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Failed to submit sourcing request. Please try again.");
      }
    });
  };

  if (status === "success") {
    return (
      <div className={`p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-tactile-card text-center space-y-5 ${className}`}>
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="space-y-1.5 max-w-md mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-block">
            Sourcing Ticket Dispatched
          </span>
          <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Specification Received
          </h3>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Your request for <strong className="text-[#0F172A]">{productName}</strong> ({quantity} {unit}) has been registered with the KemKendra Sourcing Clearinghouse.
          </p>
        </div>

        {/* Reference Code Card */}
        <div className="p-4 bg-[#F8F9FA] border border-slate-200 rounded-xl max-w-sm mx-auto flex items-center justify-between gap-3">
          <div className="text-left">
            <span className="text-[11px] font-semibold text-[#64748B] block">Tracking Reference</span>
            <span className="font-mono text-sm font-bold text-[#0052CC] tracking-wide block">
              {generatedReference}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyReference}
            className="h-8 px-2.5 text-xs font-semibold rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-[#0F172A] transition-colors inline-flex items-center gap-1.5 shadow-2xs press-tactile"
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

        <p className="text-xs text-[#64748B] max-w-md mx-auto">
          Our technical sourcing desk is matching your specifications across verified manufacturers. You will receive binding quotation options directly in your dashboard within 24 hours.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard/buyer/sourcing"
            className="w-full sm:w-auto h-10 px-5 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2 shadow-xs press-tactile"
          >
            <span>View in Buyer Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto h-10 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0F172A] transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs press-tactile"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Submit Another Chemical</span>
          </button>
        </div>
      </div>
    );
  }

  const containerStyles =
    variant === "card"
      ? "bg-white border border-slate-200 rounded-2xl shadow-tactile-card p-5 sm:p-7"
      : "bg-white p-4 sm:p-6";

  return (
    <div className={`${containerStyles} ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0052CC] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
              Custom Chemical Intake
            </span>
            {isAuthenticated ? (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Buyer: {currentUser?.name || currentUser?.email}
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" /> Buyer Sign-In Required
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#0F172A] mt-1 tracking-tight">
            Direct Chemical Sourcing Request
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
            Specify your required chemical, volume, and purity. Our technical desk connects you with audited synthesizers.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Chemical Name & CAS */}
        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1">
            Chemical Compound / Product Name <span className="text-[#DC2626]">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Paracetamol IP or 4-Hydroxycarbazole"
                className="w-full h-10 px-3.5 border border-slate-300 rounded-lg text-base sm:text-xs font-medium text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
              />
            </div>
            <div>
              <input
                type="text"
                value={casNumber}
                onChange={(e) => setCasNumber(e.target.value)}
                placeholder="CAS No. (optional)"
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-base sm:text-xs font-mono text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
              />
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <span className="text-[11px] text-[#64748B]">Popular:</span>
            {SUGGESTED_COMPOUNDS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setProductName(item)}
                className="text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-[#0F172A] px-2 py-0.5 rounded-md transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Target Quantity & Unit */}
        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1">
            Target Sourcing Volume <span className="text-[#DC2626]">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <input
                type="number"
                inputMode="decimal"
                min="0.1"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 500"
                className="w-full h-10 px-3.5 border border-slate-300 rounded-lg text-base sm:text-xs font-semibold text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
              />
            </div>
            <div>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-base sm:text-xs font-medium text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
              >
                <option value="KG">Kilograms (KG)</option>
                <option value="MT">Metric Tons (MT)</option>
                <option value="L">Liters (L)</option>
                <option value="G">Grams (G)</option>
                <option value="DRUM">Standard Drums</option>
                <option value="IBC">IBC Tanks (1000L)</option>
              </select>
            </div>
          </div>

          {/* Volume Preset Chips */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <span className="text-[11px] text-[#64748B]">Volume presets:</span>
            {COMMON_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setQuantity(p.qty);
                  setUnit(p.unit);
                }}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors ${
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

        {/* 3. Delivery Destination */}
        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1">
            Delivery Destination / Discharge Port <span className="text-[#DC2626]">*</span>
          </label>
          <input
            type="text"
            required
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
            placeholder="e.g. Mumbai Port, JNPT, or Rotterdam, Netherlands"
            className="w-full h-10 px-3.5 border border-slate-300 rounded-lg text-base sm:text-xs font-medium text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
          />
        </div>

        {/* 4. Specifications & Technical Standards */}
        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1">
            Specifications, Grade & Packaging <span className="text-[#64748B] font-normal">(Optional)</span>
          </label>
          <textarea
            rows={2}
            value={specifications}
            onChange={(e) => setSpecifications(e.target.value)}
            placeholder="e.g. Purity ≥ 99.0%, IP/USP grade, sealed 25kg fiber drums with lot CoA."
            className="w-full p-3 border border-slate-300 rounded-lg text-xs text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs resize-none transition-colors"
          />
        </div>

        {/* Optional Commercial Preferences Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-[#0052CC] hover:text-[#0747A6] inline-flex items-center gap-1 transition-colors"
          >
            <span>{showAdvanced ? "— Hide target pricing" : "+ Add target budget & currency"}</span>
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 p-3.5 bg-[#F8F9FA] rounded-xl border border-slate-200 animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                  Target Price / Unit
                </label>
                <input
                  type="number"
                  step="any"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="e.g. 120.00"
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs font-medium text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg text-xs text-[#0F172A] bg-white focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED</option>
                  <option value="SGD">SGD</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* AUTHENTICATION GATE: If Not Signed In, Require Login */}
        {isAuthenticated === false ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-amber-950 block">
                  Buyer Account Required to Submit Sourcing Requests
                </strong>
                <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                  To safeguard procurement confidentiality and ensure binding manufacturer pricing, sourcing requests are dispatched exclusively by verified buyer accounts.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <Link
                href={`/login?redirect=${currentRedirectUrl}`}
                className="w-full sm:w-auto h-9 px-4 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white font-semibold text-xs transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs press-tactile"
              >
                <span>Sign In to Submit Request</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href={`/register?redirect=${currentRedirectUrl}`}
                className="w-full sm:w-auto h-9 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors inline-flex items-center justify-center shadow-2xs press-tactile"
              >
                <span>Create Buyer Account</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Submit Action When Signed In */
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 press-tactile"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transmitting Specification...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Sourcing Request</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-2 px-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#0052CC]" /> 24h Average Supplier Turnaround
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Audited Synthesizers
              </span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
