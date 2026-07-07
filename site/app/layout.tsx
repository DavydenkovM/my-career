import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CV — Mikhail Davydenkov",
  description:
    "Head of Mobile Engineering / Platform Architect. 15+ years in EdTech, FinTech, Mobile Services and Aerospace.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
