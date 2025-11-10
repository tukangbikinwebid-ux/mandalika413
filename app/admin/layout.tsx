"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Newspaper,
  Menu,
  X,
  LogOut,
  User,
  Gamepad2,
  ChevronDown,
  Tag,
  Coins,
} from "lucide-react";

/* =============================
   Config & Types
============================= */

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type NavLeaf = {
  name: string;
  href: string;
  icon: IconType;
};

type NavBranch = {
  name: string;
  icon: IconType;
  submenu: NavLeaf[];
};

type NavItem = NavLeaf | NavBranch;

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    name: "Produk",
    icon: Tag,
    submenu: [
      { name: "Produk", href: "/admin/produk", icon: Package },
      { name: "Kategori Produk", href: "/admin/kategori-produk", icon: Tag },
      { name: "Migrasi Produk", href: "/admin/migrasi-produk", icon: Package },
    ],
  },
  { name: "Transaksi", href: "/admin/transaksi", icon: ShoppingCart },
  { name: "Deposit", href: "/admin/deposit", icon: Coins },
  {
    name: "News",
    icon: Newspaper,
    submenu: [
      { name: "Kategori", href: "/admin/news/kategori", icon: Tag },
      { name: "Tags", href: "/admin/news/tags", icon: Tag },
      { name: "News", href: "/admin/news", icon: Newspaper },
    ],
  },
];

/* =============================
   Helpers
============================= */

const spring = { type: "spring", stiffness: 340, damping: 32 } as const;

function classNames(...c: Array<string | false | undefined>) {
  return c.filter(Boolean).join(" ");
}

/* =============================
   Component
============================= */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Load sidebar state
  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved !== null) setSidebarCollapsed(JSON.parse(saved));
  }, []);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem(
      "admin-sidebar-collapsed",
      JSON.stringify(sidebarCollapsed)
    );
  }, [sidebarCollapsed]);

  // Close user menu when clicking outside
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Keyboard support for collapsing & navigating
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "b" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setSidebarCollapsed((v) => !v);
      }
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setUserMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-3">
            Access Denied
          </h1>
          <p className="text-neutral-600 mb-5">
            You need to be logged in to access this page.
          </p>
          <a
            href="/auth/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 shadow-sm hover:brightness-110 transition"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const handleSignOut = () => signOut({ callbackUrl: "/" });

  // Active detection helper
  const isActive = (item: NavItem) => {
    if ("href" in item) return pathname === item.href;
    return item.submenu.some((s) => pathname === s.href);
  };

  // Accent tokens (modern red/rose with subtle glass)
  const asideBase =
    "bg-gradient-to-b from-rose-700/95 via-red-700/95 to-rose-800/95 text-white";
  const asideBorder = "border-r border-white/10";
  const glass = "backdrop-blur-md";
  const subtleRing = "ring-1 ring-white/10";

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-neutral-900/60" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 272 }}
        transition={spring}
        className={classNames(
          "hidden lg:flex fixed inset-y-0 left-0 z-50 flex-col",
          asideBase,
          glass,
          asideBorder,
          subtleRing,
          "shadow-xl"
        )}
        aria-label="Sidebar"
      >
        {/* Brand */}
        <div className="h-16 px-4 flex items-center border-b border-white/10">
          <div className="flex items-center gap-3">
            <Image
              src="/images/kios-tetta.png"
              alt="PSAK-413"
              width={56}
              height={56}
              className="rounded-xl"
            />
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-base font-semibold tracking-wide">
                  PSAK-413
                </h1>
                <p className="text-[11px] text-white/70">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {navigation.map((item) => {
            const active = isActive(item);
            const hasSub = !("href" in item) && item.submenu.length > 0;
            const opened = openSubmenu === item.name;
            const ItemIcon = item.icon;

            return (
              <div key={item.name} className="relative">
                {/* Active rail indicator */}
                <AnimatePresence>
                  {active && !sidebarCollapsed && (
                    <motion.span
                      layoutId="active-rail"
                      className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-white"
                    />
                  )}
                </AnimatePresence>

                {hasSub ? (
                  <button
                    onClick={() => setOpenSubmenu(opened ? null : item.name)}
                    className={classNames(
                      "group w-full select-none grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                      active
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-white/85 hover:bg-white/8 hover:text-white"
                    )}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <ItemIcon className="h-5 w-5 opacity-95" />
                    {!sidebarCollapsed && (
                      <span className="truncate text-left">{item.name}</span>
                    )}
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={false}
                        animate={{ rotate: opened ? 180 : 0 }}
                        className="justify-self-end"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.span>
                    )}

                    {/* Tooltip when collapsed */}
                    {sidebarCollapsed && (
                      <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-neutral-900/95 px-2 py-1 text-xs text-white opacity-0 shadow-lg ring-1 ring-white/10 transition group-hover:opacity-100">
                        {item.name}
                      </span>
                    )}
                  </button>
                ) : (
                  <Link
                    href={(item as NavLeaf).href}
                    className={classNames(
                      "group relative grid grid-cols-[auto_1fr] items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                      active
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-white/85 hover:bg-white/8 hover:text-white"
                    )}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <ItemIcon className="h-5 w-5" />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}

                    {sidebarCollapsed && (
                      <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-neutral-900/95 px-2 py-1 text-xs text-white opacity-0 shadow-lg ring-1 ring-white/10 transition group-hover:opacity-100">
                        {item.name}
                      </span>
                    )}
                  </Link>
                )}

                {/* Submenu */}
                {hasSub && !sidebarCollapsed && (
                  <AnimatePresence initial={false}>
                    {opened && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="ml-3.5 mt-1 space-y-1 border-l border-white/10 pl-3"
                      >
                        {(item as NavBranch).submenu.map((sub) => {
                          const subActive = pathname === sub.href;
                          const SubIcon = sub.icon;
                          return (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className={classNames(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition",
                                subActive
                                  ? "bg-white/10 text-white"
                                  : "text-white/80 hover:bg-white/8 hover:text-white"
                              )}
                            >
                              <SubIcon className="h-4 w-4" />
                              <span className="truncate">{sub.name}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div className="mt-auto border-t border-white/10 p-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/15 grid place-items-center ring-1 ring-white/15">
              <User className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {session?.user?.name}
                </p>
                <p className="truncate text-xs text-white/70">
                  {session?.user?.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        transition={spring}
        className={classNames(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72",
          asideBase,
          glass,
          subtleRing,
          "shadow-2xl"
        )}
      >
        {/* Top */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/15 grid place-items-center ring-1 ring-white/15">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold">PSAK-413</h1>
              <p className="text-[11px] text-white/70">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white/80 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item);
            const hasSub = !("href" in item) && item.submenu.length > 0;
            const opened = openSubmenu === item.name;
            const ItemIcon = item.icon;

            return (
              <div key={item.name} className="relative">
                {hasSub ? (
                  <button
                    onClick={() => setOpenSubmenu(opened ? null : item.name)}
                    className={classNames(
                      "group w-full grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/85 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <ItemIcon className="h-5 w-5" />
                    <span className="truncate text-left">{item.name}</span>
                    <motion.span
                      initial={false}
                      animate={{ rotate: opened ? 180 : 0 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  </button>
                ) : (
                  <Link
                    href={(item as NavLeaf).href}
                    className={classNames(
                      "group grid grid-cols-[auto_1fr] items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/85 hover:bg-white/8 hover:text-white"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <ItemIcon className="h-5 w-5" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )}

                {hasSub && (
                  <AnimatePresence initial={false}>
                    {opened && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3"
                      >
                        {(item as NavBranch).submenu.map((sub) => {
                          const subActive = pathname === sub.href;
                          const SubIcon = sub.icon;
                          return (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className={classNames(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition",
                                subActive
                                  ? "bg-white/10 text-white"
                                  : "text-white/80 hover:bg-white/8 hover:text-white"
                              )}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <SubIcon className="h-4 w-4" />
                              <span className="truncate">{sub.name}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div className="mt-auto border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/15 grid place-items-center ring-1 ring-white/15">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {session?.user?.name}
              </p>
              <p className="truncate text-xs text-white/70">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <div
        className="transition-[margin] duration-300 ease-in-out"
        style={{ marginLeft: sidebarCollapsed ? 72 : 272 }}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 px-4 sm:px-6 lg:px-8">
          {/* Mobile */}
          <button
            title="Open Sidebar"
            type="button"
            className="-m-2.5 p-2.5 text-neutral-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop collapse */}
          <button
            title="Toggle Sidebar (Ctrl/Cmd + B)"
            type="button"
            className="hidden lg:inline-flex -m-2.5 p-2.5 text-neutral-700 hover:text-neutral-900"
            onClick={() => setSidebarCollapsed((v) => !v)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="ml-auto" />

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-rose-600 to-red-600 grid place-items-center text-white">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden lg:block max-w-[160px] truncate">
                {session?.user?.name}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-neutral-900/5"
                >
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
