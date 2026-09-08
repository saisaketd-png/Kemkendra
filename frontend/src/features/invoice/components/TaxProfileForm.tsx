"use client";

import React, { useState, useEffect } from "react";
import { BusinessTaxProfile, GstRegistrationType } from "../types/invoice";
import { getMyTaxProfile, updateMyTaxProfile } from "../api/invoice";

const INDIAN_STATES = [
  { code: "01", name: "Jammu and Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "38", name: "Ladakh" },
  { code: "97", name: "Other Territory" },
];

export function TaxProfileForm() {
  const [profile, setProfile] = useState<Partial<BusinessTaxProfile>>({
    legalBusinessName: "",
    tradeName: "",
    gstin: "",
    isGstRegistered: false,
    gstRegistrationType: "UNREGISTERED",
    panNumber: "",
    registeredAddress: "",
    city: "",
    state: "Maharashtra",
    stateCode: "27",
    postalCode: "",
    country: "India",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const data = await getMyTaxProfile();
      if (data && data.legalBusinessName) {
        setProfile(data);
      }
    } catch (err: any) {
      // Profile may not exist yet, leave defaults
    } finally {
      setLoading(false);
    }
  }

  function handleGstinChange(val: string) {
    const gstin = val.toUpperCase().trim();
    let updatedState = profile.state;
    let updatedCode = profile.stateCode;

    if (gstin.length >= 2) {
      const code = gstin.substring(0, 2);
      const match = INDIAN_STATES.find((s) => s.code === code);
      if (match) {
        updatedCode = match.code;
        updatedState = match.name;
      }
    }

    setProfile((prev) => ({
      ...prev,
      gstin,
      isGstRegistered: gstin.length > 0,
      gstRegistrationType: gstin.length > 0 ? "REGISTERED_REGULAR" : "UNREGISTERED",
      stateCode: updatedCode,
      state: updatedState,
    }));
  }

  function handleStateChange(code: string) {
    const match = INDIAN_STATES.find((s) => s.code === code);
    setProfile((prev) => ({
      ...prev,
      stateCode: code,
      state: match ? match.name : prev.state || "",
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const saved = await updateMyTaxProfile(profile);
      setProfile(saved);
      setSuccessMessage("Business Tax Profile and GSTIN saved successfully.");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save tax profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
        <p className="text-sm">Loading tax profile...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Legal Business Name *
          </label>
          <input
            type="text"
            required
            value={profile.legalBusinessName || ""}
            onChange={(e) => setProfile({ ...profile, legalBusinessName: e.target.value })}
            placeholder="e.g. Apex Chemical Industries Private Limited"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Trade Name / Brand
          </label>
          <input
            type="text"
            value={profile.tradeName || ""}
            onChange={(e) => setProfile({ ...profile, tradeName: e.target.value })}
            placeholder="e.g. Apex Chemicals"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            GSTIN (15 Digits)
          </label>
          <input
            type="text"
            maxLength={15}
            value={profile.gstin || ""}
            onChange={(e) => handleGstinChange(e.target.value)}
            placeholder="e.g. 27AAAAA0000A1Z5"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
          />
          <p className="text-[11px] text-slate-500 mt-1">Leave empty if unregistered.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            GST Registration Type
          </label>
          <select
            value={profile.gstRegistrationType || "UNREGISTERED"}
            onChange={(e) =>
              setProfile({ ...profile, gstRegistrationType: e.target.value as GstRegistrationType })
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
          >
            <option value="REGISTERED_REGULAR">Registered - Regular</option>
            <option value="REGISTERED_COMPOSITION">Registered - Composition</option>
            <option value="UNREGISTERED">Unregistered Business</option>
            <option value="CONSUMER">Consumer</option>
            <option value="SPECIAL_ECONOMIC_ZONE">Special Economic Zone (SEZ)</option>
            <option value="DEEMED_EXPORT">Deemed Export</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            PAN Number (10 Digits)
          </label>
          <input
            type="text"
            maxLength={10}
            value={profile.panNumber || ""}
            onChange={(e) => setProfile({ ...profile, panNumber: e.target.value.toUpperCase().trim() })}
            placeholder="e.g. AAAAA0000A"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
          Registered Business Address *
        </label>
        <textarea
          required
          rows={3}
          value={profile.registeredAddress || ""}
          onChange={(e) => setProfile({ ...profile, registeredAddress: e.target.value })}
          placeholder="Plot No., Industrial Area, Street Address"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            City *
          </label>
          <input
            type="text"
            required
            value={profile.city || ""}
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            placeholder="e.g. Mumbai"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            State *
          </label>
          <select
            value={profile.stateCode || "27"}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
          >
            {INDIAN_STATES.map((st) => (
              <option key={st.code} value={st.code}>
                {st.name} ({st.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            State Code
          </label>
          <input
            type="text"
            readOnly
            value={profile.stateCode || ""}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-mono cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Postal / PIN Code *
          </label>
          <input
            type="text"
            required
            maxLength={10}
            value={profile.postalCode || ""}
            onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
            placeholder="e.g. 400001"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.98] text-white font-medium text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {saving ? "Saving Profile..." : "Save Business Tax Profile"}
        </button>
      </div>
    </form>
  );
}
