"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  Building2,
  Package,
  FileText,
  ShoppingCart,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Layers,
  CheckCircle2,
  ShieldCheck,
  Search,
  Receipt,
  FileSpreadsheet,
  RefreshCw,
  Tag,
  Flame,
} from "lucide-react";

import {
  AdminDashboardKpiResponse,
  RfqQuotationAnalyticsResponse,
  OrderAnalyticsReportResponse,
  SupplierAnalyticsReportResponse,
  ProductAnalyticsReportResponse,
  InvoicePaymentReportResponse,
  getAdminDashboardKpis,
  getAdminRfqAnalytics,
  getAdminOrderAnalytics,
  getAdminSupplierAnalytics,
  getAdminProductAnalytics,
  getAdminInvoiceAnalytics,
  downloadAdminExport,
  TopProduct,
  TopSupplier,
  SupplierPerformanceRow,
  ProductDemand,
  ProductSummary,
  ProductDemandGrowth,
} from "@/features/analytics/api/analyticsApi";

import {
  AnalyticsFilterBar,
  FilterState,
} from "@/features/analytics/components/AnalyticsFilterBar";

import {
  KpiStatCard,
  TrendLineChart,
  DistributionBarChart,
  SummaryMeterCard,
  AnalyticsTable,
} from "@/features/analytics/components/AnalyticsVisualizations";

import { PageHeader, SkeletonLoader } from "@/shared/components/ui/KemkendraUI";

type TabKey = "overview" | "rfqs" | "orders" | "suppliers" | "products" | "invoices";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL query parameters
  const [filters, setFilters] = useState<FilterState>({
    period: searchParams.get("period") || "30d",
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    category: searchParams.get("category") || "ALL",
    status: searchParams.get("status") || "ALL",
  });

  const [activeTab, setActiveTab] = useState<TabKey>(
    (searchParams.get("tab") as TabKey) || "overview"
  );

  const [kpis, setKpis] = useState<AdminDashboardKpiResponse | null>(null);
  const [rfqData, setRfqData] = useState<RfqQuotationAnalyticsResponse | null>(null);
  const [orderData, setOrderData] = useState<OrderAnalyticsReportResponse | null>(null);
  const [supplierData, setSupplierData] = useState<SupplierAnalyticsReportResponse | null>(null);
  const [productData, setProductData] = useState<ProductAnalyticsReportResponse | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoicePaymentReportResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  // Sync state to URL search parameters
  const updateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.period) params.set("period", newFilters.period);
    if (newFilters.from) params.set("from", newFilters.from);
    if (newFilters.to) params.set("to", newFilters.to);
    if (newFilters.category && newFilters.category !== "ALL") params.set("category", newFilters.category);
    if (newFilters.status && newFilters.status !== "ALL") params.set("status", newFilters.status);
    params.set("tab", activeTab);
    router.replace(`/dashboard/admin/analytics?${params.toString()}`);
  };

  const handleTabSwitch = (tab: TabKey) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/dashboard/admin/analytics?${params.toString()}`);
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Always fetch high-level 15 KPIs
      const kpisPromise = getAdminDashboardKpis();

      // 2. Fetch tab-specific data concurrently
      const params = {
        period: filters.period,
        from: filters.from,
        to: filters.to,
        category: filters.category,
        status: filters.status,
      };

      if (activeTab === "overview") {
        const [kpiRes, rfqRes, ordRes, invRes] = await Promise.all([
          kpisPromise,
          getAdminRfqAnalytics(params),
          getAdminOrderAnalytics(params),
          getAdminInvoiceAnalytics(params),
        ]);
        setKpis(kpiRes);
        setRfqData(rfqRes);
        setOrderData(ordRes);
        setInvoiceData(invRes);
      } else if (activeTab === "rfqs") {
        const [kpiRes, rfqRes] = await Promise.all([kpisPromise, getAdminRfqAnalytics(params)]);
        setKpis(kpiRes);
        setRfqData(rfqRes);
      } else if (activeTab === "orders") {
        const [kpiRes, ordRes] = await Promise.all([kpisPromise, getAdminOrderAnalytics(params)]);
        setKpis(kpiRes);
        setOrderData(ordRes);
      } else if (activeTab === "suppliers") {
        const [kpiRes, supRes] = await Promise.all([kpisPromise, getAdminSupplierAnalytics(params)]);
        setKpis(kpiRes);
        setSupplierData(supRes);
      } else if (activeTab === "products") {
        const [kpiRes, prodRes] = await Promise.all([kpisPromise, getAdminProductAnalytics(params)]);
        setKpis(kpiRes);
        setProductData(prodRes);
      } else if (activeTab === "invoices") {
        const [kpiRes, invRes] = await Promise.all([kpisPromise, getAdminInvoiceAnalytics(params)]);
        setKpis(kpiRes);
        setInvoiceData(invRes);
      }

      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error("Failed to load analytics data", err);
      setError(err.message || "Failed to load reporting data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async (reportType: string) => {
    setIsExporting(true);
    try {
      await downloadAdminExport(reportType, {
        period: filters.period,
        from: filters.from,
        to: filters.to,
        status: filters.status,
        category: filters.category,
      });
    } catch (err: any) {
      alert(`Export failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    { label: "Export RFQs Report", value: "rfqs" },
    { label: "Export Quotations Report", value: "quotations" },
    { label: "Export Orders Report", value: "orders" },
    { label: "Export Suppliers Directory", value: "suppliers" },
    { label: "Export Product Catalog Report", value: "products" },
    { label: "Export Invoices Report", value: "invoices" },
    { label: "Export Payments Reconciliation", value: "payments" },
  ];

  const categories = [
    "SPECIALTY_CHEMICALS",
    "BULK_CHEMICALS",
    "AGROCHEMICALS",
    "PHARMACEUTICAL_INTERMEDIATES",
    "POLYMERS_AND_RESINS",
    "WATER_TREATMENT",
    "FOOD_ADDITIVES",
    "DYES_AND_PIGMENTS",
  ];

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "₹0.00";
    return `₹${Number(val).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-16 text-[#0F172A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#0052CC] block mb-1">
            Enterprise Governance & BI
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#091E42]">
            Platform Analytics & Intelligence Hub
          </h1>
          <p className="text-xs text-[#626F86] mt-0.5">
            Aggregated real-time metrics across sourcing, RFQs, quotations, purchase orders, catalog offerings, and settlement records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs text-[#8993A4] font-mono hidden sm:inline">
              Updated: {lastRefreshed}
            </span>
          )}
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#44546F] bg-white border border-[#DCDFE4] rounded-lg hover:bg-[#F4F5F7] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#0052CC]" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* 1. Primary 15 Executive KPI Cards (Always visible) */}
      {kpis ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <KpiStatCard
            title="Total Buyers"
            value={kpis.totalBuyers}
            icon={Users}
            tone="blue"
          />
          <KpiStatCard
            title="Total Suppliers"
            value={kpis.totalSuppliers}
            subtitle={`${kpis.verifiedSuppliers} verified`}
            icon={Building2}
            tone="purple"
          />
          <KpiStatCard
            title="Verified Suppliers"
            value={kpis.verifiedSuppliers}
            subtitle={`${((kpis.verifiedSuppliers / (kpis.totalSuppliers || 1)) * 100).toFixed(0)}% verification rate`}
            icon={ShieldCheck}
            tone="emerald"
          />
          <KpiStatCard
            title="Master Products"
            value={kpis.totalProducts}
            subtitle={`${kpis.activeCommercialOfferings} commercial offerings`}
            icon={Package}
            tone="blue"
          />
          <KpiStatCard
            title="Active Offerings"
            value={kpis.activeCommercialOfferings}
            icon={Layers}
            tone="blue"
          />
          <KpiStatCard
            title="Total RFQs"
            value={kpis.totalRfqs}
            subtitle={`${kpis.activeRfqs} currently active`}
            icon={FileText}
            tone="amber"
          />
          <KpiStatCard
            title="Active RFQs"
            value={kpis.activeRfqs}
            icon={Flame}
            tone="amber"
          />
          <KpiStatCard
            title="Total Quotations"
            value={kpis.totalQuotations}
            subtitle={
              kpis.totalRfqs > 0
                ? `${(kpis.totalQuotations / kpis.totalRfqs).toFixed(1)} quotes/RFQ`
                : undefined
            }
            icon={FileText}
            tone="neutral"
          />
          <KpiStatCard
            title="Total Orders"
            value={kpis.totalOrders}
            subtitle={`${kpis.completedOrders} completed`}
            icon={ShoppingCart}
            tone="blue"
          />
          <KpiStatCard
            title="Completed Orders"
            value={kpis.completedOrders}
            subtitle={
              kpis.totalOrders > 0
                ? `${((kpis.completedOrders / kpis.totalOrders) * 100).toFixed(0)}% fulfilled`
                : undefined
            }
            icon={CheckCircle2}
            tone="emerald"
          />
          <KpiStatCard
            title="Cancelled Orders"
            value={kpis.cancelledOrders}
            tone="rose"
            icon={AlertCircle}
          />
          <KpiStatCard
            title="Gross Invoiced GMV"
            value={formatCurrency(kpis.totalInvoiceValue)}
            subtitle="Marketplace volume"
            icon={DollarSign}
            tone="blue"
          />
          <KpiStatCard
            title="Paid Invoice Value"
            value={formatCurrency(kpis.paidInvoiceValue)}
            subtitle="Settled transactions"
            icon={DollarSign}
            tone="emerald"
          />
          <KpiStatCard
            title="Outstanding Invoices"
            value={formatCurrency(kpis.outstandingInvoiceValue)}
            subtitle="Pending receivables"
            icon={Clock}
            tone="amber"
          />
          <KpiStatCard
            title="Open Disputes"
            value={kpis.openDisputes}
            subtitle={kpis.openDisputes === 0 ? "Zero claims active" : "Requires attention"}
            icon={AlertCircle}
            tone={kpis.openDisputes > 0 ? "rose" : "emerald"}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-24 bg-white border border-[#E4E4E7] rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* 2. Filter Bar */}
      <AnalyticsFilterBar
        filters={filters}
        onFilterChange={updateFilters}
        onExport={handleExport}
        exportOptions={exportOptions}
        categories={categories}
        isExporting={isExporting}
      />

      {/* 3. Navigation Tabs */}
      <div className="border-b border-[#E4E4E7] flex items-center gap-1 overflow-x-auto text-xs font-semibold">
        {[
          { key: "overview", label: "Executive Overview" },
          { key: "rfqs", label: "RFQs & Quotations" },
          { key: "orders", label: "Orders & Marketplace GMV" },
          { key: "suppliers", label: "Supplier Performance" },
          { key: "products", label: "Products & Demand" },
          { key: "invoices", label: "Invoices & Payments Aging" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabSwitch(t.key as TabKey)}
            className={`px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.key
                ? "border-[#0052CC] text-[#0052CC]"
                : "border-transparent text-[#626F86] hover:text-[#091E42] hover:border-[#DCDFE4]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-[#FFEBE6] border border-[#FFBDAD] text-[#DE350B] rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Tab Content */}
      {isLoading ? (
        <div className="space-y-4 py-8">
          <div className="h-64 bg-white border border-[#E4E4E7] rounded-xl animate-pulse" />
          <div className="h-48 bg-white border border-[#E4E4E7] rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {rfqData && (
                  <TrendLineChart
                    title="RFQs Created Over Time"
                    subtitle="Daily inquiry volume submitted by buyers"
                    data={rfqData.rfqsOverTime}
                    color="#0052CC"
                  />
                )}
                {orderData && (
                  <TrendLineChart
                    title="Purchase Orders Created Over Time"
                    subtitle="Order conversions executed on platform"
                    data={orderData.ordersOverTime}
                    color="#00875A"
                  />
                )}
              </div>

              {orderData && (
                <DistributionBarChart
                  title="Order Distribution by Status"
                  data={Object.entries(orderData.ordersByStatus).map(([status, count]) => ({
                    label: status,
                    count,
                  }))}
                  totalCount={orderData.totalOrders}
                />
              )}
            </div>
          )}

          {/* TAB 2: RFQS & QUOTATIONS */}
          {activeTab === "rfqs" && rfqData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <KpiStatCard
                  title="Total RFQs"
                  value={rfqData.totalRfqs}
                  subtitle="In selected period"
                  tone="blue"
                />
                <KpiStatCard
                  title="Receiving Quotes"
                  value={rfqData.rfqsReceivingQuotations}
                  subtitle={`${rfqData.rfqToQuotationConversionRate}% conversion rate`}
                  tone="emerald"
                />
                <KpiStatCard
                  title="Avg Quotes per RFQ"
                  value={rfqData.averageQuotationsPerRfq}
                  subtitle="Marketplace competition"
                  tone="neutral"
                />
                <KpiStatCard
                  title="Avg Quote Response Time"
                  value={`${rfqData.averageQuotationResponseTimeHours} hrs`}
                  subtitle="Supplier turnaround"
                  tone="amber"
                />
              </div>

              <TrendLineChart
                title="RFQ Sourcing Volume Trend"
                subtitle="Historical trajectory of RFQs posted"
                data={rfqData.rfqsOverTime}
                color="#0052CC"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SummaryMeterCard
                  title="RFQ Pipeline Health"
                  items={[
                    { label: "Pending Supplier Response", count: rfqData.pendingRfqs, color: "#FF991F" },
                    { label: "Quotes Received", count: rfqData.rfqsReceivingQuotations, color: "#00875A" },
                    { label: "Expired Without Acceptance", count: rfqData.expiredRfqs, color: "#DE350B" },
                  ]}
                />
                <SummaryMeterCard
                  title="Quotation Efficiency"
                  items={[
                    { label: "RFQ-to-Quote Conversion Rate", amount: `${rfqData.rfqToQuotationConversionRate}%`, color: "#0052CC" },
                    { label: "Quotation Acceptance Rate", amount: `${rfqData.quotationAcceptanceRate}%`, color: "#00875A" },
                    { label: "Average Response Time", amount: `${rfqData.averageQuotationResponseTimeHours} Hours`, color: "#6554C0" },
                  ]}
                />
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS & GMV */}
          {activeTab === "orders" && orderData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <KpiStatCard
                  title="Period Orders"
                  value={orderData.totalOrders}
                  tone="blue"
                />
                <KpiStatCard
                  title="Average Order Value"
                  value={formatCurrency(orderData.averageOrderValue)}
                  subtitle="AOV across orders"
                  tone="emerald"
                />
                <KpiStatCard
                  title="Completed Orders"
                  value={orderData.completedOrders}
                  subtitle="Delivered & confirmed"
                  tone="emerald"
                />
                <KpiStatCard
                  title="Avg Completion Time"
                  value={`${orderData.averageOrderCompletionTimeDays} days`}
                  subtitle="From placement to delivery"
                  tone="purple"
                />
              </div>

              <TrendLineChart
                title="Orders Executed Trend"
                subtitle="Daily transaction velocity"
                data={orderData.ordersOverTime}
                color="#00875A"
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalyticsTable<TopProduct>
                  title="Most Ordered Chemical Products"
                  columns={[
                    { header: "Chemical", accessor: (r) => <span className="font-medium text-[#091E42]">{r.productName}</span> },
                    { header: "Code", accessor: (r) => <span className="font-mono text-[11px] text-[#626F86]">{r.productCode || "—"}</span> },
                    { header: "Orders", accessor: (r) => r.orderCount, align: "right" },
                    { header: "Total Quantity", accessor: (r) => `${Number(r.totalQuantity).toLocaleString()} ${r.unit}`, align: "right" },
                    { header: "GMV", accessor: (r) => <span className="font-semibold font-mono">{formatCurrency(r.totalAmount)}</span>, align: "right" },
                  ]}
                  data={orderData.mostOrderedProducts}
                  emptyMessage="No orders logged in this time range."
                />

                <AnalyticsTable<TopSupplier>
                  title="Most Active Suppliers"
                  columns={[
                    { header: "Supplier", accessor: (r) => <span className="font-medium text-[#091E42]">{r.supplierName}</span> },
                    { header: "Orders Assigned", accessor: (r) => r.orderCount, align: "right" },
                    { header: "Completed", accessor: (r) => <span className="text-[#00875A] font-semibold">{r.completedCount}</span>, align: "right" },
                    { header: "Fulfilled GMV", accessor: (r) => <span className="font-semibold font-mono">{formatCurrency(r.totalGmv)}</span>, align: "right" },
                  ]}
                  data={orderData.mostActiveSuppliers}
                  emptyMessage="No supplier order activity logged."
                />
              </div>
            </div>
          )}

          {/* TAB 4: SUPPLIER PERFORMANCE */}
          {activeTab === "suppliers" && supplierData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <KpiStatCard
                  title="Total Suppliers"
                  value={supplierData.totalSuppliers}
                  subtitle={`${supplierData.verifiedSuppliers} verified`}
                  tone="blue"
                />
                <KpiStatCard
                  title="Pending Review"
                  value={supplierData.pendingSuppliers + supplierData.underReviewSuppliers}
                  subtitle="Awaiting governance"
                  tone="amber"
                />
                <KpiStatCard
                  title="Quotes Submitted"
                  value={supplierData.totalQuotationsSubmitted}
                  subtitle={`${supplierData.totalQuotationsAccepted} accepted`}
                  tone="emerald"
                />
                <KpiStatCard
                  title="Avg Response Time"
                  value={`${supplierData.averageResponseTimeHours} hrs`}
                  tone="purple"
                />
              </div>

              <AnalyticsTable<SupplierPerformanceRow>
                title="Supplier Operational Performance Benchmarks (Real Activity Only)"
                columns={[
                  { header: "Company Name", accessor: (r) => <span className="font-semibold text-[#091E42]">{r.supplierName}</span> },
                  {
                    header: "Status",
                    accessor: (r) => (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.verificationStatus === "VERIFIED"
                          ? "bg-[#E3FCEF] text-[#00875A]"
                          : "bg-[#FFF0B3] text-[#172B4D]"
                      }`}>
                        {r.verificationStatus}
                      </span>
                    ),
                  },
                  { header: "RFQs Rec.", accessor: (r) => r.rfqsReceived, align: "right" },
                  { header: "Quotes Sub.", accessor: (r) => r.quotationsSubmitted, align: "right" },
                  { header: "Win Rate", accessor: (r) => <span className="font-bold text-[#0052CC]">{r.quoteAcceptanceRate}%</span>, align: "right" },
                  { header: "Orders Completed", accessor: (r) => <span className="font-bold text-[#00875A]">{r.ordersCompleted}</span>, align: "right" },
                  { header: "Avg Response", accessor: (r) => `${r.averageResponseTimeHours} hrs`, align: "right" },
                ]}
                data={supplierData.supplierPerformanceList}
                emptyMessage="No suppliers registered on platform."
                pageSize={10}
              />
            </div>
          )}

          {/* TAB 5: PRODUCTS & DEMAND */}
          {activeTab === "products" && productData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalyticsTable<ProductDemand>
                  title="Most Requested Chemicals (High Sourcing Demand)"
                  columns={[
                    { header: "Chemical", accessor: (r) => <span className="font-medium text-[#091E42]">{r.chemicalName}</span> },
                    { header: "CAS No.", accessor: (r) => <span className="font-mono text-[#626F86]">{r.casNumber || "—"}</span> },
                    { header: "RFQs", accessor: (r) => r.rfqCount, align: "right" },
                    { header: "Requested Volume", accessor: (r) => `${Number(r.totalRequestedQuantity).toLocaleString()} ${r.unit}`, align: "right" },
                  ]}
                  data={productData.mostRequestedChemicals}
                  emptyMessage="No chemical demands recorded."
                />

                <AnalyticsTable<ProductDemandGrowth>
                  title="Products with Surging Demand (Demand Spikes)"
                  columns={[
                    { header: "Chemical", accessor: (r) => <span className="font-medium text-[#091E42]">{r.productName}</span> },
                    { header: "Current Period", accessor: (r) => r.currentPeriodRfqCount, align: "right" },
                    { header: "Previous Period", accessor: (r) => r.previousPeriodRfqCount, align: "right" },
                    {
                      header: "Growth Rate",
                      accessor: (r) => (
                        <span className="font-bold text-[#00875A]">
                          +{r.growthPercentage}%
                        </span>
                      ),
                      align: "right",
                    },
                  ]}
                  data={productData.productsWithIncreasingDemand}
                  emptyMessage="No products exhibiting rapid demand spikes."
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalyticsTable<ProductSummary>
                  title="Catalog Gaps: Products With Zero Active Offerings"
                  columns={[
                    { header: "Chemical Name", accessor: (r) => <span className="font-medium text-[#091E42]">{r.name}</span> },
                    { header: "Master Code", accessor: (r) => <span className="font-mono text-[#626F86]">{r.masterProductCode}</span> },
                    { header: "Category", accessor: (r) => <span className="text-[11px] text-[#44546F]">{r.category?.replace(/_/g, " ")}</span> },
                  ]}
                  data={productData.productsWithNoActiveOfferings}
                  emptyMessage="All master chemicals currently have active supplier offerings."
                />

                <div className="space-y-4">
                  <SummaryMeterCard
                    title="Most Active Chemical Categories"
                    items={productData.mostActiveCategories.map((c) => ({
                      label: c.category?.replace(/_/g, " ") || "Other",
                      amount: `${c.rfqCount} RFQs • ${c.orderCount} Orders`,
                    }))}
                  />
                  {productData.mostSearched.length > 0 && (
                    <SummaryMeterCard
                      title="Top Buyer Chemical Search Queries"
                      items={productData.mostSearched.map((s) => ({
                        label: `"${s.searchTerm}"`,
                        count: s.searchCount,
                      }))}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: INVOICES & PAYMENTS */}
          {activeTab === "invoices" && invoiceData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <KpiStatCard
                  title="Gross Invoiced GMV"
                  value={formatCurrency(invoiceData.totalInvoiceValue)}
                  subtitle="Gross marketplace value"
                  tone="blue"
                />
                <KpiStatCard
                  title="Settled Collections"
                  value={formatCurrency(invoiceData.paidAmount)}
                  subtitle="Verified buyer payments"
                  tone="emerald"
                />
                <KpiStatCard
                  title="Outstanding Receivables"
                  value={formatCurrency(invoiceData.outstandingAmount)}
                  subtitle="Due from buyers"
                  tone="amber"
                />
                <KpiStatCard
                  title="Overdue Invoices"
                  value={formatCurrency(invoiceData.overdueAmount)}
                  subtitle="Past statutory due date"
                  tone="rose"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DistributionBarChart
                  title="Payment Verification Breakdown"
                  data={Object.entries(invoiceData.paymentConfirmationStatusBreakdown).map(
                    ([status, count]) => ({
                      label: status,
                      count,
                    })
                  )}
                />

                <SummaryMeterCard
                  title="Invoice Aging & Risk Exposure"
                  items={[
                    { label: "Fully Paid Collections", amount: formatCurrency(invoiceData.paidAmount), color: "#00875A" },
                    { label: "Partially Paid Amounts", amount: formatCurrency(invoiceData.partiallyPaidAmount), color: "#0052CC" },
                    { label: "Outstanding Invoices", amount: formatCurrency(invoiceData.outstandingAmount), color: "#FF991F" },
                    { label: "Past Due Overdue Receivables", amount: formatCurrency(invoiceData.overdueAmount), color: "#DE350B" },
                    { label: "Cancelled / Void Invoices", amount: `${invoiceData.cancelledInvoicesCount} invoices (${formatCurrency(invoiceData.cancelledInvoicesAmount)})`, color: "#8993A4" },
                    { label: "Disputed Payments Under Investigation", amount: `${invoiceData.disputedPaymentsCount} disputes (${formatCurrency(invoiceData.disputedPaymentsAmount)})`, color: "#DE350B" },
                  ]}
                  footerNotice={invoiceData.platformRevenueNotice}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
