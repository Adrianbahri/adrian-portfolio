import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { cn } from "@/lib/utils";
import SmoothScrolling from "@/components/SmoothScrolling";
import GlobalNav from "@/components/GlobalNav";

export const metadata: Metadata = {
  title: "Portfolio | Adrian Bahri",
  description: "A modern editorial portfolio",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={cn(GeistSans.variable, GeistMono.variable, "bg-[var(--color-canvas)] text-[var(--color-on-dark)] antialiased selection:bg-[var(--color-primary)] selection:text-white")}>
        {/* Global Background Layer */}
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <div className="absolute inset-0 blueprint-grid" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-canvas)]/50 to-[var(--color-canvas)]" />
        </div>

        {/* Top Fade Gradient Mask (Melebur Effect) */}
        <div className="fixed top-0 inset-x-0 h-32 bg-gradient-to-b from-[var(--color-canvas)] to-transparent z-[80] pointer-events-none" />

        <SmoothScrolling>
          <GlobalNav />
          {children}
        </SmoothScrolling>
      </body>
    </html>
  );
}
