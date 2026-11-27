"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Package,
  Building2,
  Users,
  ShoppingCart,
  LogOut,
  Shield,
  Menu,
  X,
  Hexagon,
  Bell,
  FlaskConical,
  ShieldCheck,
  FileCheck,
  Layers,
  ArrowUpRight,
  Activity,
  Bookmark,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Sliders,
  Megaphone,
  Tag,
  SlidersHorizontal,
  Receipt,
  AlertCircle,
  Mail,
  TrendingUp,
} from "lucide-react";
import { getAuthUser, logout, AuthUser } from "@/features/auth/api/auth";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { useUnreadNotificationCount } from "@/features/notifications/hooks/useUnreadNotificationCount";
import { KemKendraLogo } from "@/shared/components/KemkendraLogo";

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string;
  isExternal?: boolean;
}

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { unreadCount } = useUnreadNotificationCount();

  useEffect(() => {
    setMounted(true);
    const currentUser = getAuthUser();
    if (!currentUser) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Admin Route Protection Guard
    if (pathname.startsWith("/dashboard/admin") && currentUser.role !== "ADMIN") {
      if (currentUser.role === "SUPPLIER") {
        router.push("/dashboard/supplier");
      } else {
        router.push("/dashboard");
      }
      return;
    }

    // Supplier Route Protection Guard (Buyer or Admin cannot enter supplier onboarding)
    if (pathname.startsWith("/dashboard/supplier") && currentUser.role !== "SUPPLIER") {
      if (currentUser.role === "ADMIN") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/buyer");
      }
      return;
    }

    setUser(currentUser);

    const handleAuthChange = () => {
      const updated = getAuthUser();
      if (!updated) {
        router.push("/login");
      } else {
        if (pathname.startsWith("/dashboard/admin") && updated.role !== "ADMIN") {
          if (updated.role === "SUPPLIER") {
            router.push("/dashboard/supplier");
          } else {
            router.push("/dashboard");
          }
          return;
        }
        setUser(updated);
      }
    };

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [router, pathname]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleSignOut = () => {
    logout();
    router.push("/");
  };

  if (!mounted || !user) {
    return (
      <div className="h-screen w-screen bg-[#F4F5F7] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0052CC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user.role === "ADMIN" || pathname.startsWith("/dashboard/admin");
  const isSupplier = !isAdmin && (user.role === "SUPPLIER" || pathname.startsWith("/dashboard/supplier"));

  const buyerNavSections: NavSection[] = [
    {
      title: "OPERATIONS",
      items: [
        {
          name: "Procurement Desk",
          href: "/dashboard/buyer",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          name: "KemKendra Sourcing",
          href: "/dashboard/buyer/sourcing",
          icon: FlaskConical,
        },
        {
          name: "My Sourcing RFQs",
          href: "/dashboard/rfqs",
          icon: FileText,
        },
        {
          name: "Purchase Orders",
          href: "/dashboard/orders",
          icon: ShoppingCart,
        },
        {
          name: "Invoices & Payments",
          href: "/dashboard/buyer/invoices",
          icon: Receipt,
        },
        {
          name: "Commercial Disputes",
          href: "/dashboard/buyer/disputes",
          icon: AlertCircle,
        },
        {
          name: "Saved Shortlists",
          href: "/dashboard/buyer/shortlist",
          icon: Bookmark,
        },
        {
          name: "Procurement Analytics",
          href: "/dashboard/buyer/analytics",
          icon: TrendingUp,
        },
      ],
    },
    {
      title: "COMMUNICATION",
      items: [
        {
          name: "Notifications",
          href: "/dashboard/notifications",
          icon: Bell,
        },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        {
          name: "Account Settings",
          href: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ];

  const supplierNavSections: NavSection[] = [
    {
      title: "OPERATIONS",
      items: [
        {
          name: "Supplier Operations",
          href: "/dashboard/supplier",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          name: "Product Offerings",
          href: "/dashboard/supplier/products",
          icon: Package,
        },
        {
          name: "RFQ Inquiries",
          href: "/dashboard/supplier/rfqs",
          icon: FileText,
        },
        {
          name: "Purchase Orders",
          href: "/dashboard/supplier/orders",
          icon: ShoppingCart,
        },
        {
          name: "Invoices & Tax",
          href: "/dashboard/supplier/invoices",
          icon: Receipt,
        },
        {
          name: "Disputes & Claims",
          href: "/dashboard/supplier/disputes",
          icon: AlertCircle,
        },
        {
          name: "Performance & Analytics",
          href: "/dashboard/supplier/analytics",
          icon: TrendingUp,
        },
      ],
    },
    {
      title: "ORGANIZATION",
      items: [
        {
          name: "Company Profile",
          href: "/dashboard/supplier/profile",
          icon: Building2,
        },
        {
          name: "Documents Vault",
          href: "/dashboard/supplier/documents",
          icon: FileCheck,
        },
        {
          name: "Compliance & Verification",
          href: "/dashboard/supplier/verification",
          icon: ShieldCheck,
        },
        {
          name: "Account Settings",
          href: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
    {
      title: "COMMUNICATION",
      items: [
        {
          name: "Notifications",
          href: "/dashboard/notifications",
          icon: Bell,
        },
      ],
    },
  ];

  const adminNavSections: NavSection[] = [
    {
      title: "OPERATIONS",
      items: [
        {
          name: "Command Center",
          href: "/dashboard/admin",
          icon: Activity,
          exact: true,
        },
        {
          name: "Analytics & Reports",
          href: "/dashboard/admin/analytics",
          icon: TrendingUp,
        },
        {
          name: "Operations Console",
          href: "/dashboard/admin/operations",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          name: "Marketplace Hub",
          href: "/dashboard/admin/marketplace",
          icon: ShoppingBag,
        },
        {
          name: "User Administration",
          href: "/dashboard/admin/users",
          icon: Users,
        },
        {
          name: "Sourcing Desk",
          href: "/dashboard/admin/sourcing",
          icon: FlaskConical,
        },
        {
          name: "RFQ Oversight",
          href: "/dashboard/admin/transactions/rfqs",
          icon: FileText,
        },
        {
          name: "Order Oversight",
          href: "/dashboard/admin/transactions/orders",
          icon: ShoppingCart,
        },
        {
          name: "Invoice Oversight",
          href: "/dashboard/admin/transactions/invoices",
          icon: Receipt,
        },
        {
          name: "Dispute Oversight",
          href: "/dashboard/admin/transactions/disputes",
          icon: AlertCircle,
        },
      ],
    },
    {
      title: "GOVERNANCE",
      items: [
        {
          name: "Account Governance",
          href: "/dashboard/admin/account-governance",
          icon: ShieldAlert,
        },
        {
          name: "Supplier Moderation",
          href: "/dashboard/admin/suppliers",
          icon: Building2,
        },
        {
          name: "Supplier Verification",
          href: "/dashboard/admin/suppliers/quality",
          icon: ShieldCheck,
        },
        {
          name: "Document Compliance",
          href: "/dashboard/admin/compliance",
          icon: FileCheck,
        },
        {
          name: "Catalog Taxonomy",
          href: "/dashboard/admin/taxonomy",
          icon: Tag,
        },
        {
          name: "Announcements",
          href: "/dashboard/admin/announcements",
          icon: Megaphone,
        },
      ],
    },
    {
      title: "CATALOG",
      items: [
        {
          name: "Master Catalog",
          href: "/dashboard/admin/catalog",
          icon: Layers,
        },
        {
          name: "Offering Review",
          href: "/dashboard/admin/catalog/offerings",
          icon: Package,
        },
      ],
    },
    {
      title: "CONFIGURATION",
      items: [
        {
          name: "Platform Policies",
          href: "/dashboard/admin/settings",
          icon: Sliders,
        },
        {
          name: "Feature Controls",
          href: "/dashboard/admin/feature-controls",
          icon: SlidersHorizontal,
        },
      ],
    },
    {
      title: "AUDIT & SECURITY",
      items: [
        {
          name: "Audit & Governance",
          href: "/dashboard/admin/audit",
          icon: ShieldCheck,
        },
        {
          name: "Activity Trail",
          href: "/dashboard/admin/activity",
          icon: Activity,
        },
        {
          name: "Notifications",
          href: "/dashboard/notifications",
          icon: Bell,
        },
        {
          name: "Delivery Logs",
          href: "/dashboard/admin/notifications/logs",
          icon: Mail,
        },
      ],
    },
  ];

  const navSections = isAdmin
    ? adminNavSections
    : isSupplier
    ? supplierNavSections
    : buyerNavSections;

  const workspaceLabel = isAdmin
    ? "ADMIN OPERATIONS"
    : isSupplier
    ? "SUPPLIER OPERATIONS"
    : "BUYER PROCUREMENT";

  const userDisplayName = user.email.split("@")[0];

  return (
    <div className="h-screen w-screen bg-[#FAFAFA] flex flex-col font-sans text-[#0F172A] overflow-hidden">
      {/* 1. FIXED TOP HEADER (64px) */}
      <header className="shrink-0 z-40 bg-white border-b border-[#E4E4E7] h-[64px] flex items-center justify-between px-4 sm:px-6">
        {/* Left Brand & Workspace Identity */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 text-[#64748B] hover:bg-[#F4F4F5] rounded-[6px] focus:outline-none cursor-pointer"
            aria-label="Toggle Sidebar Navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <KemKendraLogo
              href="/"
              size="md"
              layout="horizontal"
            />
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              {isAdmin ? "Admin" : isSupplier ? "Supplier" : "Buyer"}
            </span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0052CC] hover:underline px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Catalog</span>
            <ArrowUpRight className="w-3 h-3 text-slate-500" />
          </Link>

          <div className="h-4 w-px bg-slate-200" />

          <NotificationBell isSupplier={isSupplier} />

          <div className="h-4 w-px bg-slate-200" />

          {/* User Account / Role Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-end text-right">
              <span className="text-xs font-semibold text-slate-900 leading-tight max-w-[100px] sm:max-w-[140px] truncate">
                {userDisplayName}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                {user.role}
              </span>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <Link
              href="/dashboard/settings"
              className="p-1.5 text-slate-500 hover:text-[#0052CC] hover:bg-slate-100 rounded-md transition-colors"
              title="Account Settings"
              aria-label="Account Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>

            <button
              onClick={handleSignOut}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY (FIXED SIDEBAR + INDEPENDENTLY SCROLLABLE CONTENT) */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            aria-hidden="true"
          />
        )}

        {/* FIXED DESKTOP SIDEBAR / MOBILE DRAWER (260px) */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-[260px] bg-white border-r border-[#E4E4E7] transform transition-transform duration-150 ease-in-out lg:translate-x-0 lg:static flex flex-col shrink-0 ${
            sidebarOpen ? "translate-x-0 top-[64px] h-[calc(100vh-64px)] shadow-tactile-modal" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Scrollable Navigation Groups */}
          <div className="flex-1 py-4 px-3 overflow-y-auto space-y-5">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {section.title && (
                  <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] block mb-1 font-mono">
                    {section.title}
                  </span>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isNotificationItem = item.href === "/dashboard/notifications";
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href) && item.href !== "/dashboard" && item.href !== "/dashboard/admin";

                    const itemAriaLabel = isNotificationItem && unreadCount > 0
                      ? `${item.name}, ${unreadCount} unread`
                      : item.name;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        aria-label={itemAriaLabel}
                        className={`group flex items-center justify-between px-3 h-9 rounded-md text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-slate-100 text-slate-900 font-semibold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? "text-[#0052CC]" : "text-slate-400 group-hover:text-slate-900"
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>

                        {/* Unread Counter Badge */}
                        {isNotificationItem && unreadCount > 0 ? (
                          <span
                            className={`inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 text-[10px] font-semibold rounded transition-colors ${
                              isActive
                                ? "bg-[#0052CC] text-white"
                                : "bg-slate-200 text-slate-800"
                            }`}
                          >
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        ) : item.badge ? (
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase ${
                              isActive
                                ? "bg-white text-slate-900 border-slate-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* FIXED SYSTEM STATUS FOOTER */}
          <div className="p-3 border-t border-[#E4E4E7] bg-white text-[11px] text-[#64748B] space-y-0.5 shrink-0">
            <div className="font-semibold text-[#0F172A]">KemKendra Industrial</div>
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span>Production Environment</span>
              <span className="text-[#059669] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                Live
              </span>
            </div>
          </div>
        </aside>

        {/* INDEPENDENTLY SCROLLABLE MAIN CONTENT PANE (Fluid Responsive Padding) */}
        <main className="flex-1 min-w-0 bg-[#FAFAFA] p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
