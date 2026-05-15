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
        visible: { y: 0 },
        hidden: { y: -100 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500 py-6",
        isScrolled ? "bg-canvas/80 backdrop-blur-md border-b border-divider py-4" : "bg-transparent"
      )}
    >
      <nav className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between">
        <a href="/" className="text-[21px] font-bold tracking-tight text-on-dark uppercase">
          ADRIAN<span className="text-primary">.</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[14px] font-bold uppercase tracking-widest text-body-muted hover:text-on-dark transition-colors"
            >
              {link.name}
            </a>
          ))}
          <button className="bg-primary text-black px-5 py-2 rounded-md text-[14px] font-bold hover:bg-primary-focus transition-all shadow-lg shadow-primary/20">
            Start a project
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-on-dark">
          <Menu size={24} />
        </button>
      </nav>
    </motion.header>
  );
}
