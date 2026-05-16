'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const navLinks = [
  { name: 'Work', href: '/#work' },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/#about' },
  { name: 'Contact', href: '/#contact' },
];

export default function GlobalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { scrollY } = useScroll();
  const [showSwitcher, setShowSwitcher] = useState(false);
  
  const currentMode = searchParams.get('mode') || 'developer';

  const setMode = (mode: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', mode);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Reveal switcher in navbar after scrolling past the header area
    setShowSwitcher(latest > 250);
  });

  if (pathname?.startsWith('/admin') || pathname === '/login') return null;

  return (
    <header
      className="fixed top-6 inset-x-0 z-[100] pointer-events-none"
    >
      <nav className="max-w-5xl mx-auto px-4">
        <div className="pointer-events-auto flex items-center justify-between h-14 px-6 bg-canvas/60 backdrop-blur-xl border border-white/10 rounded-[5px] shadow-2xl shadow-black/40">
          <div className="flex items-center gap-6">
            <a href="/" className="inline-flex items-center gap-2">
              <span className="font-heading text-[0.9rem] font-bold tracking-[0.2em] text-on-dark">AB</span>
            </a>

            {/* INTEGRATED MODE SWITCHER (Only on /projects when scrolled) */}
            <AnimatePresence>
              {pathname === '/projects' && showSwitcher && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center p-0.5 bg-surface-200/50 border border-white/5 backdrop-blur-sm rounded-[3px]"
                >
                  <button
                    onClick={() => setMode('developer')}
                    className={cn(
                      "px-3 py-1 text-[7px] font-bold uppercase tracking-[0.2em] transition-all",
                      currentMode === 'developer' 
                        ? "bg-primary text-canvas" 
                        : "text-body-muted hover:text-on-dark"
                    )}
                  >
                    Dev
                  </button>
                  <button
                    onClick={() => setMode('creative')}
                    className={cn(
                      "px-3 py-1 text-[7px] font-bold uppercase tracking-[0.2em] transition-all",
                      currentMode === 'creative' 
                        ? "bg-primary text-canvas" 
                        : "text-body-muted hover:text-on-dark"
                    )}
                  >
                    Cre
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
 
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-[0.6rem] font-heading uppercase tracking-[0.2em] text-body-muted hover:text-on-dark transition-all"
              >
                {link.name}
              </Link>
            ))}
          </div>
 
          <div className="flex items-center gap-6">
            <Link 
              href="/#contact"
              className="hidden sm:block bg-on-dark text-canvas px-5 py-1.5 text-[0.6rem] font-heading font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-canvas transition-all rounded-[3px]"
            >
              Contact
            </Link>
            {/* Mobile Toggle */}
            <button className="md:hidden text-on-dark">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
