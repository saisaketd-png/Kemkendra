"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password?: string;
  showRequirements?: boolean;
}

export function PasswordStrengthMeter({
  password = "",
  showRequirements = true,
}: PasswordStrengthMeterProps) {
  const criteria = useMemo(() => {
    return [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "Contains uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
      { label: "Contains lowercase letter (a-z)", met: /[a-z]/.test(password) },
      { label: "Contains number (0-9)", met: /[0-9]/.test(password) },
      { label: "Contains symbol (!@#$%^&*)", met: /[^A-Za-z0-9]/.test(password) },
    ];
  }, [password]);

  const metCount = criteria.filter((c) => c.met).length;

  const strength = useMemo(() => {
    if (!password) return { label: "", color: "bg-[#E4E4E7]", width: "w-0" };
    if (metCount <= 2) return { label: "Weak", color: "bg-[#DC2626]", width: "w-1/4" };
    if (metCount === 3) return { label: "Fair", color: "bg-[#D97706]", width: "w-2/4" };
    if (metCount === 4) return { label: "Good", color: "bg-[#2563EB]", width: "w-3/4" };
    return { label: "Strong", color: "bg-[#059669]", width: "w-full" };
  }, [metCount, password]);

  if (!password) return null;

  return (
    <div className="space-y-2 pt-1 animate-fadeIn">
      {/* Progress Bar & Label */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#64748B]">Password Strength</span>
          <span
            className={`font-semibold ${
              metCount <= 2
                ? "text-[#DC2626]"
                : metCount === 3
                ? "text-[#D97706]"
                : metCount === 4
                ? "text-[#2563EB]"
                : "text-[#059669]"
            }`}
          >
            {strength.label}
          </span>
        </div>
        <div className="h-1.5 w-full bg-[#E4E4E7] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${strength.color} ${strength.width}`}
          />
        </div>
      </div>

      {/* Checklist */}
      {showRequirements && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
          {criteria.map((c, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 text-[10px] transition-colors ${
                c.met ? "text-[#059669] font-medium" : "text-[#94A3B8]"
              }`}
            >
              {c.met ? (
                <Check className="w-3 h-3 flex-shrink-0 text-[#059669]" />
              ) : (
                <X className="w-3 h-3 flex-shrink-0 text-[#CBD5E1]" />
              )}
              <span>{c.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
