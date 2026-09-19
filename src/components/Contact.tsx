'use client';

import { motion } from 'framer-motion';
import { Mail, ArrowUpRight, ArrowUp } from 'lucide-react';
import { FiGithub, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Contact() {
  const { settings } = useSiteSettings();
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(now);
      setTimeString(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socials = [
    { name: 'Email', icon: Mail, href: `mailto:${settings.email_address || 'adrian@example.com'}` },
    { name: 'GitHub', icon: FiGithub, href: settings.github_url || '#' },
    { name: 'Instagram', icon: FiInstagram, href: settings.instagram_url || '#' },
    { name: 'LinkedIn', icon: FiLinkedin, href: settings.linkedin_url || '#' },
  ];

  return (
    <section id="contact" className="w-full pt-16 sm:pt-24 pb-12 bg-transparent overflow-hidden relative">
      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <p className="eyebrow">Get In Touch</p>
            <h2 className="text-4xl sm:text-6xl lg:text-[72px] font-normal tracking-tight text-on-dark leading-[1.08] font-heading">
              Have a project in mind? <br />
              Let’s build something <br className="hidden sm:inline" />
              <span className="text-primary font-normal">meaningful</span> together.
            </h2>
            <p className="text-base sm:text-xl text-body-muted font-normal max-w-xl mx-auto pt-2 leading-relaxed font-sans">
              I’m always excited to discuss new ideas, collaborations, or tech explorations. Let’s connect!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2.5 bg-on-dark text-canvas px-9 py-4 text-xs font-heading font-medium uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300 group rounded-[3px] shadow-lg hover:-translate-y-0.5"
            >
              Start a Conversation
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            <button
              onClick={() => {
                if (settings.resume_url) {
                  window.dispatchEvent(
                    new CustomEvent('open-pdf-reader', {
                      detail: {
                        url: settings.resume_url,
                        title: 'Resume - Adrian Bahri',
                      },
                    })
                  );
                }
              }}
              className="px-8 py-4 border border-border-strong text-on-dark text-xs font-heading font-medium uppercase tracking-[0.2em] rounded-[3px] hover:bg-surface-100 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
            >
              Download CV
            </button>
          </motion.div>
        </div>
      </div>

      {/* Modern Footer with Real-time Clock, Location & Back to Top */}
      <div className="section-container border-t border-border-subtle mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Left: Location & Live Clock */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs font-mono text-body-muted">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Makassar, Indonesia 🇮🇩</span>
          </div>
          {timeString && (
            <>
              <span className="hidden sm:inline text-border-strong">•</span>
              <span className="text-xs font-mono text-on-dark font-medium bg-surface-100/40 px-2.5 py-0.5 rounded-[2px] border border-border-subtle">
                {timeString} WITA
              </span>
            </>
          )}
        </div>

        {/* Center: Social Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          {socials.map((item, i) => (
            <motion.a 
              key={i}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              className="p-3 rounded-[3px] bg-surface-100/25 border border-border-subtle hover:border-border-strong hover:bg-surface-100/60 text-body-muted hover:text-on-dark transition-all duration-300"
              title={item.name}
            >
              <item.icon size={16} />
            </motion.a>
          ))}
        </div>

        {/* Right: Back to Top & Copyright */}
        <div className="flex items-center gap-4">
          <p className="text-[11px] text-body-muted font-mono">
            © {new Date().getFullYear()} Dri4n
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[3px] border border-border-subtle hover:border-border-strong bg-surface-100/25 hover:bg-surface-100/60 text-xs font-mono text-body-muted hover:text-on-dark transition-all duration-300 cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp size={12} />
          </button>
        </div>

      </div>

      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
}
