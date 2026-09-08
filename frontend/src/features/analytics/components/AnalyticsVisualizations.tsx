"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Info,
  Layers,
  ChevronLeft,
  ChevronRight,
  Package,
  Building2,
  FileText,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { DataPoint } from "../api/analyticsApi";

// ==========================================
// 1. KPI STAT CARD
// ==========================================
interface KpiStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: { value: number; isPositive: boolean };
  badge?: string;
  tone?: "blue" | "emerald" | "amber" | "rose" | "purple" | "neutral";
}

export function KpiStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  badge,
  tone = "neutral",
}: KpiStatCardProps) {
  const toneClasses = {
    blue: "text-[#0052CC] bg-[#EBF3FF] border-[#CCE0FF]",
    emerald: "text-[#00875A] bg-[#E3FCEF] border-[#ABF5D1]",
    amber: "text-[#FF991F] bg-[#FFF0B3] border-[#FFE380]",
    rose: "text-[#DE350B] bg-[#FFEBE6] border-[#FFBDAD]",
    purple: "text-[#6554C0] bg-[#EAE6FF] border-[#C0B6F2]",
    neutral: "text-[#172B4D] bg-[#F4F5F7] border-[#E4E4E7]",
  };

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-4.5 shadow-2xs hover:shadow-xs transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#626F86]">
          {title}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded-lg border ${toneClasses[tone]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-[#091E42]">
          {value}
        </span>
        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F4F5F7] text-[#44546F] border border-[#DCDFE4]">
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-1.5 flex items-center gap-2 text-xs text-[#626F86]">
          {trend && (
            <span
              className={`inline-flex items-center font-medium ${
                trend.isPositive ? "text-[#00875A]" : "text-[#DE350B]"
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              )}
              {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. RESPONSIVE SVG TREND LINE CHART
// ==========================================
interface TrendLineChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  color?: string;
  valueFormatter?: (v: number) => string;
}

export function TrendLineChart({
  data,
  title,
  subtitle,
  height = 240,
  color = "#0052CC",
  valueFormatter = (v) => v.toLocaleString(),
}: TrendLineChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 text-center text-xs text-[#626F86] flex flex-col items-center justify-center min-h-[220px]">
        <Info className="w-6 h-6 text-[#8993A4] mb-2" />
        <p>No historical data available for selected date window.</p>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartWidth = 700;
  const chartHeight = height;

  const points = data.map((d, i) => {
    const x =
      paddingLeft +
      (i / (data.length - 1 || 1)) * (chartWidth - paddingLeft - paddingRight);
    const y =
      chartHeight -
      paddingBottom -
      ((d.value - minVal) / range) * (chartHeight - paddingTop - paddingBottom);
    return { x, y, date: d.date, value: d.value };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, "");

  // Closed area under the line
  const areaD = `${pathD} L ${points[points.length - 1].x},${
    chartHeight - paddingBottom
  } L ${points[0].x},${chartHeight - paddingBottom} Z`;

  // Grid line values
  const yTicks = [0, 0.5, 1].map((pct) => ({
    val: minVal + pct * range,
    y:
      chartHeight -
      paddingBottom -
      pct * (chartHeight - paddingTop - paddingBottom),
  }));

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 space-y-3 shadow-xs">
      {(title || subtitle) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h4 className="text-sm font-semibold text-[#091E42]">{title}</h4>
            )}
            {subtitle && (
              <p className="text-xs text-[#626F86]">{subtitle}</p>
            )}
          </div>
          {hoveredIdx !== null && (
            <div className="text-right text-xs">
              <span className="text-[#626F86] mr-2">
                {points[hoveredIdx].date}:
              </span>
              <span className="font-bold text-[#091E42]">
                {valueFormatter(points[hoveredIdx].value)}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto max-h-[280px]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={chartWidth - paddingRight}
                y2={tick.y}
                stroke="#F4F5F7"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={tick.y + 3}
                fontSize="10"
                fill="#8993A4"
                textAnchor="end"
                className="font-mono select-none"
              >
                {Math.round(tick.val)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaD} fill={`url(#gradient-${color})`} />

          {/* Stroke line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, i) => (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === i ? "5" : "3"}
                fill={hoveredIdx === i ? color : "#ffffff"}
                stroke={color}
                strokeWidth="2"
                className="transition-all"
              />
              {/* Invisible larger hit target */}
              <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />
            </g>
          ))}

          {/* X Axis labels (Show first, middle, and last) */}
          {points.length > 0 && (
            <>
              <text
                x={points[0].x}
                y={chartHeight - 10}
                fontSize="10"
                fill="#8993A4"
                className="font-mono"
              >
                {points[0].date}
              </text>
              {points.length > 2 && (
                <text
                  x={points[Math.floor(points.length / 2)].x}
                  y={chartHeight - 10}
                  fontSize="10"
                  fill="#8993A4"
                  textAnchor="middle"
                  className="font-mono"
                >
                  {points[Math.floor(points.length / 2)].date}
                </text>
              )}
              <text
                x={points[points.length - 1].x}
                y={chartHeight - 10}
                fontSize="10"
                fill="#8993A4"
                textAnchor="end"
                className="font-mono"
              >
                {points[points.length - 1].date}
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

// ==========================================
// 3. HORIZONTAL DISTRIBUTION BAR CHART
// ==========================================
interface DistributionBarProps {
  data: { label: string; count: number; color?: string }[];
  title: string;
  totalCount?: number;
}

export function DistributionBarChart({
  data,
  title,
  totalCount,
}: DistributionBarProps) {
  const sum = totalCount || data.reduce((acc, d) => acc + d.count, 0) || 1;

  const defaultColors = [
    "#0052CC",
    "#00875A",
    "#FF991F",
    "#6554C0",
    "#DE350B",
    "#36B37E",
    "#4A5568",
  ];

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[#091E42]">{title}</h4>
        <span className="text-xs font-mono text-[#626F86]">
          Total: {sum.toLocaleString()}
        </span>
      </div>

      {/* Stacked single bar */}
      <div className="w-full h-3.5 bg-[#F4F5F7] rounded-full overflow-hidden flex">
        {data.map((item, idx) => {
          const pct = Math.max(0, (item.count / sum) * 100);
          if (pct === 0) return null;
          const bg = item.color || defaultColors[idx % defaultColors.length];
          return (
            <div
              key={item.label}
              style={{ width: `${pct}%`, backgroundColor: bg }}
              className="h-full transition-all"
              title={`${item.label}: ${item.count} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend and values */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
        {data.map((item, idx) => {
          const pct = ((item.count / sum) * 100).toFixed(1);
          const bg = item.color || defaultColors[idx % defaultColors.length];
          return (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: bg }}
              />
              <span className="text-[#44546F] truncate">{item.label}</span>
              <span className="ml-auto font-semibold font-mono text-[#172B4D]">
                {item.count} <span className="text-[#8993A4] font-normal">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 4. SUMMARY METER CARD
// ==========================================
interface SummaryMeterCardProps {
  title: string;
  items: {
    label: string;
    amount?: string | number;
    count?: number;
    color?: string;
  }[];
  footerNotice?: string;
}

export function SummaryMeterCard({
  title,
  items,
  footerNotice,
}: SummaryMeterCardProps) {
  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 space-y-3.5 shadow-xs">
      <h4 className="text-sm font-semibold text-[#091E42]">{title}</h4>

      <div className="divide-y divide-[#F4F5F7]">
        {items.map((it) => (
          <div key={it.label} className="py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {it.color && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: it.color }}
                />
              )}
              <span className="text-[#44546F]">{it.label}</span>
            </div>
            <div className="font-semibold text-[#091E42] font-mono">
              {it.amount !== undefined ? it.amount : it.count}
            </div>
          </div>
        ))}
      </div>

      {footerNotice && (
        <p className="text-[11px] text-[#626F86] italic pt-1 border-t border-[#F4F5F7] leading-relaxed">
          {footerNotice}
        </p>
      )}
    </div>
  );
}

// ==========================================
// 5. GENERIC DATA TABLE
// ==========================================
interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
}

interface AnalyticsTableProps<T> {
  title: string;
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  pageSize?: number;
}

export function AnalyticsTable<T>({
  title,
  columns,
  data,
  emptyMessage = "No records found.",
  pageSize = 5,
}: AnalyticsTableProps<T>) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const visibleData = data.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl overflow-hidden shadow-xs">
      <div className="px-5 py-3.5 border-b border-[#E4E4E7] flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[#091E42]">{title}</h4>
        <span className="text-xs text-[#626F86] font-mono">
          Showing {data.length > 0 ? page * pageSize + 1 : 0}-
          {Math.min((page + 1) * pageSize, data.length)} of {data.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F9FA] text-[#626F86] uppercase tracking-wider font-semibold border-b border-[#E4E4E7]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F5F7]">
            {visibleData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-[#8993A4]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visibleData.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#F8F9FA]/60 transition-colors">
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={`px-4 py-3 text-[#172B4D] ${
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                          ? "text-center"
                          : "text-left"
                      }`}
                    >
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-2.5 border-t border-[#E4E4E7] bg-[#F8F9FA] flex items-center justify-between text-xs">
          <span className="text-[#626F86]">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded-md border border-[#DCDFE4] bg-white text-[#44546F] disabled:opacity-30 hover:bg-[#F4F5F7]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1 rounded-md border border-[#DCDFE4] bg-white text-[#44546F] disabled:opacity-30 hover:bg-[#F4F5F7]"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
