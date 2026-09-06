"use client";

import React, { useState } from "react";
import {
  Calendar,
  Filter,
  Download,
  RotateCcw,
  ChevronDown,
  Layers,
  Building2,
  Tag,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

export interface FilterState {
  period: string; // '7d' | '30d' | '90d' | '12m' | 'custom'
  from: string;
  to: string;
  category?: string;
  status?: string;
  supplierId?: string;
  buyerId?: string;
}

interface AnalyticsFilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onExport?: (reportType: string) => void;
  exportOptions?: { label: string; value: string }[];
  statusOptions?: { label: string; value: string }[];
  categories?: string[];
  showCategoryFilter?: boolean;
  showStatusFilter?: boolean;
  isExporting?: boolean;
}

export function AnalyticsFilterBar({
  filters,
  onFilterChange,
  onExport,
  exportOptions,
  statusOptions,
  categories,
  showCategoryFilter = true,
  showStatusFilter = true,
  isExporting = false,
}: AnalyticsFilterBarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customFrom, setCustomFrom] = useState(filters.from || "");
  const [customTo, setCustomTo] = useState(filters.to || "");

  const periods = [
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "Last 90 Days", value: "90d" },
    { label: "12 Months", value: "12m" },
    { label: "Custom Range", value: "custom" },
  ];

  const handlePeriodClick = (p: string) => {
    if (p === "custom") {
      setShowCustomModal(true);
    } else {
      onFilterChange({
        ...filters,
        period: p,
        from: "",
        to: "",
      });
    }
  };

  const applyCustomRange = () => {
    if (!customFrom || !customTo) return;
    onFilterChange({
      ...filters,
      period: "custom",
      from: customFrom,
      to: customTo,
    });
    setShowCustomModal(false);
  };

  const resetFilters = () => {
    onFilterChange({
      period: "30d",
      from: "",
      to: "",
      category: "ALL",
      status: "ALL",
      supplierId: "",
      buyerId: "",
    });
  };

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-4 space-y-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Date presets */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F4F5F7] p-1 rounded-lg border border-[#E4E4E7]">
          {periods.map((p) => {
            const active = filters.period === p.value;
            return (
              <button
                key={p.value}
                onClick={() => handlePeriodClick(p.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  active
                    ? "bg-white text-[#0052CC] font-semibold shadow-xs border border-[#DCDFE4]"
                    : "text-[#44546F] hover:text-[#091E42] hover:bg-white/60"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Action Controls: Reset & Export */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={resetFilters}
            title="Reset to default filters"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#626F86] bg-white border border-[#DCDFE4] rounded-lg hover:bg-[#F4F5F7] hover:text-[#172B4D] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          {exportOptions && exportOptions.length > 0 && onExport && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#0052CC] hover:bg-[#0747A6] rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-lg shadow-lg border border-[#E4E4E7] py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold text-[#626F86] uppercase tracking-wider border-b border-[#F4F5F7]">
                    Download Filtered CSV
                  </div>
                  {exportOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setShowExportMenu(false);
                        onExport(opt.value);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-[#172B4D] hover:bg-[#F4F5F7] flex items-center justify-between group transition-colors"
                    >
                      <span>{opt.label}</span>
                      <Download className="w-3 h-3 text-[#8993A4] group-hover:text-[#0052CC]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Secondary filter selectors (Category, Status, Active range indicator) */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#F4F5F7]">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#626F86]">
          <Filter className="w-3.5 h-3.5 text-[#0052CC]" />
          <span className="font-semibold text-[#172B4D]">Refine:</span>
        </div>

        {/* Category selector */}
        {showCategoryFilter && categories && categories.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#8993A4]" />
            <select
              value={filters.category || "ALL"}
              onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
              className="text-xs bg-[#F4F5F7] border border-[#DCDFE4] rounded-md px-2 py-1 text-[#172B4D] focus:outline-hidden focus:ring-1 focus:ring-[#0052CC]"
            >
              <option value="ALL">All Chemical Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status selector */}
        {showStatusFilter && statusOptions && statusOptions.length > 0 && (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#8993A4]" />
            <select
              value={filters.status || "ALL"}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
              className="text-xs bg-[#F4F5F7] border border-[#DCDFE4] rounded-md px-2 py-1 text-[#172B4D] focus:outline-hidden focus:ring-1 focus:ring-[#0052CC]"
            >
              <option value="ALL">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Custom date range badge */}
        {filters.period === "custom" && filters.from && filters.to && (
          <div className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono bg-[#EBF3FF] text-[#0052CC] border border-[#CCE0FF] rounded-md">
            <Calendar className="w-3 h-3" />
            <span>
              {filters.from} &rarr; {filters.to}
            </span>
          </div>
        )}
      </div>

      {/* Custom Date Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-[#E4E4E7]">
            <div className="flex items-center justify-between border-b border-[#F4F5F7] pb-3">
              <h3 className="text-sm font-semibold text-[#172B4D]">Select Date Range</h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-[#8993A4] hover:text-[#172B4D] text-xs font-mono"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#626F86] uppercase mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full text-xs border border-[#DCDFE4] rounded-lg p-2 text-[#172B4D] focus:outline-hidden focus:ring-1 focus:ring-[#0052CC]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#626F86] uppercase mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full text-xs border border-[#DCDFE4] rounded-lg p-2 text-[#172B4D] focus:outline-hidden focus:ring-1 focus:ring-[#0052CC]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F4F5F7]">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 text-xs text-[#44546F] hover:bg-[#F4F5F7] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={applyCustomRange}
                disabled={!customFrom || !customTo}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded-lg disabled:opacity-40"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
