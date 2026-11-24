"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  getCurrentUserProfile,
  updateUserProfile,
  changePassword,
  UserProfile,
} from "@/features/auth/api/auth";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/features/notifications/api/notifications";
import {
  NotificationPreferenceItem,
} from "@/features/notifications/types/notification";
import { PageHeader } from "@/shared/components/ui/KemkendraUI";
import {
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Save,
  ShieldCheck,
  Bell,
  Check,
  Receipt,
} from "lucide-react";
import { TaxProfileForm } from "@/features/invoice/components/TaxProfileForm";

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Profile Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification Preferences State
  const [preferences, setPreferences] = useState<NotificationPreferenceItem[]>([]);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);
  const [prefError, setPrefError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingProfile(true);
        setProfileError(null);
        const data = await getCurrentUserProfile();
        setProfile(data);
        setName(data.name || "");
        setPhone(data.phone || "");
      } catch (err: unknown) {
        if (err instanceof Error) {
          setProfileError(err.message);
        } else {
          setProfileError("Failed to load user profile information.");
        }
      } finally {
        setLoadingProfile(false);
      }

      try {
        setLoadingPreferences(true);
        setPrefError(null);
        const prefData = await getNotificationPreferences();
        setPreferences(prefData.preferences || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setPrefError(err.message);
        } else {
          setPrefError("Failed to load notification preferences.");
        }
      } finally {
        setLoadingPreferences(false);
      }
    }

    loadData();
  }, []);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    if (!name.trim()) {
      setProfileError("Full Name cannot be empty.");
      return;
    }

    try {
      setSavingProfile(true);
      const updated = await updateUserProfile({
        name: name.trim(),
        phone: phone.trim() ? phone.trim() : undefined,
      });
      setProfile(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setProfileError(err.message);
      } else {
        setProfileError("Failed to update profile settings.");
      }
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      setSavingPassword(true);
      await changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPasswordError(err.message);
      } else {
        setPasswordError("Failed to update password. Please check your current password.");
      }
    } finally {
      setSavingPassword(false);
    }
  }

  const togglePreference = (category: string, channel: "inApp" | "email") => {
    setPreferences((prev) =>
      prev.map((item) => {
        if (item.category === category) {
          if (item.mandatory) return item; // Cannot modify mandatory categories
          return {
            ...item,
            inAppEnabled: channel === "inApp" ? !item.inAppEnabled : item.inAppEnabled,
            emailEnabled: channel === "email" ? !item.emailEnabled : item.emailEnabled,
          };
        }
        return item;
      })
    );
  };

  async function handlePreferencesSubmit(e: FormEvent) {
    e.preventDefault();
    setPrefError(null);
    setPrefSuccess(false);

    try {
      setSavingPreferences(true);
      const req = {
        preferences: preferences.map((p) => ({
          category: p.category,
          inAppEnabled: p.inAppEnabled,
          emailEnabled: p.emailEnabled,
        })),
      };
      const res = await updateNotificationPreferences(req);
      setPreferences(res.preferences || []);
      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPrefError(err.message);
      } else {
        setPrefError("Failed to update notification preferences.");
      }
    } finally {
      setSavingPreferences(false);
    }
  }

  const formatCategoryLabel = (category: string) => {
    switch (category) {
      case "SECURITY":
        return "Security & Authentication";
      case "ACCOUNT":
        return "Account & Terms";
      case "SUPPLIER_VERIFICATION":
        return "Supplier Verification";
      case "RFQ":
        return "RFQ Activity";
      case "QUOTATION":
        return "Quotation Activity";
      case "PURCHASE_ORDER":
        return "Purchase Orders";
      case "SHIPMENT":
        return "Shipments & Logistics";
      case "INVOICE":
        return "Invoices & Billing";
      case "PAYMENT":
        return "Payment Confirmations";
      case "DISPUTE":
        return "Dispute Resolution";
      case "CATALOG":
        return "Catalog & Offerings";
      case "GOVERNANCE":
        return "Governance & Appeals";
      case "SYSTEM":
        return "System & Platform";
      default:
        return category.replace(/_/g, " ");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 text-[#0F172A]">
      <PageHeader
        title="Account Settings"
        description="Manage your verified profile details, configure granular notification channels, and update access credentials."
      />

      {/* 1. PROFILE DETAILS CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-tactile-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-[#F8F9FA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052CC] border border-blue-200 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#091E42]">Personal & Authorized Contact</h2>
              <p className="text-xs text-[#64748B]">Update your commercial display name and authorized contact number</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="p-5 sm:p-6 space-y-5">
          {profileSuccess && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile information updated successfully.</span>
            </div>
          )}

          {profileError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-center gap-2.5 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email (Read Only) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#334155]">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ""}
                  className="w-full h-9 rounded-lg border border-slate-200 pl-9 pr-3 text-xs text-[#64748B] bg-slate-100 cursor-not-allowed outline-none shadow-2xs"
                />
              </div>
              <p className="text-[11px] text-[#94A3B8]">Email address cannot be modified once registered.</p>
            </div>

            {/* Account Role & Verification */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#334155]">
                Account Role & Verification
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="w-full h-9 rounded-lg border border-slate-200 pl-9 pr-3 text-xs text-[#0F172A] bg-slate-100 flex items-center justify-between shadow-2xs">
                  <span className="font-semibold">{profile?.role || "USER"}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="block text-xs font-semibold text-[#334155]">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loadingProfile || savingProfile}
                  className="w-full h-9 rounded-lg border border-slate-300 pl-9 pr-3 text-xs text-[#0F172A] placeholder:text-slate-400 outline-none transition focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 bg-white shadow-2xs"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label htmlFor="phone" className="block text-xs font-semibold text-[#334155]">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loadingProfile || savingProfile}
                  className="w-full h-9 rounded-lg border border-slate-300 pl-9 pr-3 text-xs text-[#0F172A] placeholder:text-slate-400 outline-none transition focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 bg-white shadow-2xs"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loadingProfile || savingProfile}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#0052CC] text-xs font-semibold text-white transition hover:bg-[#0747A6] active:bg-[#003884] shadow-xs disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer press-tactile"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingProfile ? "Saving..." : "Save Details"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. NOTIFICATION PREFERENCES CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-tactile-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-[#F8F9FA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052CC] border border-blue-200 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#091E42]">Notification Preferences</h2>
              <p className="text-xs text-[#64748B]">Configure which channels you receive notifications for across commercial and administrative workflows.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePreferencesSubmit} className="p-5 sm:p-6 space-y-5">
          {prefSuccess && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Notification preferences updated successfully.</span>
            </div>
          )}

          {prefError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-center gap-2.5 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{prefError}</span>
            </div>
          )}

          {loadingPreferences ? (
            <div className="py-6 text-center text-xs text-[#64748B]">Loading communication preferences...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {preferences.map((item) => (
                <div
                  key={item.category}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#0F172A]">
                        {formatCategoryLabel(item.category)}
                      </span>
                      {item.mandatory && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Lock className="w-2.5 h-2.5" /> Mandatory
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      {item.mandatory
                        ? "Critical security and account-integrity notifications cannot be disabled."
                        : `Receive updates for ${formatCategoryLabel(item.category).toLowerCase()}.`}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* In-App Toggle */}
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[#0F172A]">
                      <input
                        type="checkbox"
                        checked={item.inAppEnabled}
                        disabled={item.mandatory || savingPreferences}
                        onChange={() => togglePreference(item.category, "inApp")}
                        className="rounded border-slate-300 text-[#0052CC] focus:ring-[#0052CC] disabled:opacity-50 cursor-pointer"
                      />
                      <span>In-App</span>
                    </label>

                    {/* Email Toggle */}
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[#0F172A]">
                      <input
                        type="checkbox"
                        checked={item.emailEnabled}
                        disabled={item.mandatory || savingPreferences}
                        onChange={() => togglePreference(item.category, "email")}
                        className="rounded border-slate-300 text-[#0052CC] focus:ring-[#0052CC] disabled:opacity-50 cursor-pointer"
                      />
                      <span>Email</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loadingPreferences || savingPreferences}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#0052CC] text-xs font-semibold text-white transition hover:bg-[#0747A6] active:bg-[#003884] shadow-xs disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer press-tactile"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingPreferences ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. CHANGE PASSWORD CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-tactile-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-[#F8F9FA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#091E42]">Change Password</h2>
              <p className="text-xs text-[#64748B]">Ensure your account is protected with a strong, distinct password.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="p-5 sm:p-6 space-y-5">
          {passwordSuccess && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your password has been changed successfully.</span>
            </div>
          )}

          {passwordError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-center gap-2.5 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="space-y-3.5 max-w-lg">
            {/* Current Password */}
            <div className="space-y-1">
              <label htmlFor="currentPassword" className="block text-xs font-semibold text-[#334155]">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={savingPassword}
                  className="w-full h-9 rounded-lg border border-slate-300 pl-9 pr-9 text-xs text-[#0F172A] placeholder:text-slate-400 outline-none transition focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 bg-white shadow-2xs"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label htmlFor="newPassword" className="block text-xs font-semibold text-[#334155]">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={savingPassword}
                  className="w-full h-9 rounded-lg border border-slate-300 pl-9 pr-9 text-xs text-[#0F172A] placeholder:text-slate-400 outline-none transition focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 bg-white shadow-2xs"
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#334155]">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <input
                  id="confirmPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={savingPassword}
                  className="w-full h-9 rounded-lg border border-slate-300 pl-9 pr-9 text-xs text-[#0F172A] placeholder:text-slate-400 outline-none transition focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 bg-white shadow-2xs"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            {/* Password Validation Requirements */}
            {newPassword && (
              <div className="text-[11px] space-y-1 pt-1">
                <p className={newPassword.length >= 8 ? "text-emerald-700 flex items-center gap-1.5" : "text-slate-400 flex items-center gap-1.5"}>
                  <span className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? "bg-emerald-600" : "bg-slate-300"}`} />
                  At least 8 characters
                </p>
                {confirmPassword && (
                  <p className={newPassword === confirmPassword ? "text-emerald-700 flex items-center gap-1.5" : "text-red-600 flex items-center gap-1.5"}>
                    <span className={`w-1.5 h-1.5 rounded-full ${newPassword === confirmPassword ? "bg-emerald-600" : "bg-red-500"}`} />
                    {newPassword === confirmPassword ? "Passwords match" : "Passwords do not match"}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={
                savingPassword ||
                !currentPassword ||
                newPassword.length < 8 ||
                newPassword !== confirmPassword
              }
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#0052CC] text-xs font-semibold text-white transition hover:bg-[#0747A6] active:bg-[#003884] shadow-xs disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer press-tactile"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{savingPassword ? "Updating..." : "Update Password"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Business Tax Profile & GSTIN Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-tactile-card space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#091E42]">
            <Receipt className="w-4 h-4 text-[#0052CC]" />
            <span>Business Tax Profile & GSTIN</span>
          </div>
          <p className="mt-1 text-xs text-[#64748B]">
            Configure legal business details, GSTIN, PAN, and registered address used to generate immutable snapshots on B2B tax invoices.
          </p>
        </div>
        <div className="pt-2">
          <TaxProfileForm />
        </div>
      </div>
    </div>
  );
}
