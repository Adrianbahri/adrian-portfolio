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
    <section id="contact" className="w-full py-40 bg-canvas border-t border-border-subtle overflow-hidden relative">
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
              <span className="text-primary italic">meaningful</span> together.
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
              className="inline-flex items-center gap-3 bg-on-dark text-black px-10 py-5 rounded-full text-xl font-bold hover:bg-primary transition-all group"
            >
              Get In Touch
              <ArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="pt-24 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {socials.map((item, i) => (
              <a 
                key={i}
                href={item.href}
                className="flex flex-col items-center gap-3 text-body-muted hover:text-primary transition-colors group"
              >
                <div className="p-4 rounded-2xl bg-surface-75 border border-border-subtle group-hover:border-primary/30 transition-all">
                  <item.icon size={24} />
                </div>
                <span className="text-xs uppercase tracking-[0.2em] font-bold">{item.name}</span>
              </a>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer minimal */}
      <div className="section-container border-t border-border-subtle mt-40 py-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] text-body-muted uppercase tracking-[0.2em] font-bold">
        <p>© 2026 ADRIAN BAHRI. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-on-dark transition-colors">Privacy</a>
          <a href="#" className="hover:text-on-dark transition-colors">Terms</a>
        </div>
      </div>

      {/* Decorative grain and glow */}
      <div className="glow-subtle bg-primary/10 w-[600px] h-[600px] -bottom-40 -left-40" />
    </section>
  );
}
