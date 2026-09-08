"use client";

import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  ShieldAlert,
  FileCheck,
  Receipt,
  MessageSquare,
  PackagePlus,
} from "lucide-react";
import { PendingActionDto } from "../types/dashboardTypes";

interface PendingActionsCardProps {
  actions: PendingActionDto[];
  loading?: boolean;
}

export function PendingActionsCard({ actions, loading = false }: PendingActionsCardProps) {
  if (loading) {
    return (
      <div className="bg-white border border-[#E4E4E7] rounded-[10px] p-5 space-y-3 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-16 bg-slate-100 rounded-lg"></div>
        <div className="h-16 bg-slate-100 rounded-lg"></div>
      </div>
    );
  }

  if (!actions || actions.length === 0) {
    return (
      <div className="bg-white border border-[#E4E4E7] rounded-[10px] p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E3FCEF] text-[#00875A] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#0F172A]">
              All Operational Tasks Up to Date
            </h3>
            <p className="text-[11px] text-[#64748B]">
              No pending quotation decisions, unconfirmed orders, or overdue items requiring your action.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1] shrink-0">
          CLEAR
        </span>
      </div>
    );
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return {
          bg: "bg-red-50/70 border-red-200",
          iconColor: "text-red-600",
          badge: "bg-red-100 text-red-700 border-red-200",
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-50/70 border-amber-200",
          iconColor: "text-amber-600",
          badge: "bg-amber-100 text-amber-800 border-amber-200",
        };
      default:
        return {
          bg: "bg-blue-50/70 border-blue-200",
          iconColor: "text-[#0052CC]",
          badge: "bg-blue-100 text-[#0052CC] border-blue-200",
        };
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "VERIFICATION":
        return <ShieldAlert className="w-4 h-4" />;
      case "RFQ":
      case "QUOTATION":
        return <FileCheck className="w-4 h-4" />;
      case "INVOICE":
      case "PAYMENT":
        return <Receipt className="w-4 h-4" />;
      case "DISPUTE":
        return <MessageSquare className="w-4 h-4" />;
      case "CATALOG":
        return <PackagePlus className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-[10px] p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <h2 className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight">
            Pending Operational Actions
          </h2>
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          {actions.length} Action{actions.length > 1 ? "s" : ""} Required
        </span>
      </div>

      <div className="space-y-2">
        {actions.map((item) => {
          const style = getSeverityStyle(item.severity);
          return (
            <div
              key={item.id}
              className={`p-3 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${style.bg}`}
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <div className={`mt-0.5 shrink-0 ${style.iconColor}`}>
                  {getActionIcon(item.actionType)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#0F172A]">
                      {item.title}
                    </span>
                    {item.count > 1 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold bg-white text-slate-700 border border-slate-200">
                        {item.count} items
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <Link
                href={item.targetUrl}
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] rounded-[6px] transition-colors shrink-0 shadow-xs"
              >
                <span>{item.ctaText || "Take Action"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
