'use client';

import { motion } from 'framer-motion';
import { Mail, Code2, Globe, Camera, ArrowUpRight } from 'lucide-react';

const socials = [
  { name: 'Email', icon: Mail, href: 'mailto:adrian@example.com' },
  { name: 'GitHub', icon: Code2, href: '#' },
  { name: 'LinkedIn', icon: Globe, href: '#' },
  { name: 'Instagram', icon: Camera, href: '#' },
];

export default function Contact() {
  return (
    <section id="contact" className="w-full pt-24 pb-8 bg-transparent overflow-hidden relative">
      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-[42px] lg:text-[72px] font-bold tracking-tighter text-on-dark leading-none">
              Let’s build something <br />
              <span className="text-primary italic font-serif">meaningful</span> together.
            </h2>
            <p className="text-lg md:text-xl text-body-muted font-light max-w-2xl mx-auto pt-4">
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
            <a 
              href="mailto:adrian@example.com"
              className="inline-flex items-center gap-3 bg-on-dark text-canvas px-10 py-5 text-xl font-bold hover:bg-primary transition-all group skew-x-[-12deg] hover:skew-x-0"
            >
              <span className="skew-x-[12deg] group-hover:skew-x-0 transition-all duration-500 flex items-center gap-3">
                Get In Touch
                <ArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Footer minimal with Socials aligned horizontally */}
      <div className="section-container border-t border-white/5 mt-20 py-8 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Copyright & Joke */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <p className="text-[10px] text-body-muted/40 uppercase tracking-[0.3em] font-mono">
            © 2026 ADRIAN BAHRI. ALL RIGHTS RESERVED.
          </p>
          <p className="text-[9px] text-primary/80 uppercase tracking-[0.1em] font-mono italic">
            I built this whole thing in only 2 days, btw. ⚡️
          </p>
        </div>

        {/* Social Icons - More Prominent */}
        <div className="flex items-center gap-4 sm:gap-6">
          {socials.map((item, i) => (
            <motion.a 
              key={i}
              href={item.href}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative"
              title={item.name}
            >
              <div className="p-4 rounded-full bg-white/[0.03] border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-500 shadow-xl">
                <item.icon 
                  size={20} 
                  strokeWidth={1.5}
                  className="text-on-dark/60 group-hover:text-primary transition-colors" 
                />
              </div>
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary text-canvas text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {item.name}
              </span>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
}
