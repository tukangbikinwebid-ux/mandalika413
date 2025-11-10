"use client";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import {
  TextAlignJustifyIcon,
  X,
  Search,
  Newspaper,
  AlertCircle,
  Ticket,
  Mail,
  Instagram,
  Music,
  Twitter,
  Youtube,
  MessageSquare,
  Play,
  Apple,
  Phone,
} from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

interface NavigationData {
  sideNav: {
    navigationLinks: Array<{
      id: number;
      href: string;
      icon: string;
      label: string;
      description: string;
    }>;
    helpSupport: {
      title: string;
      contacts: Array<{
        type: string;
        icon: string;
        label: string;
        value: string;
        description: string;
      }>;
    };
    partnerships: {
      title: string;
      contacts: Array<{
        type: string;
        icon: string;
        label: string;
        value: string;
        description: string;
      }>;
    };
    socialMedia: {
      title: string;
      platforms: Array<{
        name: string;
        icon: string;
        url: string;
        color: string;
        description: string;
      }>;
    };
    downloadApp: {
      title: string;
      apps: Array<{
        name: string;
        icon: string;
        url: string;
        description: string;
        buttonText: string;
        storeName: string;
      }>;
    };
    region: {
      title: string;
      current: {
        country: string;
        currency: string;
        flag: string;
        code: string;
      };
      available: Array<{
        country: string;
        currency: string;
        flag: string;
        code: string;
        active: boolean;
      }>;
    };
  };
}

const SideNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [navigationData, setNavigationData] = useState<NavigationData | null>(
    null
  );

  useEffect(() => {
    const fetchNavigationData = async () => {
      try {
        const response = await fetch("/dummy/navigation-data.json");
        const data = await response.json();
        setNavigationData(data);
      } catch (error) {
        console.error("Error fetching navigation data:", error);
      }
    };

    fetchNavigationData();
  }, []);

  const getIcon = (iconName: string) => {
    const icons: {
      [key: string]: React.ComponentType<{ size?: number; className?: string }>;
    } = {
      Search,
      Newspaper,
      AlertCircle,
      Ticket,
      Mail,
      Instagram,
      Music,
      Twitter,
      Youtube,
      MessageSquare,
      Play,
      Apple,
      Phone,
    };
    return icons[iconName] || Search;
  };

  if (!navigationData) {
    return (
      <SheetPrimitive.Root
        data-slot="sheet"
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SheetPrimitive.Trigger data-slot="sheet-trigger">
          <TextAlignJustifyIcon size={22} strokeWidth={2.5} />
        </SheetPrimitive.Trigger>
      </SheetPrimitive.Root>
    );
  }

  return (
    <SheetPrimitive.Root
      data-slot="sheet"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SheetPrimitive.Trigger data-slot="sheet-trigger">
        <TextAlignJustifyIcon size={22} strokeWidth={2.5} />
      </SheetPrimitive.Trigger>
      <SheetPrimitive.Portal data-slot="sheet-portal">
        <AnimatePresence>
          {isOpen && (
            <SheetPrimitive.Overlay
              data-slot="sheet-overlay"
              className={clsx("fixed inset-0 z-50 bg-black/50")}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full h-full"
              />
            </SheetPrimitive.Overlay>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isOpen && (
            <SheetPrimitive.Content
              data-slot="sheet-content"
              className={clsx(
                "bg-white fixed z-50 flex flex-col w-80 h-full shadow-lg left-0 top-0"
              )}
            >
              <SheetPrimitive.Title className="sr-only">
                Navigation Menu
              </SheetPrimitive.Title>
              <motion.div
                initial={{ x: -320, opacity: 0, scale: 0.95 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -320, opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  scale: { duration: 0.3 },
                }}
                className="flex flex-col h-full p-6 font-mono tracking-wide italic"
              >
                {/* Close Button */}
                <motion.div
                  className="flex justify-end mb-1"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05, duration: 0.3 }}
                >
                  <SheetPrimitive.Close asChild>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      aria-label="Close sidebar"
                    >
                      <motion.div
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <X size={18} className="text-black" />
                      </motion.div>
                    </motion.button>
                  </SheetPrimitive.Close>
                </motion.div>

                {/* Navigation Links */}
                <div className="space-y-3 mb-8">
                  {navigationData.sideNav.navigationLinks.map((link, index) => {
                    const IconComponent = getIcon(link.icon);
                    return (
                      <Link key={link.id} href={link.href}>
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{
                            delay: 0.1 + index * 0.05,
                            duration: 0.3,
                          }}
                          whileHover={{ x: 3, scale: 1.02 }}
                          className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 transition-colors rounded-lg group"
                        >
                          <motion.div
                            className="w-5 h-5 bg-[#C02628] rounded flex items-center justify-center"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <IconComponent size={14} className="text-white" />
                          </motion.div>
                          <div className="flex-1">
                            <span className="sidebar-text font-medium text-black text-sm group-hover:text-red-600 transition-colors">
                              {link.label}
                            </span>
                            <p className="sidebar-text text-xs text-gray-500 mt-0.5">
                              {link.description}
                            </p>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>

                {/* Help & Support */}
                <motion.div
                  className="mb-6"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <h3 className="sidebar-text text-xs font-bold text-black mb-3 tracking-widest uppercase">
                    {navigationData.sideNav.helpSupport.title}
                  </h3>
                  <div className="space-y-2">
                    {navigationData.sideNav.helpSupport.contacts.map(
                      (contact, index) => {
                        const IconComponent = getIcon(contact.icon);
                        return (
                          <motion.a
                            key={index}
                            href={
                              contact.type === "email"
                                ? `mailto:${contact.value}`
                                : contact.type === "whatsapp"
                                ? `https://wa.me/${contact.value.replace(
                                    /[^0-9]/g,
                                    ""
                                  )}`
                                : "#"
                            }
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                              delay: 0.35 + index * 0.05,
                              duration: 0.3,
                            }}
                            whileHover={{ x: 3, scale: 1.02 }}
                            className="flex items-center gap-2 group cursor-pointer"
                          >
                            <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                              <IconComponent
                                size={16}
                                className="text-[#C02628]"
                              />
                            </motion.div>
                            <div>
                              <span className="sidebar-text text-black text-sm group-hover:text-red-600 transition-colors">
                                {contact.value}
                              </span>
                              <p className="sidebar-text text-xs text-gray-500">
                                {contact.description}
                              </p>
                            </div>
                          </motion.a>
                        );
                      }
                    )}
                  </div>
                </motion.div>

                {/* Partnerships */}
                <motion.div
                  className="mb-6"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <h3 className="sidebar-text text-xs font-bold text-black mb-3 tracking-widest uppercase">
                    {navigationData.sideNav.partnerships.title}
                  </h3>
                  <div className="space-y-2">
                    {navigationData.sideNav.partnerships.contacts.map(
                      (contact, index) => {
                        const IconComponent = getIcon(contact.icon);
                        return (
                          <motion.a
                            key={index}
                            href={`mailto:${contact.value}`}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                              delay: 0.45 + index * 0.05,
                              duration: 0.3,
                            }}
                            whileHover={{ x: 3, scale: 1.02 }}
                            className="flex items-center gap-2 group cursor-pointer"
                          >
                            <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                              <IconComponent
                                size={16}
                                className="text-[#C02628]"
                              />
                            </motion.div>
                            <div>
                              <span className="sidebar-text text-black text-sm group-hover:text-red-600 transition-colors">
                                {contact.value}
                              </span>
                              <p className="sidebar-text text-xs text-gray-500">
                                {contact.description}
                              </p>
                            </div>
                          </motion.a>
                        );
                      }
                    )}
                  </div>
                </motion.div>

                {/* Social Media */}
                <motion.div
                  className="mb-6"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <h3 className="sidebar-text text-xs font-bold text-black mb-3 tracking-widest uppercase">
                    {navigationData.sideNav.socialMedia.title}
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {navigationData.sideNav.socialMedia.platforms.map(
                      (platform, index) => {
                        const IconComponent = getIcon(platform.icon);
                        return (
                          <motion.a
                            key={index}
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              delay: 0.55 + index * 0.05,
                              duration: 0.3,
                              type: "spring",
                            }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className={`w-7 h-7 ${platform.color} rounded flex items-center justify-center group`}
                            title={platform.description}
                          >
                            <IconComponent size={14} className="text-white" />
                          </motion.a>
                        );
                      }
                    )}
                  </div>
                </motion.div>

                {/* Download Apps */}
                <motion.div
                  className="mb-6"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  <h3 className="sidebar-text text-xs font-bold text-black mb-3 tracking-widest uppercase">
                    {navigationData.sideNav.downloadApp.title}
                  </h3>
                  <div className="space-y-2">
                    {navigationData.sideNav.downloadApp.apps.map(
                      (app, index) => {
                        const IconComponent = getIcon(app.icon);
                        return (
                          <motion.a
                            key={index}
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              delay: 0.65 + index * 0.05,
                              duration: 0.3,
                            }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-black text-white px-3 py-2 rounded flex items-center gap-2 w-full shadow-lg group"
                          >
                            <motion.div
                              className="w-5 h-5 bg-white rounded flex items-center justify-center"
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              <IconComponent size={12} className="text-black" />
                            </motion.div>
                            <div className="flex flex-col items-start">
                              <span className="sidebar-text text-xs font-medium">
                                {app.buttonText}
                              </span>
                              <span className="sidebar-text text-xs font-bold">
                                {app.storeName}
                              </span>
                            </div>
                          </motion.a>
                        );
                      }
                    )}
                  </div>
                </motion.div>

                {/* Region */}
                <motion.div
                  className="mt-auto"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.3 }}
                >
                  <h3 className="sidebar-text text-xs font-bold text-black mb-3 tracking-widest uppercase">
                    {navigationData.sideNav.region.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-4 h-3 bg-red-500 rounded-sm flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <div className="w-3 h-1 bg-white rounded-sm"></div>
                    </motion.div>
                    <div>
                      <span className="sidebar-text text-black text-sm">
                        {navigationData.sideNav.region.current.country} (
                        {navigationData.sideNav.region.current.currency})
                      </span>
                      <p className="sidebar-text text-xs text-gray-500">
                        {navigationData.sideNav.region.current.flag}{" "}
                        {navigationData.sideNav.region.current.code}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </SheetPrimitive.Content>
          )}
        </AnimatePresence>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
};

export default SideNav;
