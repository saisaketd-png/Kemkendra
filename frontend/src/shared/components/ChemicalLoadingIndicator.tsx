"use client";

import React from "react";
import Image from "next/image";

interface ChemicalLoadingIndicatorProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function ChemicalLoadingIndicator({
  title = "Loading KemKendra Marketplace...",
  subtitle = "Fetching verified supplier offerings, technical specifications, and batch records.",
  className = "min-h-[480px]",
}: ChemicalLoadingIndicatorProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center select-none ${className}`}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200/90 shadow-tactile-card p-8 space-y-6 flex flex-col items-center relative overflow-hidden">
        
        {/* Subtle Top Edge Progress Track */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-[#0052CC] to-transparent w-2/5 animate-fluid-progress" />
        </div>

        {/* Official KemKendra Brand Emblem with Soft Ambient Glow (No Awkward Spinning Ring) */}
        <div className="relative flex items-center justify-center pt-1">
          {/* Soft ambient diffused glow */}
          <div
            className="absolute -inset-3 bg-gradient-to-tr from-blue-500/15 via-indigo-500/10 to-teal-500/15 rounded-3xl blur-xl animate-pulse"
            style={{ animationDuration: "3s" }}
          />

          {/* Central Logo Container */}
          <div className="relative w-16 h-16 rounded-2xl bg-white border border-slate-200/90 p-2.5 flex items-center justify-center shadow-2xs">
            <Image
              src="/kemkendra-icon.webp"
              alt="KemKendra Chemical Marketplace"
              width={64}
              height={64}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        {/* Live Status Telemetry Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-mono text-slate-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0052CC] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0052CC]"></span>
          </span>
          <span className="font-semibold text-slate-700">Verifying Specifications</span>
        </div>

        {/* Clean Institutional Typography */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-black text-[#091E42] tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Minimal Fluid Progress Line */}
        <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#0052CC] to-blue-500 rounded-full w-2/5 animate-fluid-progress" />
        </div>
      </div>
    </div>
  );
}
