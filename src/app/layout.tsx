import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Fira_Code } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { cn } from "@/lib/utils";
import SmoothScrolling from "@/components/SmoothScrolling";
import GlobalNav from "@/components/GlobalNav";

const firaCode = Fira_Code({ 
  subsets: ["latin"], 
  variable: "--font-fira-code" 
});

export const metadata: Metadata = {
  metadataBase: new URL('https://adrianbahri.com'),
  title: {
    default: "Adrian Bahri — Creative Technologist & Developer",
    template: "%s | Adrian Bahri"
  },
  description: "Professional portfolio of Adrian Bahri showcasing premium digital experiences, creative engineering, interactive design, and technical storytelling.",
  keywords: ["Adrian Bahri", "Creative Technologist", "Creative Engineer", "Fullstack Developer", "Web Design", "Next.js", "Supabase", "UI/UX"],
  authors: [{ name: "Adrian Bahri", url: "https://adrianbahri.com" }],
  creator: "Adrian Bahri",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://adrianbahri.com",
    title: "Adrian Bahri — Creative Technologist & Developer",
    description: "Professional portfolio of Adrian Bahri showcasing premium digital experiences, creative engineering, interactive design, and technical storytelling.",
    siteName: "Adrian Bahri Portfolio",
    images: [
      {
        url: "/api/assets/uploads/profile-fallback.webp",
        width: 1200,
        height: 630,
        alt: "Adrian Bahri Portfolio Preview",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Adrian Bahri — Creative Technologist & Developer",
    description: "Professional portfolio of Adrian Bahri showcasing premium digital experiences, creative engineering, interactive design, and technical storytelling.",
    creator: "@adrianbahri",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${firaCode.variable}`}>
      <body className={cn(GeistSans.variable, GeistMono.variable, firaCode.variable, "bg-[var(--color-canvas)] text-[var(--color-on-dark)] antialiased selection:bg-[var(--color-primary)] selection:text-white")}>
        {/* Global Background Layer */}
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <div className="absolute inset-0 blueprint-grid" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-canvas)]/50 to-[var(--color-canvas)]" />
        </div>

        <SmoothScrolling>
          <Suspense fallback={null}>
            <GlobalNav />
          </Suspense>
          {children}
        </SmoothScrolling>
      </body>
    </html>
  );
}
