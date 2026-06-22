'use client';

import { motion } from 'framer-motion';
import { Mail, ArrowUpRight } from 'lucide-react';
import { FiGithub, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import Link from 'next/link';

export default function Contact() {
  const { settings } = useSiteSettings();

  const socials = [
    { name: 'Email', icon: Mail, href: `mailto:${settings.email_address || 'adrian@example.com'}` },
    { name: 'GitHub', icon: FiGithub, href: settings.github_url || '#' },
    { name: 'Instagram', icon: FiInstagram, href: settings.instagram_url || '#' },
    { name: 'LinkedIn', icon: FiLinkedin, href: settings.linkedin_url || '#' },
  ];

  return (
    <section id="contact" className="w-full py-12 sm:py-16 bg-transparent overflow-hidden relative">
      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-[32px] sm:text-[42px] lg:text-[64px] font-medium tracking-tight text-on-dark leading-tight font-heading">
              Let’s build something <br />
              <span className="text-primary italic">meaningful</span> together.
            </h2>
            <p className="text-lg text-body-muted font-light max-w-2xl mx-auto pt-4 leading-relaxed font-sans">
              I'm always open to new opportunities, collaborations, or just a friendly chat about design and technology.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="pt-8"
          >
            <Link 
              href="/contact"
              className="inline-flex items-center gap-3 bg-on-dark text-canvas px-10 py-5 text-lg font-bold hover:bg-primary transition-all group rounded-[3px]"
            >
              Get In Touch
              <ArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="section-container border-t border-border-subtle mt-12 sm:mt-16 py-12 flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <p className="text-[10px] text-body-muted uppercase tracking-[0.3em] font-mono font-bold">
            © 2026 DRIAN. ALL RIGHTS RESERVED.
          </p>
          <p className="text-[10px] text-primary/70 uppercase tracking-[0.2em] font-mono font-bold">
            Compiled with human logic & accelerated by Gemini Flash.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6">
          {socials.map((item, i) => (
            <motion.a 
              key={i}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative"
              title={item.name}
            >
              <div className="p-4 bg-surface-75/50 border border-border-subtle group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-500 rounded-[5px]">
                <item.icon 
                  size={20} 
                  strokeWidth={1.5}
                  className="text-on-dark/80 group-hover:text-primary transition-colors" 
                />
              </div>
              <span className="hidden lg:block absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary text-canvas text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap rounded-[2px]">
                {item.name}
              </span>
            </motion.a>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
}
