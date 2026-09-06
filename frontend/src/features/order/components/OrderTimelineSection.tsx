"use client";

import React, { useEffect, useState, useCallback } from "react";
import { OrderTimelineEventDto, getOrderTimeline } from "../api/fulfillment";
import { 
  CheckCircle2, 
  Clock, 
  Circle, 
  Truck, 
  Package, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  ShieldAlert,
  ArrowDown
} from "lucide-react";

interface OrderTimelineSectionProps {
  orderId: string;
  className?: string;
}

export function OrderTimelineSection({ orderId, className = "" }: OrderTimelineSectionProps) {
  const [timeline, setTimeline] = useState<OrderTimelineEventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrderTimeline(orderId);
      setTimeline(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order history");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTimeline();

    const handleOrderUpdate = () => {
      fetchTimeline();
    };

    window.addEventListener("order-updated", handleOrderUpdate);
    return () => {
      window.removeEventListener("order-updated", handleOrderUpdate);
    };
  }, [fetchTimeline]);

  if (loading) {
    return (
      <div className={`bg-white rounded-[8px] border border-[#E4E4E7] p-5 shadow-tactile animate-pulse ${className}`}>
        <div className="h-5 w-40 bg-[#F1F5F9] rounded mb-6" />
        <div className="space-y-4">
          <div className="h-14 bg-[#F8FAFC] rounded" />
          <div className="h-14 bg-[#F8FAFC] rounded" />
          <div className="h-14 bg-[#F8FAFC] rounded" />
        </div>
      </div>
    );
  }

  if (error || timeline.length === 0) {
    return null;
  }

  const getStepIcon = (event: OrderTimelineEventDto) => {
    if (event.step.includes("CANCELLED") || event.step.includes("REJECTED")) {
      return <XCircle className="w-4 h-4 text-[#DC2626]" />;
    }
    if (event.step.includes("DISPUTED")) {
      return <ShieldAlert className="w-4 h-4 text-[#EA580C]" />;
    }
    if (event.completed) {
      return <CheckCircle2 className="w-4 h-4 text-[#059669]" />;
    }
    if (event.current) {
      return <Clock className="w-4 h-4 text-[#0284C7] animate-pulse" />;
    }
    return <Circle className="w-3.5 h-3.5 text-[#94A3B8]" />;
  };

  const formatTimestamp = (ts?: string | null) => {
    if (!ts) return null;
    try {
      const d = new Date(ts);
      return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return ts;
    }
  };

  return (
    <div className={`bg-white rounded-[8px] border border-[#E4E4E7] p-5 shadow-tactile ${className}`}>
      <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-5">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Order Lifecycle Timeline</h3>
          <p className="text-xs text-[#64748B]">Complete audit trail of procurement milestones & fulfillment events</p>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-[#E2E8F0]">
        {timeline.map((event, idx) => {
          const isFinished = event.completed;
          const isCurrent = event.current;
          const isNegative = event.step.includes("CANCELLED") || event.step.includes("REJECTED") || event.step.includes("DISPUTED");

          let nodeBg = "bg-white border-2 border-[#CBD5E1]";
          if (isNegative) {
            nodeBg = "bg-[#FEF2F2] border-2 border-[#DC2626]";
          } else if (isFinished) {
            nodeBg = "bg-[#ECFDF5] border-2 border-[#059669]";
          } else if (isCurrent) {
            nodeBg = "bg-[#E0F2FE] border-2 border-[#0284C7] ring-4 ring-[#0284C7]/15";
          }

          return (
            <div key={idx} className="relative group">
              {/* Timeline marker icon */}
              <div
                className={`absolute -left-[25px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${nodeBg}`}
              >
                {getStepIcon(event)}
              </div>

              {/* Event Content */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isCurrent ? "text-[#0284C7]" : isFinished ? "text-[#0F172A]" : "text-[#64748B]"}`}>
                      {event.title}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#0284C7]/10 text-[#0284C7]">
                        Current Stage
                      </span>
                    )}
                    {event.actorRole && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569] font-medium">
                        {event.actorRole} {event.actorName ? `(${event.actorName})` : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5 max-w-xl">
                    {event.description}
                  </p>
                </div>

                {event.timestamp && (
                  <div className="text-[11px] text-[#94A3B8] sm:text-right flex-shrink-0">
                    {formatTimestamp(event.timestamp)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
