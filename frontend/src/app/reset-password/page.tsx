"use client";

import { FormEvent, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/features/auth/api/auth";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ShieldAlert, KeyRound } from "lucide-react";
import { KemKendraLogo } from "@/shared/components/KemkendraLogo";
import { PasswordStrengthMeter } from "@/shared/components/PasswordStrengthMeter";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing or invalid password reset token. Please request a new reset link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password.length > 128) {
      setError("Password must not exceed 128 characters.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to reset password. The link may have expired or already been used.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Missing token guard
  if (!token && !success) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-tactile-card p-6 sm:p-8 space-y-6 text-center">
        <div className="w-12 h-12 bg-amber-50 border border-amber-200/80 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-2xs">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Invalid Reset Link
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            This password reset link is invalid or incomplete. Please initiate a new password reset request.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] px-5 py-2.5 text-xs font-bold text-white transition-colors shadow-2xs cursor-pointer"
          >
            <span>Request New Reset Link</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-tactile-card p-6 sm:p-8 space-y-6">
      {!success ? (
        <>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Create New Password
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your new password must be at least 8 characters long.
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 flex items-start gap-2.5 shadow-2xs">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Reset Failed</span>
                <p className="text-xs font-normal text-rose-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="new-password"
                className="block text-xs font-semibold text-slate-700"
              >
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  className="w-full h-10 rounded-lg border border-slate-300 pl-9 pr-9 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 bg-white disabled:bg-slate-100 shadow-2xs"
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="block text-xs font-semibold text-slate-700"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={loading}
                  className="w-full h-10 rounded-lg border border-slate-300 pl-9 pr-9 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20 bg-white disabled:bg-slate-100 shadow-2xs"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            {/* Password Strength Meter & Live Match Indicator */}
            {password && (
              <div className="space-y-2 pt-1">
                <PasswordStrengthMeter password={password} />
                {confirmPassword && (
                  <p className={password === confirmPassword ? "text-emerald-600 flex items-center gap-1.5 text-[11px] font-medium" : "text-rose-500 flex items-center gap-1.5 text-[11px] font-medium"}>
                    <span className={`w-1.5 h-1.5 rounded-full ${password === confirmPassword ? "bg-emerald-500" : "bg-rose-500"}`} />
                    {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || password.length < 8 || password !== confirmPassword}
              className="w-full h-10 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] px-4 text-xs font-bold text-white transition-colors duration-150 shadow-2xs disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <span>Reset & Save Password</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        /* Success State */
        <div className="space-y-5 py-2 text-center">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200/80 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Password Reset Complete
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your password has been updated securely. You can now sign in to your KemKendra workspace with your new password.
            </p>
          </div>

          <div className="pt-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] px-6 py-2.5 text-xs font-bold text-white transition-colors shadow-2xs w-full cursor-pointer"
            >
              <span>Sign In to KemKendra</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Navigation Back */}
      <div className="pt-5 border-t border-slate-100 text-center text-xs">
        <Link
          href="/login"
          className="font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <KemKendraLogo
            href="/"
            size="xl"
            subtitle="Enterprise Chemical & Pharmaceutical Marketplace"
          />
        </div>

        <Suspense fallback={
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-tactile-card p-8 flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-3 border-[#0052CC] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        {/* Security Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          Institutional Chemical Marketplace · TLS 1.3 Encryption
        </p>
      </div>
    </main>
  );
}
