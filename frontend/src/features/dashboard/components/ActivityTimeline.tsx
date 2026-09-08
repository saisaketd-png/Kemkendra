"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Package,
  Receipt,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { DashboardActivityItemDto } from "../types/dashboardTypes";

interface ActivityTimelineProps {
  activities: DashboardActivityItemDto[];
  loading?: boolean;
}

export function ActivityTimeline({ activities, loading = false }: ActivityTimelineProps) {
  if (loading) {
    return (
      <div className="bg-white border border-[#E4E4E7] rounded-[10px] p-5 space-y-4 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-7 h-7 rounded-full bg-slate-200 shrink-0"></div>
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-2.5 bg-slate-100 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white border border-[#E4E4E7] rounded-[10px] p-6 text-center space-y-2 shadow-xs">
        <Clock className="w-8 h-8 text-slate-400 mx-auto" />
        <h4 className="text-xs font-semibold text-[#0F172A]">No Recent Activity</h4>
        <p className="text-[11px] text-[#64748B]">
          New inquiries, purchase orders, invoices, and payment events will be logged here in real-time.
        </p>
      </div>
    );
  }

  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case "RFQ":
      case "QUOTATION":
        return <FileText className="w-3.5 h-3.5 text-[#0052CC]" />;
      case "ORDER":
        return <Package className="w-3.5 h-3.5 text-[#00875A]" />;
      case "INVOICE":
      case "PAYMENT":
        return <Receipt className="w-3.5 h-3.5 text-[#6554C0]" />;
      case "DISPUTE":
        return <MessageSquare className="w-3.5 h-3.5 text-amber-600" />;
      case "VERIFICATION":
        return <ShieldCheck className="w-3.5 h-3.5 text-[#00875A]" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-[10px] p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
        <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight">
          Recent Activity Timeline
        </h3>
        <span className="text-[11px] font-mono text-[#64748B]">Live Event Feed</span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
        {activities.map((item) => (
          <div key={item.id} className="relative group">
            {/* Dot/Icon on timeline */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border border-slate-300 shadow-2xs flex items-center justify-center shrink-0">
              {getActivityIcon(item.entityType)}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#0F172A]">
                    {item.title}
                  </span>
                  {item.referenceCode && (
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-[#475569] border border-slate-200">
                      {item.referenceCode}
                    </span>
                  )}
                  {item.status && (
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-blue-50 text-[#0052CC] border border-blue-200">
                      {item.status}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-0.5 sm:pt-0">
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  {formatRelativeTime(item.timestamp)}
                </span>
                {item.targetUrl && (
                  <Link
                    href={item.targetUrl}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-[#0052CC] transition-colors"
                    title="View record"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
