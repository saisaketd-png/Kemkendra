"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

interface SupplierLogoProps {
  src?: string | null;
  alt: string;
  fallbackText?: string;
  className?: string;
  iconClassName?: string;
}

function getCorporateMonogram(name?: string): string {
  if (!name || !name.trim()) return "SP";

  // Clean out common corporate suffixes
  const cleaned = name
    .replace(/\b(Pvt|Private|Ltd|Limited|LLC|Inc|Corporation|Corp|GmbH|Co)\b\.?/gi, "")
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (name.charAt(0) || "S").toUpperCase();
}

export function SupplierLogo({
  src,
  alt,
  fallbackText,
  className = "w-full h-full object-contain",
  iconClassName = "w-6 h-6 text-white/80",
}: SupplierLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    if (fallbackText) {
      const monogram = getCorporateMonogram(fallbackText);
      return (
        <div
          className="w-full h-full bg-gradient-to-br from-[#091E42] via-[#0052CC] to-[#0747A6] text-white font-bold flex flex-col items-center justify-center select-none shadow-2xs p-1"
          title={fallbackText}
        >
          <span className="font-mono text-sm sm:text-base md:text-lg tracking-wider font-extrabold leading-none">
            {monogram}
          </span>
          <span className="text-[8px] font-mono tracking-widest text-blue-200 uppercase mt-0.5 opacity-90 scale-90">
            Verified
          </span>
        </div>
      );
    }
    return (
      <div className="w-full h-full bg-[#F4F5F7] text-[#64748B] flex items-center justify-center">
        <Building2 className={iconClassName} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}
