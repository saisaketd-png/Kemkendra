"use client";

import React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Building2,
  FileText,
  Package,
  Receipt,
  Upload,
  UserCheck,
  FilePlus,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

interface QuickActionsBarProps {
  role: "BUYER" | "SUPPLIER";
}

export function QuickActionsBar({ role }: QuickActionsBarProps) {
  if (role === "SUPPLIER") {
    const supplierActions = [
      {
        label: "Add Product Offering",
        href: "/dashboard/supplier/products/new",
        icon: Plus,
        primary: true,
      },
      {
        label: "View Incoming RFQs",
        href: "/dashboard/supplier/rfqs",
        icon: FileText,
      },
      {
        label: "Fulfill Orders",
        href: "/dashboard/supplier/orders",
        icon: Package,
      },
      {
        label: "Manage Invoices",
        href: "/dashboard/supplier/invoices",
        icon: Receipt,
      },
      {
        label: "Compliance Documents",
        href: "/dashboard/supplier/documents",
        icon: Upload,
      },
      {
        label: "Update Profile",
        href: "/dashboard/supplier/profile",
        icon: UserCheck,
      },
    ];

    return (
      <div className="bg-white border border-[#E4E4E7] rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 border-b border-[#F1F5F9] pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Supplier Operations Shortcuts
          </span>
          <span className="text-xs text-slate-400">Direct Actions</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {supplierActions.map((act) => {
            const Icon = act.icon;
            return (
              <Link
                key={act.label}
                href={act.href}
                className={`p-2.5 rounded-lg text-xs font-medium flex flex-col items-center justify-center text-center gap-1.5 transition-all border ${
                  act.primary
                    ? "bg-[#0052CC] text-white border-[#0052CC] hover:bg-[#0747A6] shadow-2xs"
                    : "bg-[#FAFAFA] hover:bg-white text-[#0F172A] border-[#E4E4E7] hover:border-[#0052CC]/40"
                }`}
              >
                <Icon className={`w-4 h-4 ${act.primary ? "text-white" : "text-[#0052CC]"}`} />
                <span className="text-xs leading-tight font-semibold">{act.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Buyer actions
  const buyerActions = [
    {
      label: "Create Sourcing RFQ",
      href: "/rfq",
      icon: Plus,
      primary: true,
    },
    {
      label: "Browse Products",
      href: "/products",
      icon: Search,
    },
    {
      label: "Browse Suppliers",
      href: "/suppliers",
      icon: Building2,
    },
    {
      label: "View Quotations",
      href: "/dashboard/rfqs",
      icon: FileText,
    },
    {
      label: "Track Orders",
      href: "/dashboard/orders",
      icon: Package,
    },
    {
      label: "View Invoices",
      href: "/dashboard/buyer/invoices",
      icon: Receipt,
    },
  ];

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3 border-b border-[#F1F5F9] pb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Procurement Quick Actions
        </span>
        <span className="text-xs text-slate-400">Direct Shortcuts</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {buyerActions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.label}
              href={act.href}
              className={`p-2.5 rounded-lg text-xs font-medium flex flex-col items-center justify-center text-center gap-1.5 transition-all border ${
                act.primary
                  ? "bg-[#0052CC] text-white border-[#0052CC] hover:bg-[#0747A6] shadow-2xs"
                  : "bg-[#FAFAFA] hover:bg-white text-[#0F172A] border-[#E4E4E7] hover:border-[#0052CC]/40"
              }`}
            >
              <Icon className={`w-4 h-4 ${act.primary ? "text-white" : "text-[#0052CC]"}`} />
              <span className="text-xs leading-tight font-semibold">{act.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
