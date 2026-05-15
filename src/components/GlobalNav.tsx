'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Work', href: '#work' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

export default function GlobalNav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setIsScrolled(latest > 50);
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: -20, opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 inset-x-0 z-50 pointer-events-none"
    >
      <nav className="max-w-5xl mx-auto px-4">
        <div className={cn(
          "pointer-events-auto flex items-center justify-between px-6 py-3 border border-border-strong bg-canvas/80 backdrop-blur-md transition-all duration-500",
          isScrolled ? "shadow-2xl shadow-black/40" : ""
        )}>
          <a href="/" className="inline-flex items-center gap-2">
            <span className="font-heading text-[1rem] font-bold tracking-[0.16em] text-on-dark">AB</span>
            <span className="hidden sm:block text-[0.7rem] uppercase tracking-[0.16em] text-body-muted font-heading">Adrian Bahri</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-[0.7rem] font-heading uppercase tracking-[0.16em] text-body-muted hover:text-on-dark transition-all hover:bg-surface-100"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:block bg-on-dark text-canvas px-5 py-2 text-[0.65rem] font-heading font-bold uppercase tracking-[0.16em] hover:bg-on-dark/90 transition-all">
              Contact
            </button>
            {/* Mobile Toggle */}
            <button className="md:hidden text-on-dark">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
