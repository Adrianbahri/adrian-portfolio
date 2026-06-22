'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Menu, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { useRouter, useSearchParams } from 'next/navigation';

const navLinks = [
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Projects', href: '/projects' },
  { name: 'Contact', href: '/contact' },
];

export default function GlobalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentMode = searchParams.get('mode') || 'developer';

  if (pathname?.startsWith('/admin')) return null;
  
  const { scrollY } = useScroll();
  const [isDark, setIsDark] = useState(true);
  const [showProjectSwitch, setShowProjectSwitch] = useState(false);

  useEffect(() => {
    // Initial theme setup
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else if (savedTheme === 'dark' || systemPrefersDark) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const setProjectFilter = (mode: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', mode);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (pathname === '/projects' && latest > 200) {
      setShowProjectSwitch(true);
    } else {
      setShowProjectSwitch(false);
    }
  });

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-6 inset-x-0 z-[100] pointer-events-none"
      >
        <nav className="max-w-fit mx-auto px-4">
          <div className="pointer-events-auto flex items-center gap-4 h-12 px-6 sm:px-8 bg-canvas/60 backdrop-blur-xl border border-on-dark/10 rounded-[5px] shadow-2xl shadow-main overflow-hidden -rotate-1 hover:rotate-0 transition-transform duration-500">
            
            <AnimatePresence mode="wait">
              {!showProjectSwitch ? (
                <motion.div 
                  key="logo"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="flex items-center"
                >
                  <Link href="/" className="px-4 py-2 text-[0.8rem] font-fira font-bold tracking-[0.3em] text-on-dark hover:text-primary transition-all">
                    Drian
                  </Link>
                </motion.div>
              ) : (
                <motion.div 
                  key="switch"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="flex items-center p-0.5 bg-on-dark/5 rounded-[3px] border border-on-dark/10"
                >
                  <button
                    onClick={() => setProjectFilter('developer')}
                    className={cn(
                      "px-4 py-1 text-[8px] font-bold uppercase tracking-widest transition-all rounded-[2px]",
                      currentMode === 'developer' ? "bg-primary text-canvas" : "text-body-muted hover:text-on-dark"
                    )}
                  >
                    Dev
                  </button>
                  <button
                    onClick={() => setProjectFilter('creative')}
                    className={cn(
                      "px-4 py-1 text-[8px] font-bold uppercase tracking-widest transition-all rounded-[2px]",
                      currentMode === 'creative' ? "bg-primary text-canvas" : "text-body-muted hover:text-on-dark"
                    )}
                  >
                    Art
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="h-4 w-px bg-on-dark/10 mx-2 hidden sm:block" />

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-6 py-2 text-[0.7rem] font-heading font-medium uppercase tracking-[0.25em] transition-all rounded-[3px]",
                    pathname === link.href ? "bg-on-dark/10 text-on-dark" : "text-body-muted hover:text-on-dark hover:bg-on-dark/5"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-4 w-px bg-on-dark/10 mx-2 hidden md:block" />

            {/* Theme Toggle & Mobile Menu */}
            <div className="flex items-center gap-1">
              <button 
                onClick={toggleTheme}
                className="p-2.5 text-body-muted hover:text-on-dark transition-all rounded-[3px] hover:bg-on-dark/5"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation menu"
                className={cn(
                  "md:hidden p-2.5 text-on-dark rounded-[3px] transition-colors",
                  menuOpen ? "bg-primary/20 text-primary" : "hover:bg-on-dark/5"
                )}
              >
                <span className="sr-only">Menu</span>
                <Menu size={16} />
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[90] bg-canvas/60 md:hidden flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-4xl font-heading font-medium text-on-dark hover:text-primary transition-colors tracking-tight"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
