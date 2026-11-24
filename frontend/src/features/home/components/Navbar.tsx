"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  FileText,
  Package,
  Building2,
  Search,
  LayoutDashboard,
  Layers,
  FlaskConical,
  Bell,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  ShoppingBag,
  Command,
  SlidersHorizontal,
  Lock,
} from "lucide-react";
import { getAuthUser, logout, AuthUser } from "@/features/auth/api/auth";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { KemKendraLogo } from "@/shared/components/KemkendraLogo";
import { GlobalSearchBar } from "@/features/search/components/SearchSuggestionsDropdown";

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    setUser(getAuthUser());

    const handleAuthChange = () => {
      setUser(getAuthUser());
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 10);

      // Always keep navbar visible near top
      if (currentScrollY <= 40) {
        setIsVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      // Do not toggle while user or mobile menu is active
      if (isUserMenuOpen || isMobileOpen) {
        setIsVisible(true);
        return;
      }

      const delta = currentScrollY - lastScrollYRef.current;
      // Filter out tiny scrolls to prevent jitter
      if (Math.abs(delta) < 8) return;

      if (delta > 0 && currentScrollY > 80) {
        // Scrolled down -> disappear
        setIsVisible(false);
      } else if (delta < 0) {
        // Scrolled up -> appear back slowly with a fade motion
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [isUserMenuOpen, isMobileOpen]);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const handleSignOut = () => {
    logout();
    setUser(null);
    setIsUserMenuOpen(false);
    router.push("/");
  };

  const isAdmin = user?.role === "ADMIN";
  const isSupplier = !isAdmin && user?.role === "SUPPLIER";
  const isBuyer = !isAdmin && !isSupplier && user !== null;

  const publicNavLinks = [
    { name: "Chemical Catalog", href: "/products" },
    { name: "Sourcing Desk", href: "/sourcing" },
    { name: "Categories", href: "/categories" },
    { name: "Verified Suppliers", href: "/suppliers" },
    { name: "Resources", href: "/resources" },
  ];

  const handleOpenCommandPalette = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  const userDisplayName = user?.email ? user.email.split("@")[0] : "Account";
  const avatarLetter = userDisplayName.charAt(0).toUpperCase();
  const rfqHref = user?.role === "BUYER" ? "/dashboard/rfqs" : "/sourcing";

  return (
    <header
      className={`sticky top-0 z-50 h-16 will-change-transform flex items-center transition-all ${
        isVisible
          ? "translate-y-0 opacity-100 duration-500 ease-out"
          : "-translate-y-full opacity-0 pointer-events-none duration-300 ease-in"
      } ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-[0_2px_12px_rgba(15,23,42,0.06)]"
          : "bg-white/85 backdrop-blur-md border-b border-slate-200/70"
      }`}
    >
      <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4 lg:gap-6">
        
        {/* 1. LEFT: BRAND & PRIMARY DIRECTORY */}
        <div className="flex items-center gap-5 lg:gap-7 shrink-0">
          <div className="flex items-center gap-2.5">
            <KemKendraLogo href="/" size="md" layout="horizontal" />
            {user && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                {isAdmin ? "Admin" : isSupplier ? "Supplier" : "Buyer"}
              </span>
            )}
          </div>

          {/* Primary Nav Links with elegant hover animation */}
          <nav className="hidden lg:flex items-center space-x-0.5" aria-label="Global Navigation">
            {publicNavLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`nav-link-hover px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50/80 text-[#0052CC] font-bold border border-blue-200/60 shadow-2xs"
                      : "text-slate-600 hover:text-[#0052CC] hover:bg-slate-100/70"
                  }`}
                >
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 2. CENTER: GLOBAL SEARCH WITH INTEGRATED COMMAND PALETTE (CTRL+K) */}
        <div className="flex-1 max-w-[280px] lg:max-w-[340px] xl:max-w-[440px] mx-auto hidden md:flex items-center min-w-[200px]">
          <div className="w-full">
            <GlobalSearchBar
              size="sm"
              showShortcut={true}
              placeholder="Search chemicals, CAS, supplier..."
            />
          </div>
        </div>

        {/* 3. RIGHT: WORKSPACE CONTROLS & USER CONSOLE */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Request Quote Button */}
          <Link
            href={rfqHref}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-2xs hover:shadow-tactile-card hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] group"
          >
            <span>Request Quote</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>

          {/* Notifications Bell */}
          {mounted && user && (
            <div className="flex items-center">
              <NotificationBell isSupplier={isSupplier} />
            </div>
          )}

          {/* User Workspace Trigger */}
          {mounted && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`h-9 px-2.5 rounded-xl border transition-colors flex items-center gap-2 bg-white hover:bg-slate-50 shadow-2xs focus:outline-none w-[150px] sm:w-[170px] ${
                  isUserMenuOpen ? "border-[#0052CC] ring-1 ring-[#0052CC]/20" : "border-slate-200"
                }`}
                aria-expanded={isUserMenuOpen}
              >
                {/* Monogram Avatar */}
                <div className="w-6 h-6 rounded-lg bg-[#091E42] text-white font-bold text-xs flex items-center justify-center font-mono shrink-0">
                  {avatarLetter}
                </div>

                <div className="flex flex-col items-start text-left min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 leading-tight truncate w-full">
                    {userDisplayName}
                  </span>
                  <span className="text-[9px] font-mono font-semibold text-slate-500 uppercase">
                    {user.role}
                  </span>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
                    isUserMenuOpen ? "rotate-180 text-[#0052CC]" : ""
                  }`}
                />
              </button>

              {/* User Dropdown Console */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-[280px] bg-white rounded-2xl border border-slate-200/90 shadow-tactile-modal p-2 z-50 text-xs divide-y divide-slate-100 animate-enter-fade-down">
                  {/* Account Summary */}
                  <div className="p-3 bg-slate-50 rounded-xl mb-1.5 space-y-2 border border-slate-200/70">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#091E42] text-white font-bold text-xs flex items-center justify-center font-mono shrink-0">
                        {avatarLetter}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-extrabold text-slate-900 block truncate">
                          {userDisplayName}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate font-mono">
                          {user.email}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[10px] font-mono border-t border-slate-200/60">
                      <span className="text-[#0052CC] font-bold uppercase">Role: {user.role}</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active Session
                      </span>
                    </div>
                  </div>

                  {/* Role-Specific Navigation Links */}
                  <div className="py-1.5 space-y-0.5">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 block">
                      Operations Workspace
                    </span>

                    {/* Buyer Links */}
                    {isBuyer && (
                      <>
                        <Link
                          href="/dashboard/buyer"
                          className="flex items-center gap-2.5 px-2.5 py-2 text-slate-700 hover:text-[#091E42] hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs block">Procurement Desk</span>
                            <span className="text-[10px] text-slate-400 block truncate">Manage sourcing activity</span>
                          </div>
                        </Link>

                        <Link
                          href="/dashboard/rfqs"
                          className="flex items-center gap-2.5 px-2.5 py-2 text-slate-700 hover:text-[#091E42] hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FileText className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs block">Sourcing RFQs</span>
                            <span className="text-[10px] text-slate-400 block truncate">Track quotation inquiries</span>
                          </div>
                        </Link>

                        <Link
                          href="/dashboard/orders"
                          className="flex items-center gap-2.5 px-2.5 py-2 text-slate-700 hover:text-[#091E42] hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs block">Purchase Orders</span>
                            <span className="text-[10px] text-slate-400 block truncate">Fulfillment & shipments</span>
                          </div>
                        </Link>

                        <Link
                          href="/dashboard/buyer/shortlist"
                          className="flex items-center gap-2.5 px-2.5 py-2 text-slate-700 hover:text-[#091E42] hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Bookmark className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs block">Saved Offerings</span>
                            <span className="text-[10px] text-slate-400 block truncate">Supplier shortlists</span>
                          </div>
                        </Link>
                      </>
                    )}

                    {/* Supplier Links */}
                    {isSupplier && (
                      <>
                        <Link
                          href="/dashboard/supplier"
                          className="flex items-center gap-2.5 px-2.5 py-2 text-slate-700 hover:text-[#091E42] hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs block">Supplier Operations</span>
                            <span className="text-[10px] text-slate-400 block truncate">Commercial dashboard</span>
                          </div>
                        </Link>

                        <Link
                          href="/dashboard/supplier/products"
                          className="flex items-center gap-2.5 px-2.5 py-2 text-slate-700 hover:text-[#091E42] hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs block">Product Offerings</span>
                            <span className="text-[10px] text-slate-400 block truncate">Catalog & inventory</span>
                          </div>
                        </Link>

                        <Link
                          href="/dashboard/supplier/rfqs"
                          className="flex items-center gap-2.5 px-2.5 py-2 text-slate-700 hover:text-[#091E42] hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FileText className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs block">RFQ Inquiries</span>
                            <span className="text-[10px] text-slate-400 block truncate">Incoming quote requests</span>
                          </div>
                        </Link>

                        <Link
                          href="/dashboard/supplier/verification"
                          className="flex items-center gap-2.5 px-2.5 py-2 text-slate-700 hover:text-[#091E42] hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs block">Verification Status</span>
                            <span className="text-[10px] text-slate-400 block truncate">KYC & statutory audits</span>
                          </div>
                        </Link>
                      </>
                    )}

                    {/* Admin Links */}
                    {isAdmin && (
                      <>
                        <Link
                          href="/dashboard/admin/operations"
                          className="flex items-center gap-2.5 px-2.5 py-2 text-slate-700 hover:text-[#091E42] hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs block">Operations Console</span>
                            <span className="text-[10px] text-slate-400 block truncate">Marketplace health</span>
                          </div>
                        </Link>

                        <Link
                          href="/dashboard/admin/suppliers"
                          className="flex items-center gap-2.5 px-2.5 py-2 text-slate-700 hover:text-[#091E42] hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs block">Supplier Moderation</span>
                            <span className="text-[10px] text-slate-400 block truncate">Due-diligence workspace</span>
                          </div>
                        </Link>

                        <Link
                          href="/dashboard/admin/catalog"
                          className="flex items-center gap-2.5 px-2.5 py-2 text-slate-700 hover:text-[#091E42] hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Layers className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs block">Master Catalog</span>
                            <span className="text-[10px] text-slate-400 block truncate">Monographs & offerings</span>
                          </div>
                        </Link>

                        <Link
                          href="/dashboard/admin/audit"
                          className="flex items-center gap-2.5 px-2.5 py-2 text-slate-700 hover:text-[#091E42] hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FileText className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs block">Audit Ledger</span>
                            <span className="text-[10px] text-slate-400 block truncate">Governance logs</span>
                          </div>
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-1.5">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors text-left font-bold text-xs cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : mounted ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="h-9 px-3.5 text-xs font-bold text-slate-700 hover:text-[#091E42] hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors flex items-center justify-center shadow-2xs"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="h-9 px-3.5 text-xs font-bold text-white bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] rounded-xl transition-colors flex items-center justify-center shadow-2xs active:scale-[0.99]"
              >
                Register
              </Link>
            </div>
          ) : null}

          {/* Mobile Drawer Trigger */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              aria-label="Toggle mobile menu"
            >
              {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-[290px] h-[calc(100vh-64px)] p-4 overflow-y-auto space-y-4 shadow-tactile-modal border-l border-slate-200">
            {/* Search & Quick Command Palette */}
            <div className="space-y-2">
              <GlobalSearchBar
                size="sm"
                placeholder="Search chemical, CAS..."
                onSearchSubmitted={() => setIsMobileOpen(false)}
              />
              <button
                type="button"
                onClick={() => {
                  setIsMobileOpen(false);
                  handleOpenCommandPalette();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 text-[11px] font-medium transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Command className="w-3.5 h-3.5 text-slate-400" />
                  <span>Command Console</span>
                </span>
                <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white border border-slate-200 rounded text-slate-500">
                  Ctrl+K
                </kbd>
              </button>
            </div>

            <div className="space-y-1 border-b border-slate-100 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block px-2 mb-1">
                Marketplace Directory
              </span>
              {publicNavLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block px-2.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0052CC]"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-1">
              <Link
                href={rfqHref}
                className="w-full h-9 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold uppercase tracking-wider rounded-xl inline-flex items-center justify-center gap-1.5 shadow-2xs"
                onClick={() => setIsMobileOpen(false)}
              >
                <span>Request Quote</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
