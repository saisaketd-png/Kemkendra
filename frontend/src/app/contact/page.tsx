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
  Loader2
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
          botTrap: botTrap || null, // Honeypot
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
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] font-sans text-[#0F172A] antialiased">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
            <Link href="/" className="hover:text-[#155EEF]">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="text-[#0F172A] font-extrabold">Contact Us</span>
          </nav>

          {/* Header */}
          <div className="bg-white border border-[#DCE3EC] rounded-3xl p-8 sm:p-12 shadow-2xs space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#EFF4FF] text-[#155EEF] border border-[#BFDBFE]">
              <MessageSquare className="w-4 h-4" /> Direct Procurement Assistance
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">
              Get in Touch with KemKendra
            </h1>
            <p className="text-sm sm:text-base text-[#475467] max-w-2xl leading-relaxed">
              Whether you are sourcing hard-to-find APIs, requesting customized packaging for bulk solvents, or onboarding as a verified manufacturer, our support desk is here to assist.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Contact Details Cards */}
            <div className="lg:col-span-5 space-y-6">

              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-2xs space-y-4">
                <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#155EEF]" /> Registered Office
                </h2>
                <div className="space-y-4 text-xs sm:text-sm text-[#475467]">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#155EEF] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#0F172A]">Headquarters</p>
                      <p>Bengaluru, Karnataka, India</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#0F172A]">Direct Desk & WhatsApp</p>
                      <a href="tel:+917676447077" className="text-[#155EEF] font-bold hover:underline">
                        +91 7676447077
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#9333EA] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#0F172A]">Email Inquiries</p>
                      <a href="mailto:kemkendra1@gmail.com" className="text-[#155EEF] font-bold hover:underline">
                        kemkendra1@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#0F172A]">Business Hours</p>
                      <p>Monday – Saturday: 9:00 AM – 6:00 PM IST</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#EFF4FF] border border-[#BFDBFE] rounded-2xl p-6 space-y-2">
                <h3 className="text-sm font-bold text-[#1E40AF] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#155EEF]" /> Are you a chemical manufacturer?
                </h3>
                <p className="text-xs text-[#1E3A8A] leading-relaxed">
                  Join our audited supplier directory to connect directly with industrial and institutional chemical buyers across India and global markets.
                </p>
                <div className="pt-2">
                  <Link
                    href="/register/supplier"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#155EEF] hover:underline"
                  >
                    Apply for Manufacturer Onboarding &rarr;
                  </Link>
                </div>
              </div>

            </div>

            {/* Interactive Contact & Chemical Sourcing Form */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0F172A]">Direct Inquiry & Compound Sourcing</h2>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                    Send your inquiry or chemical procurement requirement directly to our verified trade desk.
                  </p>
                </div>

                {status === "success" ? (
                  <div className="p-6 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-3">
                    <div className="flex items-center gap-2 text-[#166534] font-bold text-base">
                      <CheckCircle2 className="w-5 h-5" /> Inquiry Received Successfully
                    </div>
                    <p className="text-xs sm:text-sm text-[#14532D] leading-relaxed">
                      Thank you for contacting KemKendra. Your inquiry has been forwarded to our procurement operations desk. A technical representative will review your request and get back to you within 1 business day.
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="mt-2 text-xs font-bold text-[#166534] underline hover:no-underline"
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
                      <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2 text-xs text-[#991B1B]">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#344054] mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Dr. Rajesh Kumar"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#344054] mb-1">
                          Business Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="procurement@company.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#344054] mb-1">
                          Phone / WhatsApp Number
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#344054] mb-1">
                          Company / Organization
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Apex Pharma Ltd"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#344054] mb-1">
                          Inquiry Type
                        </label>
                        <select
                          value={inquiryType}
                          onChange={(e) => setInquiryType(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF] bg-white"
                        >
                          <option value="GENERAL">General Procurement Support</option>
                          <option value="PRODUCT_INQUIRY">Chemical Compound Sourcing</option>
                          <option value="SUPPLIER_ONBOARDING">Supplier Verification / Onboarding</option>
                          <option value="COMPLIANCE">COA / Regulatory Compliance</option>
                          <option value="ENTERPRISE">Enterprise Contract Supply</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#344054] mb-1">
                          Estimated Volume / Quantity
                        </label>
                        <input
                          type="text"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="e.g. 500 kg, 2 drums, 10 MT"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                        />
                      </div>
                    </div>

                    {inquiryType === "PRODUCT_INQUIRY" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                        <div>
                          <label className="block text-xs font-bold text-[#344054] mb-1">
                            Chemical Name / Compound
                          </label>
                          <input
                            type="text"
                            value={chemicalName}
                            onChange={(e) => setChemicalName(e.target.value)}
                            placeholder="e.g. Paracetamol, Ethyl Acetate"
                            className="w-full px-3.5 py-2 rounded-lg border border-[#D0D5DD] text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#344054] mb-1">
                            CAS Registry Number
                          </label>
                          <input
                            type="text"
                            value={casNumber}
                            onChange={(e) => setCasNumber(e.target.value)}
                            placeholder="e.g. 103-90-2"
                            className="w-full px-3.5 py-2 rounded-lg border border-[#D0D5DD] text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF] bg-white font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-[#344054] mb-1">
                        Inquiry Details / Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please specify target specifications, delivery destination, packaging preference, or testing certifications required..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#0F172A] focus:outline-none focus:border-[#155EEF]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full py-3 px-6 bg-[#155EEF] hover:bg-[#104EC6] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending Inquiry...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Procurement Inquiry
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
