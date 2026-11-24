"use client";

import React, { useState, useTransition } from "react";
import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  ChevronRight,
  MessageSquare,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackMarketingEvent } from "@/features/analytics/utils/marketingTracker";
import { resolveApiUrl } from "@/lib/apiUrl";

export default function ContactPage() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get("subject") || "";
  const initialCas = searchParams.get("cas") || "";
  const initialCompany = searchParams.get("company") || "";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState(initialCompany);
  const [inquiryType, setInquiryType] = useState(
    initialCas ? "PRODUCT_INQUIRY" : "GENERAL"
  );
  const [chemicalName, setChemicalName] = useState(initialSubject);
  const [casNumber, setCasNumber] = useState(initialCas);
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [botTrap, setBotTrap] = useState(""); // Honeypot field

  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    if (!fullName.trim() || !email.trim() || !message.trim()) {
      setStatus("error");
      setErrorMessage("Please complete all required fields (Name, Email, Message).");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          fullName: fullName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim() || null,
          companyName: companyName.trim() || null,
          inquiryType: inquiryType || "GENERAL",
          chemicalName: chemicalName.trim() || null,
          casNumber: casNumber.trim() || null,
          quantity: quantity.trim() || null,
          message: message.trim(),
          botTrap: botTrap || null,
        };

        const res = await fetch(resolveApiUrl("/api/v1/public/contact"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message || "Failed to submit inquiry. Please try again later.");
        }

        // Track conversion event in privacy-conscious analytics
        trackMarketingEvent("CONTACT_SUBMIT");

        setStatus("success");
        setMessage("");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "An unexpected error occurred. Please contact us via phone or email.");
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans text-slate-900 antialiased">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#0052CC] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">Contact Us</span>
          </nav>

          {/* Header */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 shadow-tactile-card space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0052CC] border border-blue-200/80 shadow-2xs">
              <MessageSquare className="w-4 h-4 text-[#0052CC]" /> Direct Procurement Assistance
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#091E42] tracking-tight">
              Get in Touch with KemKendra
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Whether you are sourcing hard-to-find APIs, requesting customized packaging for bulk solvents, or onboarding as a verified manufacturer, our support desk is here to assist.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Contact Details Cards */}
            <div className="lg:col-span-5 space-y-6">

              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-tactile-card space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#0052CC]" /> Registered Office
                </h2>
                <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#0052CC] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Headquarters</p>
                      <p className="text-slate-500">Bengaluru, Karnataka, India</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Direct Desk & WhatsApp</p>
                      <a href="tel:+917676447077" className="text-[#0052CC] font-bold hover:underline">
                        +91 7676447077
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#0052CC] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Email Inquiries</p>
                      <a href="mailto:kemkendra1@gmail.com" className="text-[#0052CC] font-bold hover:underline">
                        kemkendra1@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Business Hours</p>
                      <p className="text-slate-500">Monday – Saturday: 9:00 AM – 6:00 PM IST</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-6 space-y-2 shadow-2xs">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0052CC]" /> Are you a chemical manufacturer?
                </h3>
                <p className="text-xs text-blue-950/80 leading-relaxed">
                  Join our audited supplier directory to connect directly with industrial and institutional chemical buyers across India and global markets.
                </p>
                <div className="pt-2">
                  <Link
                    href="/register/supplier"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0052CC] hover:underline"
                  >
                    Apply for Manufacturer Onboarding &rarr;
                  </Link>
                </div>
              </div>

            </div>

            {/* Interactive Contact & Chemical Sourcing Form */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-tactile-card space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Direct Inquiry & Compound Sourcing</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                    Send your inquiry or chemical procurement requirement directly to our verified trade desk.
                  </p>
                </div>

                {status === "success" ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Inquiry Received Successfully
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                      Thank you for contacting KemKendra. Your inquiry has been forwarded to our procurement operations desk. A technical representative will review your request and get back to you within 1 business day.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStatus("idle")}
                      className="mt-2 text-xs font-bold text-emerald-700 underline hover:no-underline cursor-pointer"
                    >
                      Submit another inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Honeypot field for bot detection (hidden from real users) */}
                    <div className="hidden" aria-hidden="true">
                      <input
                        type="text"
                        name="botTrap"
                        value={botTrap}
                        onChange={(e) => setBotTrap(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>

                    {status === "error" && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Dr. Rajesh Kumar"
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 bg-white shadow-2xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          Business Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="procurement@company.com"
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 bg-white shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          Phone / WhatsApp Number
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 bg-white shadow-2xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          Company / Organization
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Apex Pharma Ltd"
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 bg-white shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          Inquiry Type
                        </label>
                        <select
                          value={inquiryType}
                          onChange={(e) => setInquiryType(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 bg-white shadow-2xs"
                        >
                          <option value="GENERAL">General Procurement Support</option>
                          <option value="PRODUCT_INQUIRY">Chemical Compound Sourcing</option>
                          <option value="SUPPLIER_ONBOARDING">Supplier Verification / Onboarding</option>
                          <option value="COMPLIANCE">COA / Regulatory Compliance</option>
                          <option value="ENTERPRISE">Enterprise Contract Supply</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          Estimated Volume / Quantity
                        </label>
                        <input
                          type="text"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="e.g. 500 kg, 2 drums, 10 MT"
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 bg-white shadow-2xs"
                        />
                      </div>
                    </div>

                    {inquiryType === "PRODUCT_INQUIRY" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-700">
                            Chemical Name / Compound
                          </label>
                          <input
                            type="text"
                            value={chemicalName}
                            onChange={(e) => setChemicalName(e.target.value)}
                            placeholder="e.g. Paracetamol, Ethyl Acetate"
                            className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 bg-white shadow-2xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-700">
                            CAS Registry Number
                          </label>
                          <input
                            type="text"
                            value={casNumber}
                            onChange={(e) => setCasNumber(e.target.value)}
                            placeholder="e.g. 103-90-2"
                            className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 bg-white font-mono shadow-2xs"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Inquiry Details / Message <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please specify target specifications, delivery destination, packaging preference, or testing certifications required..."
                        className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 bg-white shadow-2xs leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full h-11 px-6 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Procurement Inquiry</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
