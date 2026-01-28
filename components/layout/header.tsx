"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Home,
  Zap,
  User,
  ChevronDown,
  ChartArea,
  Bell,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { api, authService } from "@/services/api";

export default function Header({
  activeTab = "dashboard",
  setActiveTab = () => {},
}: {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const toggleProfileDropdown = () => setIsProfileOpen((prev) => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const toggleConfigDropdown = () => setIsConfigOpen((prev) => !prev);

  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // --- Check Notifications untuk Badge ---
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const res = await api.notification.getAll({ page: 1, paginate: 5 });
        if (res.code === 200 && res.data.data) {
          const unread = res.data.data.some((n) => n.read_at === null);
          setHasUnread(unread);
        }
      } catch (error) {
        console.error("Failed to check notifications");
      }
    };

    if (session) {
      checkUnread();
      const interval = setInterval(checkUnread, 60000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Tutup mobile menu ketika pindah halaman/tab
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, activeTab]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout backend failed", error);
    } finally {
      await signOut({ callbackUrl: "/auth/login" });
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    { id: "process", label: "Process", icon: Zap, href: "/process" },
    { id: "post-gl", label: "Posting GL", icon: ChartArea, href: "/post-gl" },
  ] as const;

  const configMenuItems = [
    { label: "Product Categories", href: "/config/product-categories" },
    { label: "Products", href: "/config/products" },
    { label: "Segments", href: "/config/segments" },
    { label: "Stages", href: "/config/stages" },
  ];

  const isPathActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 opacity-90"></div>
      <div className="absolute inset-0 backdrop-blur-xl bg-white/10"></div>

      {/* Content */}
      <div className="relative flex items-center justify-between px-4 md:px-8 py-4 md:py-5">
        {/* Logo */}
        <div className="group cursor-pointer flex-shrink-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
          <div className="relative">
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-2xl tracking-tight">
              PSAK-413
            </h1>
          </div>
        </div>

        {/* Desktop Navigation (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const activeByPath = isPathActive(item.href);
            const isActive = activeByPath || activeTab === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
              >
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? "text-yellow-900 shadow-xl"
                      : "text-white hover:text-yellow-100"
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-white rounded-xl shadow-2xl"></div>
                  )}
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full"></div>
                  )}
                </button>
              </Link>
            );
          })}

          {/* Configuration Dropdown */}
          <div className="relative">
            <button
              onClick={toggleConfigDropdown}
              className={`group relative px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                pathname.startsWith("/config")
                  ? "text-yellow-900 shadow-xl"
                  : "text-white hover:text-yellow-100"
              }`}
            >
              {pathname.startsWith("/config") && (
                <div className="absolute inset-0 bg-white rounded-xl shadow-2xl"></div>
              )}
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Configuration</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isConfigOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {pathname.startsWith("/config") && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full"></div>
              )}
            </button>

            {isConfigOpen && (
              <div className="absolute right-0 mt-3 w-56 origin-top-right animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 shadow-lg"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                  {configMenuItems.map((item, index) => (
                    <Link key={index} href={item.href}>
                      <button
                        onClick={() => setIsConfigOpen(false)}
                        className={`w-full px-5 py-3.5 text-left hover:bg-orange-50 flex items-center gap-3 transition-colors duration-200 font-medium text-sm ${
                          pathname === item.href
                            ? "bg-orange-50 text-orange-600"
                            : "text-gray-700"
                        } ${index !== 0 ? "border-t border-gray-100" : ""}`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            pathname === item.href
                              ? "bg-orange-500"
                              : "bg-gray-300"
                          }`}
                        />
                        <span>{item.label}</span>
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Notif, Profile & Hamburger */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notification Icon */}
          <button
            onClick={() => router.push("/notifications")}
            className="relative p-2 md:p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl border border-white/30 transition-all duration-300 hover:scale-105 shadow-lg group"
          >
            <Bell className="w-5 h-5 text-white group-hover:text-yellow-100" />
            {hasUnread && (
              <span className="absolute top-2 right-2.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={toggleProfileDropdown}
              className="group relative flex items-center gap-2 px-2 py-2 md:px-4 md:py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl border border-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center shadow-inner">
                  <User className="w-4 h-4 text-white" />
                </div>
                {/* Chevron hidden on very small screens to save space */}
                <ChevronDown
                  className={`hidden sm:block w-4 h-4 text-white transition-transform duration-300 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 origin-top-right animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 shadow-lg"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                  <div className="px-5 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-gray-800 text-sm truncate">
                          {session?.user?.name || "User"}
                        </p>
                        <p
                          className="text-xs text-gray-600 truncate"
                          title={session?.user?.email || ""}
                        >
                          {session?.user?.email || "No Email"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full px-5 py-3.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors duration-200 font-medium text-sm group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors duration-200">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hamburger Menu Button (Mobile Only) */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden relative p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl border border-white/30 text-white transition-all duration-300"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu (Slide down) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-t border-white/20 shadow-xl animate-in slide-in-from-top-2 duration-200 z-40">
          <div className="flex flex-col p-4 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const activeByPath = isPathActive(item.href);
              const isActive = activeByPath || activeTab === item.id;

              return (
                <Link key={item.id} href={item.href}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-orange-50 text-orange-600 border border-orange-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? "text-orange-500" : "text-gray-400"
                      }`}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-orange-500"></div>
                    )}
                  </button>
                </Link>
              );
            })}

            {/* Configuration Section in Mobile */}
            <div className="pt-2 mt-2 border-t border-gray-200">
              <button
                onClick={toggleConfigDropdown}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-5 h-5 text-gray-400" />
                <span>Configuration</span>
                <ChevronDown
                  className={`w-4 h-4 ml-auto transition-transform duration-300 ${
                    isConfigOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isConfigOpen && (
                <div className="mt-2 ml-4 space-y-1">
                  {configMenuItems.map((item, index) => (
                    <Link key={index} href={item.href}>
                      <button
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                          pathname === item.href
                            ? "bg-orange-50 text-orange-600"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            pathname === item.href
                              ? "bg-orange-500"
                              : "bg-gray-300"
                          }`}
                        />
                        <span>{item.label}</span>
                      </button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Glow Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
    </div>
  );
}