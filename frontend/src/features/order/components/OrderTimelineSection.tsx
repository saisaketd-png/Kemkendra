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
      <div className={`bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-tactile-card animate-pulse ${className}`}>
        <div className="h-5 w-40 bg-slate-100 rounded-md mb-6" />
        <div className="space-y-4">
          <div className="h-14 bg-slate-50 rounded-xl" />
          <div className="h-14 bg-slate-50 rounded-xl" />
          <div className="h-14 bg-slate-50 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || timeline.length === 0) {
    return null;
  }

  const getStepIcon = (event: OrderTimelineEventDto) => {
    if (event.step.includes("CANCELLED") || event.step.includes("REJECTED")) {
      return <XCircle className="w-4 h-4 text-rose-600" />;
    }
    if (event.step.includes("DISPUTED")) {
      return <ShieldAlert className="w-4 h-4 text-orange-600" />;
    }
    if (event.completed) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    if (event.current) {
      return <Clock className="w-4 h-4 text-[#0052CC] animate-pulse" />;
    }
    return <Circle className="w-3.5 h-3.5 text-slate-400" />;
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
    <div className={`bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-tactile-card ${className}`}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Order Lifecycle Timeline</h3>
          <p className="text-xs text-slate-500">Complete audit trail of procurement milestones & fulfillment events</p>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-slate-200">
        {timeline.map((event, idx) => {
          const isFinished = event.completed;
          const isCurrent = event.current;
          const isNegative = event.step.includes("CANCELLED") || event.step.includes("REJECTED") || event.step.includes("DISPUTED");

          let nodeBg = "bg-white border-2 border-slate-300";
          if (isNegative) {
            nodeBg = "bg-rose-50 border-2 border-rose-600";
          } else if (isFinished) {
            nodeBg = "bg-emerald-50 border-2 border-emerald-600";
          } else if (isCurrent) {
            nodeBg = "bg-blue-50 border-2 border-[#0052CC] ring-4 ring-[#0052CC]/15";
          }

          return (
            <div key={idx} className="relative group">
              {/* Timeline marker icon */}
              <div
                className={`absolute -left-[25px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-150 ${nodeBg}`}
              >
                {getStepIcon(event)}
              </div>

              {/* Event Content */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isCurrent ? "text-[#0052CC]" : isFinished ? "text-slate-900" : "text-slate-600"}`}>
                      {event.title}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-[#0052CC] border border-blue-100">
                        Current Stage
                      </span>
                    )}
                    {event.actorRole && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {event.actorRole} {event.actorName ? `(${event.actorName})` : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                    {event.description}
                  </p>
                </div>

                {event.timestamp && (
                  <div className="text-[11px] text-slate-400 sm:text-right flex-shrink-0">
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
