"use client";

import React from "react";

interface ChemicalLoadingIndicatorProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function ChemicalLoadingIndicator({
  title = "Loading Chemical Catalog...",
  subtitle = "Fetching verified supplier offerings, technical specifications, and batch records.",
  className = "min-h-[480px]",
}: ChemicalLoadingIndicatorProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center select-none ${className}`}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200/90 shadow-tactile-card p-8 space-y-5 flex flex-col items-center">
        {/* Clean Chemical Ring Icon with Minimal Spinner */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-[#0052CC]">
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Minimal 2D Benzene Ring with Inner Resonance */}
              <polygon points="12,2.5 20.2,7.2 20.2,16.8 12,21.5 3.8,16.8 3.8,7.2" />
              <circle cx="12" cy="12" r="3.75" strokeWidth="1.25" strokeDasharray="2.5 2.5" />
            </svg>
          </div>
          {/* Subtle spinning accent ring */}
          <div
            className="absolute -inset-1 rounded-2xl border-2 border-transparent border-t-[#0052CC] border-r-[#0052CC]/50 animate-spin"
            style={{ animationDuration: "1.2s" }}
          />
        </div>

        {/* Clean Typography */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Minimal Progress Line */}
        <div className="w-44 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#0052CC] rounded-full w-2/5 animate-fluid-progress" />
        </div>
      </div>
    </div>
  );
}
