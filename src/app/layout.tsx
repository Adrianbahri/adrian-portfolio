import type { Metadata } from "next";
import { DM_Mono, Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { cn } from "@/lib/utils";
import GlobalNav from "@/components/GlobalNav";
import GlobalPdfModal from "@/components/GlobalPdfModal";
import AuthRecoveryHandler from "@/components/AuthRecoveryHandler";
import { supabase } from "@/lib/supabase";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ProjectModeProvider } from "@/context/ProjectModeContext";

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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

  // Clean, simple title & description tailored for crisp social/WhatsApp link previews
  const siteTitle = "Adrian Bahri (Dri4n) — Creative Technologist";
  const siteDescription = "Full-stack developer & creative technologist based in Makassar. Building fast, expressive digital systems.";

  const primaryUrl = "https://dri4n.com";

  return {
    metadataBase: new URL(primaryUrl),
    alternates: {
      canonical: "/",
    },
    title: {
      default: siteTitle,
      template: "%s | Adrian Bahri"
    },
    description: siteDescription,
    keywords: [
      "Adrian",
      "Adrian Bahri",
      "Dri4n",
      "Drian",
      "Adrian Teknik Informatika",
      "Adrian Unhas",
      "Adrian Universitas Hasanuddin",
      "Adrian Teknik Informatika Unhas",
      "Adrian Informatika Unhas",
      "Adrian PK Identitas Unhas",
      "Adrian UKK Sains Unhas",
      "Mahasiswa Teknik Informatika Unhas",
      "Web Developer Makassar",
      "Full Stack Developer Makassar",
      "Creative Technologist Indonesia",
      "Visual Designer Makassar",
      "Informatics Engineering Hasanuddin University",
      "Next.js",
      "TypeScript",
      "Bun",
      "SQLite",
      "Supabase",
      "UI/UX Design",
    ],
    authors: [{ name: "Adrian Bahri", url: primaryUrl }],
    creator: "Adrian Bahri",
    publisher: "Adrian Bahri",
    category: "technology",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.png", type: "image/png" }
      ],
      apple: "/favicon.png",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: primaryUrl,
      title: siteTitle,
      description: siteDescription,
      siteName: "Adrian Bahri Portfolio",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Adrian Bahri Portfolio Preview",
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      creator: "@adrianbahri",
      images: ["/opengraph-image"],
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": "https://dri4n.com/#profilepage",
        "url": "https://dri4n.com",
        "name": "Adrian Bahri (Dri4n) — Creative Technologist & Full-Stack Developer",
        "inLanguage": ["id-ID", "en-US"],
        "mainEntity": { "@id": "https://dri4n.com/#person" },
      },
      {
        "@type": "WebSite",
        "@id": "https://dri4n.com/#website",
        "url": "https://dri4n.com",
        "name": "Adrian Bahri (Dri4n) Portfolio",
        "alternateName": ["Dri4n", "Adrian Bahri", "Adrian Unhas", "Adrian Teknik Informatika"],
        "publisher": { "@id": "https://dri4n.com/#person" },
        "inLanguage": ["id-ID", "en-US"],
      },
      {
        "@type": "Person",
        "@id": "https://dri4n.com/#person",
        "name": "Adrian Bahri",
        "givenName": "Adrian",
        "familyName": "Bahri",
        "alternateName": [
          "Adrian",
          "Adrian Bahri",
          "Dri4n",
          "Drian",
          "adrianbahri",
          "Adrian Unhas",
          "Adrian Teknik Informatika",
          "Adrian Teknik Informatika Unhas",
          "Adrian Universitas Hasanuddin",
        ],
        "url": "https://dri4n.com",
        "image": "https://dri4n.com/opengraph-image",
        "jobTitle": [
          "Creative Technologist",
          "Full-Stack Web Developer",
          "Visual & Brand Designer",
          "Mahasiswa Teknik Informatika Universitas Hasanuddin (Unhas)",
        ],
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Makassar",
          "addressRegion": "Sulawesi Selatan",
          "addressCountry": "ID",
        },
        "affiliation": [
          {
            "@type": "CollegeOrUniversity",
            "name": "Universitas Hasanuddin (Unhas)",
            "alternateName": ["Hasanuddin University", "Unhas", "Teknik Informatika Unhas"],
            "sameAs": "https://unhas.ac.id",
            "department": {
              "@type": "Organization",
              "name": "Departemen Teknik Informatika, Fakultas Teknik Universitas Hasanuddin",
            },
          },
          {
            "@type": "Organization",
            "name": "PK Identitas Unhas",
            "description": "Penerbitan Kampus Identitas Universitas Hasanuddin",
          },
          {
            "@type": "Organization",
            "name": "UKK Sains Unhas",
            "description": "Unit Kegiatan Khusus Sains Universitas Hasanuddin",
          },
        ],
        "alumniOf": {
          "@type": "CollegeOrUniversity",
          "name": "Universitas Hasanuddin (Unhas)",
          "sameAs": "https://unhas.ac.id",
        },
        "knowsAbout": [
          "Teknik Informatika",
          "Informatics Engineering",
          "Software Engineering",
          "Full-Stack Web Development",
          "Creative Technology",
          "Next.js",
          "React",
          "TypeScript",
          "Bun",
          "SQLite",
          "Supabase",
          "UI/UX Design",
          "Brand & Visual Identity",
          "Editorial Design",
          "Motion Graphics",
        ],
        "sameAs": [
          "https://dri4n.com",
          "https://dri4n.com/art",
          "https://github.com/Adrianbahri",
          "https://linkedin.com/in/adrianbahri",
          "https://instagram.com/adrianbahri",
        ],
        "description":
          "Adrian Bahri (Dri4n) adalah mahasiswa Teknik Informatika Universitas Hasanuddin (Unhas) di Makassar, Creative Technologist, Full-Stack Web Developer, dan Visual Designer di PK Identitas Unhas & UKK Sains Unhas.",
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable} ${dmMono.variable} font-sans`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={cn(inter.variable, dmMono.variable, "bg-[var(--color-canvas)] text-[var(--color-on-dark)] font-sans antialiased selection:bg-[var(--color-primary)] selection:text-white")}>
        <ProjectModeProvider>
          <Suspense fallback={null}>
            <AuthRecoveryHandler />
            <GlobalNav />
          </Suspense>
          <GlobalPdfModal />
          {children}
          <Analytics />
          <SpeedInsights />
        </ProjectModeProvider>
      </body>
    </html>
  );
}
