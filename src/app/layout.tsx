import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Fira_Code } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { cn } from "@/lib/utils";
import SmoothScrolling from "@/components/SmoothScrolling";
import GlobalNav from "@/components/GlobalNav";
import GlobalPdfModal from "@/components/GlobalPdfModal";
import { supabase } from "@/lib/supabase";

const firaCode = Fira_Code({ 
  subsets: ["latin"], 
  variable: "--font-fira-code" 
});

export async function generateMetadata(): Promise<Metadata> {
  let heroImage = "/api/assets/uploads/profile-fallback.webp";
  
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value');

    if (data) {
      const settingsMap = data.reduce((acc: any, item: any) => {
        acc[item.key] = item.value;
        return acc;
      }, {});

      if (settingsMap.hero_image) {
        heroImage = settingsMap.hero_image;
      }
    }
  } catch (e) {
    console.error("Error fetching site settings for metadata:", e);
  }

  // Cool, premium title as requested ("Drian — Personal Portfolio")
  const siteTitle = "Drian — Personal Portfolio";
  
  // Custom description using the first paragraph of the About section
  const siteDescription = "I’m an Informatics Engineering student at Hasanuddin University passionate about creative technology, digital experiences, and building intelligent systems through code.";

  return {
    metadataBase: new URL('https://heyyan.vercel.app'),
    title: {
      default: siteTitle,
      template: "%s | Drian"
    },
    description: siteDescription,
    keywords: ["Drian", "Adrian Bahri", "Creative Technologist", "Creative Engineer", "Fullstack Developer", "Web Design", "Next.js", "Supabase", "UI/UX"],
    authors: [{ name: "Drian", url: "https://heyyan.vercel.app" }],
    creator: "Drian",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://heyyan.vercel.app",
      title: siteTitle,
      description: siteDescription,
      siteName: "Drian Portfolio",
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: "Drian Portfolio Preview",
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      creator: "@adrianbahri",
      images: [heroImage],
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
}

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
          <GlobalPdfModal />
          {children}
        </SmoothScrolling>
      </body>
    </html>
  );
}
