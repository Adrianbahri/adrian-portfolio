import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export const metadata: Metadata = {
  title: "About Adrian Bahri (Dri4n)",
  description: "Learn more about Adrian Bahri (Dri4n), a creative technologist, full-stack developer, and digital storyteller based in Indonesia.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Adrian Bahri",
    "alternateName": ["Dri4n", "Drian", "adrianbahri"],
    "url": "https://dri4n.com/about",
    "image": "https://dri4n.com/api/assets/uploads/profile-fallback.webp",
    "jobTitle": "Creative Technologist & Full Stack Developer",
    "worksFor": [
      {
        "@type": "Organization",
        "name": "PK Identitas Unhas",
        "role": "Research & Development (Data & Technology)"
      },
      {
        "@type": "Organization",
        "name": "SulawesiPos.com",
        "role": "Media Production"
      }
    ],
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": "Hasanuddin University",
      "department": {
        "@type": "Organization",
        "name": "Informatics Engineering"
      }
    },
    "knowsAbout": [
      "Software Engineering",
      "Full-stack Web Development",
      "Creative Technology",
      "Next.js",
      "React",
      "TypeScript",
      "Supabase",
      "UI/UX Design",
      "Motion Graphics"
    ],
    "sameAs": [
      "https://github.com/Adrianbahri",
      "https://linkedin.com/in/adrianbahri"
    ],
    "description": "Adrian Bahri (Dri4n) is an Indonesian creative technologist, developer, and digital storyteller who designs and builds high-performance intelligent web applications, automated media workflows, and elegant user interfaces."
  };

  return (
    <main className="min-h-screen bg-transparent pb-24 relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="section-container relative z-10 pt-24 max-w-4xl mx-auto">
        
        {/* Navigation Link Back */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-body-muted hover:text-on-dark transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* Header Section */}
        <header className="mb-12 space-y-4">
          <p className="eyebrow text-primary">Biographical Profile</p>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-on-dark font-heading leading-tight">
            About Adrian Bahri <span className="text-body-muted font-light">(Dri4n)</span>
          </h1>
          <p className="text-lg text-body-muted font-sans font-light leading-relaxed max-w-2xl">
            Creative technologist, software engineer, and media developer based in Makassar, Indonesia.
          </p>
        </header>

        {/* Content Section */}
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] border-t border-border-subtle pt-12">
          
          {/* Main Biography */}
          <article className="space-y-6 text-base leading-relaxed text-on-dark/80 font-sans font-light">
            <p>
              <strong>Adrian Bahri</strong> (widely known in the digital ecosystem as <strong>Dri4n</strong>) is an Indonesian creative technologist, developer, and digital storyteller. Currently studying Informatics Engineering at Hasanuddin University, he operates at the unique intersection of software engineering, creative design, and automated systems.
            </p>
            <p>
              His work ranges from engineering production-grade web applications utilizing <strong>Next.js</strong>, <strong>React</strong>, and <strong>Supabase</strong>, to configuring automated editorial systems and crafting dynamic motion designs.
            </p>
            <p>
              Through his positions as a Research & Development developer at <em>PK Identitas Unhas</em> and media producer at <em>SulawesiPos.com</em>, Adrian builds tools and architectures that streamline workflows, leverage data intelligence, and optimize user experience.
            </p>

            <div className="border-t border-border-subtle pt-6 mt-8 space-y-4">
              <h2 className="font-heading text-xl font-medium tracking-tight text-on-dark">Core Focus & Philosophy</h2>
              <p>
                Believing that technology is most powerful when it feels alive and intuitive, Adrian strives for micro-animations, clean semantics, extreme speed, and accessible experiences (a11y). Every line of code is structured to prioritize visual excellence and bulletproof architecture.
              </p>
            </div>
          </article>

          {/* Quick Facts & Metadata Sidebar */}
          <aside className="space-y-8 lg:border-l lg:border-border-subtle lg:pl-8">
            
            {/* Quick Metadata */}
            <div className="space-y-3">
              <p className="eyebrow">Quick Facts</p>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-body-muted inline font-mono uppercase tracking-wider text-[10px]">Name: </dt>
                  <dd className="text-on-dark inline">Adrian Bahri (Dri4n)</dd>
                </div>
                <div>
                  <dt className="text-body-muted inline font-mono uppercase tracking-wider text-[10px]">Based in: </dt>
                  <dd className="text-on-dark inline">Makassar, Indonesia</dd>
                </div>
                <div>
                  <dt className="text-body-muted inline font-mono uppercase tracking-wider text-[10px]">Education: </dt>
                  <dd className="text-on-dark inline">Informatics Engineering, Hasanuddin University</dd>
                </div>
                <div>
                  <dt className="text-body-muted inline font-mono uppercase tracking-wider text-[10px]">Focus: </dt>
                  <dd className="text-on-dark inline">Creative Tech, Automation, Web Apps</dd>
                </div>
              </dl>
            </div>

            {/* Social Anchors to build Knowledge Consistency */}
            <div className="space-y-4 pt-4 border-t border-border-subtle">
              <p className="eyebrow">Connect & Verify</p>
              <div className="flex flex-col gap-3">
                <a 
                  href="https://github.com/Adrianbahri" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-surface-100 hover:bg-surface-200 border border-border-subtle hover:border-white/20 rounded transition-all text-xs font-mono uppercase tracking-widest group"
                >
                  <span className="flex items-center gap-2 text-body-muted group-hover:text-on-dark"><FaGithub size={14} /> GitHub</span>
                  <ExternalLink size={12} className="text-body-muted/40 group-hover:text-on-dark transition-colors" />
                </a>
                <a 
                  href="https://linkedin.com/in/adrianbahri" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-surface-100 hover:bg-surface-200 border border-border-subtle hover:border-white/20 rounded transition-all text-xs font-mono uppercase tracking-widest group"
                >
                  <span className="flex items-center gap-2 text-body-muted group-hover:text-on-dark"><FaLinkedin size={14} /> LinkedIn</span>
                  <ExternalLink size={12} className="text-body-muted/40 group-hover:text-on-dark transition-colors" />
                </a>
                <a 
                  href="mailto:contact@dri4n.com" 
                  className="flex items-center justify-between p-3 bg-surface-100 hover:bg-surface-200 border border-border-subtle hover:border-white/20 rounded transition-all text-xs font-mono uppercase tracking-widest group"
                >
                  <span className="flex items-center gap-2 text-body-muted group-hover:text-on-dark"><Mail size={14} /> Email</span>
                  <ExternalLink size={12} className="text-body-muted/40 group-hover:text-on-dark transition-colors" />
                </a>
              </div>
            </div>

          </aside>

        </div>

        {/* Footer Navigation */}
        <div className="mt-24 pt-12 border-t border-white/5 flex justify-center">
          <Link href="/" className="group flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full border border-border-subtle flex items-center justify-center group-hover:bg-white group-hover:text-canvas group-hover:border-white transition-all duration-500">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <div className="space-y-1">
              <span className="block text-[0.6rem] font-bold uppercase tracking-[0.3em] text-body-muted group-hover:text-on-dark transition-colors">Return to Home</span>
              <span className="block text-xs font-heading text-on-dark opacity-40 group-hover:opacity-100 transition-opacity">Back to start</span>
            </div>
          </Link>
        </div>

      </div>
    </main>
  );
}
