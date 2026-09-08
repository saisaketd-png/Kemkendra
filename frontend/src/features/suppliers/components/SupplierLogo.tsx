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

export function SupplierLogo({
  src,
  alt,
  fallbackText,
  className = "w-full h-full object-contain",
  iconClassName = "w-6 h-6 text-[#94A3B8]",
}: SupplierLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    if (fallbackText) {
      return (
        <div className="w-full h-full bg-[#EFF4FF] text-[#155EEF] font-bold text-2xl sm:text-3xl flex items-center justify-center select-none">
          {fallbackText.charAt(0).toUpperCase()}
        </div>
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center">
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
