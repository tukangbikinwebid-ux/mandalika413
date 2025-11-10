"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, Zap, User, ChevronDown } from "lucide-react";

const handleLogout = () => {
  alert("Logout");
};

export default function Header({
  activeTab = "dashboard",
  setActiveTab = () => {},
}: {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const toggleProfileDropdown = () => setIsProfileOpen((prev) => !prev);

  const pathname = usePathname();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/" },
    { id: "process", label: "Process", icon: Zap, href: "/process" },
  ] as const;

  // Helper: tentukan active berdasar URL
  const isPathActive = (href: string) => {
    if (href === "/") return pathname === "/";
    // aktif untuk /process dan sub-route /process/*
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Gradient Background with Blur */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 opacity-90"></div>
      <div className="absolute inset-0 backdrop-blur-xl bg-white/10"></div>

      {/* Content */}
      <div className="relative flex items-center justify-between px-8 py-5">
        {/* Logo with Glow Effect */}
        <div className="group cursor-pointer">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
          <div className="relative">
            <h1 className="text-3xl font-black bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-2xl tracking-tight">
              PSAK-413
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const activeByPath = isPathActive(item.href);
            // fallback ke prop activeTab kalau perlu (opsional)
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
                  {/* Active Background */}
                  {isActive && (
                    <div className="absolute inset-0 bg-white rounded-xl shadow-2xl"></div>
                  )}

                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Content */}
                  <div className="relative flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full"></div>
                  )}
                </button>
              </Link>
            );
          })}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={toggleProfileDropdown}
            className="group relative flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl border border-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center shadow-inner">
                <User className="w-4 h-4 text-white" />
              </div>
              <ChevronDown
                className={`w-4 h-4 text-white transition-transform duration-300 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 origin-top-right animate-in fade-in zoom-in-95 duration-200">
              <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 shadow-lg"></div>

              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="px-5 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        John Doe
                      </p>
                      <p className="text-xs text-gray-600">
                        john.doe@example.com
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
      </div>

      {/* Bottom Glow Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
    </div>
  );
}