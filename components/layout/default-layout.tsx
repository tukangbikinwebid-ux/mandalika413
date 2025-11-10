"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import Header from "./header";

const AUTH_PATH_REGEX =
  /^(?:\/auth\/(?:login|register)|\/(?:login|register))(?:\/|$)/i;

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATH_REGEX.test(pathname || "");
  const [activeTab, setActiveTab] = React.useState("");

  if (isAuthPage) {
    return <SessionProvider>{children}</SessionProvider>;
  }

  return (
    <SessionProvider>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="min-h-screen flex flex-col font-sans">{children}</main>
    </SessionProvider>
  );
};

export default DefaultLayout;