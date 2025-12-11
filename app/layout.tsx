import type { Metadata } from "next";
import { Montserrat, Russo_One } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import ClientAuthGuard from "@/components/client-auth-guards";

const MontserratSans = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const RussoOneMono = Russo_One({
  weight: ["400"],
  variable: "--font-russo-one",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PSAK-413",
  description:
    "Proses ECL, penyesuaian saldo/pinjaman, dan posting GL sesuai PSAK-413 dengan rekonsiliasi real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${MontserratSans.variable} ${RussoOneMono.variable} antialiased`}
      >
        <Providers>
          <ClientAuthGuard
            excludedRoutes={["/auth", "/auth/login", "/public", "/"]}
            excludedFetchPrefixes={["/api/auth/", "/auth/"]}
            loginPath="/auth/login"
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
