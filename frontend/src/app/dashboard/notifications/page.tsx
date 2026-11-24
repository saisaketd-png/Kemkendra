"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Shield,
  FileText,
  Package,
  Layers,
  Award,
  AlertCircle,
  RefreshCw,
  Receipt,
  CreditCard,
  Scale,
  Archive,
  Trash2,
} from "lucide-react";
import { getAuthUser, AuthUser } from "@/features/auth/api/auth";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
} from "@/features/notifications/api/notifications";
import { PageHeader } from "@/shared/components/ui/KemkendraUI";
import {
  NotificationCategory,
  NotificationResponse,
  PaginatedNotifications,
} from "@/features/notifications/types/notification";
import { NotificationList } from "@/features/notifications/components/NotificationList";
import { resolveNotificationRoute } from "@/features/notifications/utils/navigation";

const CATEGORY_TABS: { label: string; value: NotificationCategory | "ALL"; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "All", value: "ALL", icon: Bell },
  { label: "Invoices", value: "INVOICE", icon: Receipt },
  { label: "Payments", value: "PAYMENT", icon: CreditCard },
  { label: "Disputes", value: "DISPUTE", icon: Scale },
  { label: "Orders", value: "PURCHASE_ORDER", icon: Package },
  { label: "Quotations", value: "QUOTATION", icon: FileText },
  { label: "RFQs", value: "RFQ", icon: FileText },
  { label: "Shipments", value: "SHIPMENT", icon: Package },
  { label: "Security & Account", value: "SECURITY", icon: Shield },
  { label: "Verification", value: "SUPPLIER_VERIFICATION", icon: Award },
  { label: "Catalog", value: "CATALOG", icon: Layers },
  { label: "Governance", value: "GOVERNANCE", icon: AlertCircle },
];

export default function NotificationInboxPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [page, setPage] = useState<number>(0);
  const [pageSize] = useState<number>(15);
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | "ALL">("ALL");
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);
  const [filterArchivedOnly, setFilterArchivedOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [data, setData] = useState<PaginatedNotifications | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState<boolean>(false);

  const isSupplier = user?.role === "SUPPLIER";

  // Check auth
  useEffect(() => {
    const currentUser = getAuthUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
  }, [router]);

  // Load paginated notifications
  const loadNotifications = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const categoryParam = selectedCategory === "ALL" ? undefined : selectedCategory;
      const readParam = filterUnreadOnly ? false : undefined;
      const response = await getNotifications(
        page,
        pageSize,
        categoryParam,
        readParam,
        undefined,
        filterArchivedOnly
      );
      setData(response);
    } catch (err: unknown) {
      if (!silent) {
        const msg = err instanceof Error ? err.message : "Failed to load notifications";
        setError(msg);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [page, pageSize, selectedCategory, filterUnreadOnly, filterArchivedOnly]);

  useEffect(() => {
    if (user) {
      loadNotifications(false);
    }

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible" && user) {
        loadNotifications(true);
      }
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user) {
        loadNotifications(true);
      }
    };

    const handleWindowFocus = () => {
      if (user) {
        loadNotifications(true);
      }
    };

    const handleNotificationsUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<{ notification?: NotificationResponse }>;
      const newNotif = customEvt.detail?.notification;

      if (newNotif && page === 0 && selectedCategory === "ALL") {
        setData((prev) => {
          if (!prev) return prev;
          if (prev.content.some((n) => n.id === newNotif.id)) return prev;
          return {
            ...prev,
            totalElements: prev.totalElements + 1,
            content: [newNotif, ...prev.content],
          };
        });
      } else {
        loadNotifications(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("notifications-updated", handleNotificationsUpdate);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("notifications-updated", handleNotificationsUpdate);
    };
  }, [user, loadNotifications, page, selectedCategory]);

  const handleNotificationSelect = async (notification: NotificationResponse) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            content: prev.content.map((n) =>
              n.id === notification.id
                ? { ...n, read: true, readAt: new Date().toISOString() }
                : n
            ),
          };
        });
        window.dispatchEvent(new CustomEvent("notifications-updated"));
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }

    const targetRoute = notification.targetRoute || resolveNotificationRoute(notification, isSupplier);
    if (targetRoute) {
      router.push(targetRoute);
    }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.map((n) => ({
            ...n,
            read: true,
            readAt: new Date().toISOString(),
          })),
        };
      });
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleArchive = async (notification: NotificationResponse) => {
    try {
      await archiveNotification(notification.id);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.filter((n) => n.id !== notification.id),
          totalElements: Math.max(0, prev.totalElements - 1),
        };
      });
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch (err) {
      console.error("Failed to archive notification", err);
    }
  };

  const handleDelete = async (notification: NotificationResponse) => {
    try {
      await deleteNotification(notification.id);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content.filter((n) => n.id !== notification.id),
          totalElements: Math.max(0, prev.totalElements - 1),
        };
      });
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const rawNotifications = data?.content || [];
  const filteredNotifications = useMemo(() => {
    if (!searchTerm.trim()) return rawNotifications;
    const term = searchTerm.toLowerCase();
    return rawNotifications.filter(
      (n) => n.title.toLowerCase().includes(term) || n.message.toLowerCase().includes(term)
    );
  }, [rawNotifications, searchTerm]);

  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const unreadCountOnPage = rawNotifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-[1240px] mx-auto space-y-5 pb-16 text-[#0F172A]">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Notification Center"
        description="Real-time procurement alerts, commercial quotation updates, order dispatch notices, and compliance messages."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadNotifications(false)}
              disabled={loading}
              className="h-9 px-3.5 bg-white border border-slate-200 hover:bg-[#F8F9FA] text-[#0F172A] rounded-lg transition-colors shadow-2xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5 text-xs font-semibold press-tactile"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={markingAll || unreadCountOnPage === 0}
              className="h-9 px-3.5 bg-white border border-slate-200 hover:bg-[#F8F9FA] text-[#0F172A] rounded-lg transition-colors shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 text-xs font-semibold press-tactile"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#0052CC]" />
              <span>Mark all as read</span>
            </button>
          </div>
        }
      />

      {/* 2. CATEGORY FILTER TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 text-xs">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCategory === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setSelectedCategory(tab.value);
                setPage(0);
              }}
              className={`h-9 px-3.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 press-tactile cursor-pointer ${
                isActive
                  ? "bg-blue-50 text-[#0052CC] border border-blue-200 shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. FILTER BAR & SEARCH */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-tactile-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter notifications by keyword..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-300 rounded-lg text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
          />
        </div>

        {/* Right: Unread Filter, Archive Toggle & Count */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg text-xs border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setFilterUnreadOnly(false);
                setFilterArchivedOnly(false);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                !filterUnreadOnly && !filterArchivedOnly
                  ? "bg-white text-[#0052CC] font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterUnreadOnly(true);
                setFilterArchivedOnly(false);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                filterUnreadOnly && !filterArchivedOnly
                  ? "bg-white text-[#0052CC] font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>Unread</span>
              {unreadCountOnPage > 0 && (
                <span className="text-[10px] font-semibold bg-blue-100 text-[#0052CC] px-1.5 py-0.5 rounded-md">
                  {unreadCountOnPage}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterArchivedOnly(true);
                setFilterUnreadOnly(false);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                filterArchivedOnly
                  ? "bg-white text-[#0052CC] font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Archive className="w-3 h-3" />
              <span>Archived</span>
            </button>
          </div>

          <span className="text-xs text-[#64748B] hidden md:inline">
            Total: <strong className="text-[#0F172A]">{totalElements}</strong>
          </span>
        </div>
      </div>

      {/* 4. MAIN NOTIFICATION LIST */}
      <NotificationList
        notifications={filteredNotifications}
        loading={loading}
        error={error}
        isSupplier={isSupplier}
        onNotificationSelect={handleNotificationSelect}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onRetry={() => loadNotifications(false)}
      />

      {/* 5. SERVER PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#DFE1E6] pt-4">
          <div className="text-xs text-[#5E6C84] font-medium">
            Page {page + 1} of {totalPages} ({totalElements} total notifications)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#091E42] bg-white border border-[#DFE1E6] rounded-lg hover:bg-[#FAFBFC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#091E42] bg-white border border-[#DFE1E6] rounded-lg hover:bg-[#FAFBFC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
