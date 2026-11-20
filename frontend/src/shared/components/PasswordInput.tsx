"use client";

import { useState, forwardRef, InputHTMLAttributes } from "react";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string | null;
  showIcon?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, showIcon = true, className = "", id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [capsLockActive, setCapsLockActive] = useState(false);

    function handleKeyEvent(e: React.KeyboardEvent<HTMLInputElement>) {
      if (typeof e.getModifierState === "function") {
        setCapsLockActive(e.getModifierState("CapsLock"));
      }
    }

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-[#0F172A]">
            {label}
          </label>
        )}
        <div className="relative">
          {showIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
              <Lock className="w-3.5 h-3.5" />
            </div>
          )}
          <input
            {...props}
            ref={ref}
            id={id}
            type={showPassword ? "text" : "password"}
            onKeyDown={(e) => {
              handleKeyEvent(e);
              props.onKeyDown?.(e);
            }}
            onKeyUp={(e) => {
              handleKeyEvent(e);
              props.onKeyUp?.(e);
            }}
            className={`w-full h-9 rounded-[6px] border ${
              error ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]" : "border-[#E4E4E7] focus:border-[#0052CC] focus:ring-[#0052CC]"
            } ${showIcon ? "pl-8.5" : "pl-3"} pr-9 text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:ring-1 bg-white disabled:bg-[#F4F4F5] ${className}`}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#0F172A] focus:outline-none transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {capsLockActive && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#D97706] pt-0.5">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span>Caps Lock is ON</span>
          </div>
        )}

        {error && (
          <p className="text-[11px] font-medium text-[#DC2626]">{error}</p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
