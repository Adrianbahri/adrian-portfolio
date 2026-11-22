import type { Metadata } from "next";
import Script from "next/script";
import { Aguafina_Script, Albert_Sans, DM_Mono, Inter } from "next/font/google";
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

const aguafinaScript = Aguafina_Script({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-art-script",
  display: "swap",
});

const albertSans = Albert_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-albert-sans",
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

  // Primary SEO Title & Description on https://dri4n.com directly targeting
  // "Adrian", "Adrian", "Adrian Teknik Informatika", "Adrian Unhas", "Universitas Hasanuddin"
  const siteTitle =
    "Adrian (Dri4n) — Creative Technologist | Teknik Informatika Unhas";
  const siteDescription =
    "Portfolio resmi Adrian (Dri4n) — Mahasiswa Teknik Informatika Universitas Hasanuddin (Unhas), Creative Technologist & Full-Stack Web Developer di Makassar.";
  const socialTitle = "Adrian (Dri4n) — Creative Technologist";
  const socialDescription =
    "Full-stack developer & creative technologist (Teknik Informatika Unhas, Makassar).";

  const primaryUrl = "https://dri4n.com";

  return {
    metadataBase: new URL(primaryUrl),
    alternates: {
      canonical: "/",
    },
    title: {
      default: siteTitle,
      template: "%s | Adrian"
    },
    description: siteDescription,
    keywords: [
      "Adrian",
      "Adrian",
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
    authors: [{ name: "Adrian", url: primaryUrl }],
    creator: "Adrian",
    publisher: "Adrian",
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
      locale: "id_ID",
      alternateLocale: ["en_US"],
      url: primaryUrl,
      title: socialTitle,
      description: socialDescription,
      siteName: "Adrian (Dri4n)",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Adrian (Dri4n) — Creative Technologist & Full-Stack Developer",
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: socialDescription,
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
        "name": "Adrian (Dri4n) — Creative Technologist & Full-Stack Developer",
        "inLanguage": ["id-ID", "en-US"],
        "mainEntity": { "@id": "https://dri4n.com/#person" },
      },
      {
        "@type": "WebSite",
        "@id": "https://dri4n.com/#website",
        "url": "https://dri4n.com",
        "name": "Adrian (Dri4n) Portfolio",
        "alternateName": ["Dri4n", "Adrian", "Adrian Unhas", "Adrian Teknik Informatika"],
        "publisher": { "@id": "https://dri4n.com/#person" },
        "inLanguage": ["id-ID", "en-US"],
      },
      {
        "@type": "Person",
        "@id": "https://dri4n.com/#person",
        "name": "Adrian",
        "givenName": "Adrian",
        "familyName": "Bahri",
        "alternateName": [
          "Adrian",
          "Adrian",
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
          "Adrian (Dri4n) adalah mahasiswa Teknik Informatika Universitas Hasanuddin (Unhas) di Makassar, Creative Technologist, Full-Stack Web Developer, dan Visual Designer di PK Identitas Unhas & UKK Sains Unhas.",
      },
      {
        "@type": "FAQPage",
        "@id": "https://dri4n.com/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Siapa Adrian (Dri4n)?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Adrian (dikenal juga sebagai Adrian atau Dri4n) adalah mahasiswa Teknik Informatika Universitas Hasanuddin (Unhas) di Makassar yang berkarya sebagai Creative Technologist, Full-Stack Web Developer, dan Visual & Brand Designer. Portfolio resminya dapat diakses di https://dri4n.com dan https://dri4n.com/art.",
            },
          },
          {
            "@type": "Question",
            "name": "Adrian kuliah di mana dan jurusan apa?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Adrian menempuh pendidikan di Departemen Teknik Informatika, Fakultas Teknik, Universitas Hasanuddin (Unhas), Makassar, Sulawesi Selatan, serta aktif di PK Identitas Unhas dan UKK Sains Unhas.",
            },
          },
          {
            "@type": "Question",
            "name": "Apa keahlian dan karya Adrian Teknik Informatika Unhas?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Adrian membangun aplikasi web full-stack menggunakan Next.js, TypeScript, React, Flutter, Bun, SQLite, dan Supabase di https://dri4n.com, serta karya visual identity, editorial print, fotografi, dan motion graphics di https://dri4n.com/art.",
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable} ${dmMono.variable} ${aguafinaScript.variable} ${albertSans.variable} font-sans`}>
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className={cn(inter.variable, dmMono.variable, "bg-[var(--color-canvas)] text-[var(--color-on-dark)] font-sans antialiased selection:bg-[var(--color-primary)] selection:text-white")}>
        <Script id="dri4n-theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('theme');var m=document.querySelector('meta[name="color-scheme"]');if(t==='light'){document.documentElement.classList.remove('dark');if(m)m.content='light'}else{document.documentElement.classList.add('dark');if(m)m.content='dark'}if(window.location.pathname==='/'&&!window.location.hash&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&sessionStorage.getItem('dri4n-agent-intro-v4')!=='1'){document.documentElement.setAttribute('data-agent-building','true');setTimeout(function(){document.documentElement.removeAttribute('data-agent-building')},6500)}}catch(e){}`}
        </Script>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
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
