"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export interface KemKendraLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark" | "monochrome";
  layout?: "horizontal" | "stacked" | "auto";
  showWordmark?: boolean;
  subtitle?: string;
  href?: string;
  onClick?: () => void;
}

export type KemkendraLogoProps = KemKendraLogoProps;

export function KemKendraLogoMark({
  className = "w-9 h-9",
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark" | "monochrome";
}) {
  const isDark = variant === "dark";
  const iconSrc = isDark ? "/kemkendra-icon-dark.png" : "/kemkendra-icon.png";

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden ${className}`}>
      <Image
        src={iconSrc}
        alt="KemKendra Icon"
        width={128}
        height={128}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}

export const KemkendraLogoMark = KemKendraLogoMark;

export function KemKendraLogo({
  className = "",
  size = "md",
  variant = "light",
  layout = "horizontal",
  showWordmark = true,
  subtitle,
  href,
  onClick,
}: KemKendraLogoProps) {
  const isDark = variant === "dark";

  // Height configurations optimized for crisp display in all navbars and cards
  const heightClasses = {
    xs: "h-6 sm:h-7",
    sm: "h-7 sm:h-8.5",
    md: "h-8 sm:h-10",
    lg: "h-11 sm:h-13",
    xl: "h-14 sm:h-18",
  };

  const imageDimensions = {
    xs: { width: 140, height: 28 },
    sm: { width: 180, height: 36 },
    md: { width: 220, height: 44 },
    lg: { width: 260, height: 52 },
    xl: { width: 340, height: 72 },
  };

  const currentHeightClass = heightClasses[size] || heightClasses.md;
  const { width, height } = imageDimensions[size] || imageDimensions.md;

  // Select appropriate source asset (horizontal is preferred in navbars, stacked in heroes/cards)
  const isHorizontal = layout === "horizontal" || (layout === "auto" && showWordmark);
  const logoSrc = isDark
    ? isHorizontal
      ? "/kemkendra-logo-horizontal-dark.webp"
      : "/kemkendra-logo-dark.webp"
    : isHorizontal
    ? "/kemkendra-logo-horizontal.webp"
    : "/kemkendra-logo.webp";

  const content = (
    <div
      className={`inline-flex items-center gap-2 group select-none ${href ? "" : className}`}
      onClick={onClick}
    >
      <div className={`relative ${currentHeightClass} flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.02]`}>
        <Image
          src={logoSrc}
          alt="KEMKENDRA Chemical Trading Marketplace"
          width={width}
          height={height}
          className="h-full w-auto object-contain"
          priority
        />
      </div>

      {subtitle && (
        <div className={`hidden sm:flex flex-col justify-center border-l ${isDark ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-500"} pl-2 ml-0.5`}>
          <span className="text-[9px] font-bold uppercase tracking-widest leading-none">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0052CC] rounded-lg inline-flex items-center shrink-0 ${className}`}
      >
        {content}
      </Link>
    );
  }

  return content;
}

export const KemkendraLogo = KemKendraLogo;
