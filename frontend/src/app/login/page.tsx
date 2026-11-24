"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, getAuthUser, setAuthToken } from "@/features/auth/api/auth";
import { authenticatedFetch } from "@/features/auth/api/authenticatedFetch";
import { Lock, Mail, ShieldAlert, ArrowRight } from "lucide-react";
import { KemKendraLogo } from "@/shared/components/KemkendraLogo";
import { PasswordInput } from "@/shared/components/PasswordInput";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getAuthUser();
    if (user) {
      if (redirectParam && redirectParam.startsWith("/")) {
        router.push(redirectParam);
      } else if (user.role === "ADMIN") {
        router.push("/dashboard/admin");
      } else if (user.role === "SUPPLIER") {
        router.push("/dashboard/supplier");
      } else {
        router.push("/products");
      }
    }
  }, [router, redirectParam]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const response = await login({
        email,
        password,
      });

      setAuthToken(response.token);
      window.dispatchEvent(new Event("auth-changed"));

      if (response.message && response.message.toLowerCase().includes("suspended")) {
        router.push("/dashboard/account-review");
        return;
      }

      const user = getAuthUser();

      if (redirectParam && redirectParam.startsWith("/")) {
        router.push(redirectParam);
      } else if (user && user.role === "ADMIN") {
        router.push("/dashboard/admin");
      } else if (user && user.role === "SUPPLIER") {
        try {
          const profileRes = await authenticatedFetch("/api/v1/supplier/profile");
          if (profileRes.ok) {
            const profile = await profileRes.json();
            if (profile.verificationStatus === "DRAFT" && (!profile.registeredAddress || !profile.legalName)) {
              router.push("/dashboard/supplier/onboarding");
              return;
            }
          }
        } catch {}
        router.push("/dashboard/supplier");
      } else {
        router.push("/products");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to authenticate credentials. Please verify your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  const isExpired = searchParams.get("expired") === "true" || searchParams.get("session_expired") === "true";

  return (
    <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8 space-y-2">
          <KemKendraLogo
            href="/"
            size="lg"
            layout="stacked"
            subtitle="Enterprise Chemical Sourcing Desk"
          />
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-tactile-card p-6 sm:p-8 space-y-5">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Sign In to KemKendra
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your corporate credentials to access your procurement desk.
            </p>
          </div>

          {/* Session Expiration Notice */}
          {isExpired && !error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Your session has expired. Please sign in again to continue.</span>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Authentication Failure</span>
                <p className="text-xs text-rose-600">{error}</p>
                {error.toLowerCase().includes("verify your email") && (
                  <Link
                    href="/verify-email"
                    className="inline-block mt-1.5 font-bold text-[#0052CC] hover:underline"
                  >
                    Resend verification link →
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700"
              >
                Corporate Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading}
                  className="w-full h-10 rounded-lg border border-slate-300 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 bg-white disabled:bg-slate-100 shadow-2xs"
                  placeholder="procurement@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#0052CC] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-xs font-bold text-white transition-colors duration-150 shadow-2xs disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] mt-2 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Registration Options */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-center text-xs">
            <p className="text-slate-600">
              New to KemKendra?{" "}
              <Link href="/register" className="font-bold text-[#0052CC] hover:underline">
                Create Buyer Account
              </Link>
            </p>
            <p className="text-slate-500 text-xs">
              Chemical manufacturer?{" "}
              <Link href="/register/supplier" className="font-bold text-[#0052CC] hover:underline">
                Register as Verified Supplier
              </Link>
            </p>
          </div>
        </div>

        {/* Security Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Institutional Chemical Marketplace · TLS 1.3 Encryption
        </p>

      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#0052CC] border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}