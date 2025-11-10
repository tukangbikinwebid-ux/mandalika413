import type { Metadata } from "next";
import { Montserrat, Russo_One } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

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
  description: "Top Up Games & Voucher Murah, Aman, Cepat",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
