"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerBuyer, getAuthUser } from "@/features/auth/api/auth";
import { parseApiError } from "@/shared/utils/errorParser";
import { ArrowRight, Mail, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { KemKendraLogo } from "@/shared/components/KemkendraLogo";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { PasswordStrengthMeter } from "@/shared/components/PasswordStrengthMeter";

function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  useEffect(() => {
    const user = getAuthUser();
    if (user) {
      router.replace("/dashboard/buyer");
    }
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!termsAccepted || !privacyAccepted) {
      setError("You must agree to the Terms of Service and acknowledge the Privacy Policy.");
      return;
    }

    try {
      setLoading(true);
      await registerBuyer({
        name,
        email,
        phone: phone.trim() ? phone.trim() : undefined,
        password,
        termsAccepted,
        privacyAccepted,
      });
      // Do NOT auto-login. Require email verification before authenticated access.
      setRegisteredEmail(email);
      try {
        const { trackMarketingEvent } = await import("@/features/analytics/utils/marketingTracker");
        trackMarketingEvent("REG_COMPLETE");
      } catch {}
    } catch (err: unknown) {
      setError(
        parseApiError(
          err,
          "We couldn't create your account right now. Please try again later.",
          "registration"
        )
      );
    } finally {
      setLoading(false);
    }
  }

  // Registration Confirmation / Check Inbox State
  if (registeredEmail) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <KemKendraLogo href="/" size="lg" layout="stacked" subtitle="Account Provisioned" />
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-tactile-card p-6 sm:p-8 text-center space-y-5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-[#0052CC] flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Verify Your Email Address
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                We have sent an activation link to <strong className="text-slate-900 font-mono">{registeredEmail}</strong>. Please check your inbox and click the link to activate your account.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 text-xs text-slate-600 space-y-1 text-left">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Security Policy
              </p>
              <p className="text-xs leading-relaxed text-slate-500">
                Institutional verification ensures that all procurement quotes and orders are handled with authorized personnel.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Link
                href="/login"
                className="w-full sm:w-auto h-10 px-5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98]"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <KemKendraLogo
            href="/"
            size="lg"
            layout="stacked"
            subtitle="Buyer Procurement Account"
          />
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-tactile-card p-6 sm:p-8 space-y-5">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Create Buyer Account
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Source verified raw materials, request quotations, and track chemical procurement orders.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 flex items-start gap-2">
              <span className="font-bold shrink-0">ERROR:</span>
              <span className="text-xs text-rose-600">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full h-10 rounded-lg border border-slate-300 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 bg-white disabled:bg-slate-100 shadow-2xs"
                  placeholder="e.g. Dr. Aris Thorne"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full h-10 rounded-lg border border-slate-300 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 bg-white disabled:bg-slate-100 shadow-2xs"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="phone"
                className="block text-xs font-semibold text-slate-700"
              >
                Direct Phone (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className="w-full h-10 rounded-lg border border-slate-300 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 bg-white disabled:bg-slate-100 shadow-2xs"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Password <span className="text-rose-500">*</span>
                </label>
                <PasswordInput
                  id="password"
                  required
                  showIcon={false}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Min. 8 characters"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <PasswordInput
                  id="confirmPassword"
                  required
                  showIcon={false}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Repeat password"
                />
                {confirmPassword.length > 0 && (
                  <div className={`flex items-center gap-1 text-[11px] font-medium pt-0.5 ${
                    password === confirmPassword ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                        <span>Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Password Strength Meter */}
            <PasswordStrengthMeter password={password} />

            {/* Terms of Service and Privacy Policy Required Checkboxes */}
            <div className="pt-2 pb-1 space-y-2.5 border-t border-slate-100">
              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={loading}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
                />
                <span>
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="font-bold text-[#0052CC] hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  <span className="text-rose-500">*</span>
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  disabled={loading}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
                />
                <span>
                  I acknowledge the{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="font-bold text-[#0052CC] hover:underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  <span className="text-rose-500">*</span>
                </span>
              </label>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading || !termsAccepted || !privacyAccepted}
                className="w-full h-10 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-xs font-bold text-white transition-colors duration-150 shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Buyer Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Supplier Onboarding Callout */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/80 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-4 sm:p-5 rounded-b-2xl border-t border-slate-100">
            <div>
              <p className="font-bold text-slate-900">
                Chemical manufacturer or distributor?
              </p>
              <p className="text-xs text-slate-500">
                Register to list catalog monographs and receive commercial RFQs.
              </p>
            </div>
            <Link
              href="/register/supplier"
              className="shrink-0 h-9 px-4 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center shadow-2xs active:scale-[0.98]"
            >
              Supplier Registration →
            </Link>
          </div>
        </div>

        {/* Existing user login link */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#0052CC] hover:underline">
            Sign In here
          </Link>
        </p>

      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#0052CC] border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
