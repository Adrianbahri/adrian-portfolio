'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Menu, Sun, Moon, Code2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { useRouter, useSearchParams } from 'next/navigation';

import { useProjectMode, ProjectMode } from '@/context/ProjectModeContext';

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
  const { mode, setMode } = useProjectMode();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeMode = isMounted ? mode : 'developer';

  if (pathname?.startsWith('/admin')) return null;
  
  const [isDark, setIsDark] = useState(true);

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

  const handleModeSwitch = (newMode: ProjectMode) => {
    setMode(newMode);
    if (pathname === '/projects') {
      const params = new URLSearchParams(searchParams.toString());
      params.set('mode', newMode);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-6 inset-x-0 z-[100] pointer-events-none"
      >
        <nav className="max-w-5xl mx-auto px-6 lg:px-12 flex items-center justify-between relative">
          
          {/* 1. KIRI: Logo Kotak Solid + Tombol Tema */}
          <div className="pointer-events-auto flex items-center gap-1.5 h-12 px-3.5 sm:px-4 bg-canvas/85 backdrop-blur-2xl border border-border-strong rounded-[5px] shadow-2xl shadow-black/20 transition-all duration-300 hover:border-primary/40">
            <Link href="/" className="font-heading text-sm sm:text-base font-normal tracking-tight text-on-dark hover:text-primary transition-colors pl-1">
              Dri4n<span className="text-primary font-bold">.</span>
            </Link>

            <div className="h-4 w-px bg-border-strong/60 mx-1" />

            {/* Theme Toggle di dekat nama */}
            <button 
              onClick={toggleTheme}
              className="p-1.5 text-body-muted hover:text-on-dark transition-colors rounded-[3px] hover:bg-surface-100 cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          {/* 2. TENGAH: Menu Navigasi Kotak Solid */}
          <div className="pointer-events-auto hidden md:flex items-center gap-1 h-12 px-4 bg-canvas/85 backdrop-blur-2xl border border-border-strong rounded-[5px] shadow-2xl shadow-black/20 transition-all duration-300 hover:border-primary/40 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-3.5 sm:px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-300 rounded-[3px]",
                    isActive 
                      ? "bg-surface-200 text-on-dark shadow-sm border border-border-subtle" 
                      : "text-body-muted hover:text-on-dark hover:bg-surface-100"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* 3. KANAN: Mode Switcher Kotak Solid */}
          <div className="pointer-events-auto flex items-center gap-2 h-12">
            <div className="relative grid grid-cols-2 items-center h-12 p-1 w-[188px] sm:w-[230px] md:w-[244px] bg-canvas/85 backdrop-blur-2xl border border-primary/45 rounded-[5px] shadow-2xl shadow-primary/20 ring-1 ring-primary/25">
              <button
                onClick={() => handleModeSwitch('developer')}
                suppressHydrationWarning
                className={cn(
                  "relative flex items-center justify-center h-full text-xs font-mono uppercase tracking-wide transition-colors duration-200 rounded-[3px] font-bold cursor-pointer select-none",
                  activeMode === 'developer' ? "text-white drop-shadow-sm" : "text-body-muted hover:text-on-dark"
                )}
                title="Developer Portfolio"
              >
                {activeMode === 'developer' && (
                  isMounted ? (
                    <motion.div
                      layoutId="activeModePill"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      className="absolute inset-0 bg-primary rounded-[3px] z-0 shadow-md shadow-primary/40 pointer-events-none"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-primary rounded-[3px] z-0 shadow-md shadow-primary/40 pointer-events-none" />
                  )
                )}
                <span className="relative z-10 pointer-events-none">Dev</span>
              </button>

              <button
                onClick={() => handleModeSwitch('creative')}
                suppressHydrationWarning
                className={cn(
                  "relative flex items-center justify-center h-full text-xs font-mono uppercase tracking-wide transition-colors duration-200 rounded-[3px] font-bold cursor-pointer select-none",
                  activeMode === 'creative' ? "text-white drop-shadow-sm" : "text-body-muted hover:text-on-dark"
                )}
                title="Creative Portfolio"
              >
                {activeMode === 'creative' && (
                  isMounted ? (
                    <motion.div
                      layoutId="activeModePill"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      className="absolute inset-0 bg-primary rounded-[3px] z-0 shadow-md shadow-primary/40 pointer-events-none"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-primary rounded-[3px] z-0 shadow-md shadow-primary/40 pointer-events-none" />
                  )
                )}
                <span className="relative z-10 pointer-events-none">Creative</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              className={cn(
                "md:hidden h-12 w-12 flex items-center justify-center bg-canvas/85 backdrop-blur-2xl border border-border-strong rounded-[5px] text-on-dark transition-colors cursor-pointer shadow-2xl",
                menuOpen ? "bg-primary/20 text-primary border-primary" : "hover:bg-surface-100"
              )}
            >
              <span className="sr-only">Menu</span>
              <Menu size={16} />
            </button>
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: navLinks.length * 0.1 }}
              className="pt-4 border-t border-border-strong/40"
            >
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2.5 px-5 py-2.5 bg-surface-100/90 border border-border-strong rounded-[4px] text-xs font-mono uppercase tracking-wider text-on-dark hover:border-primary/40 transition-colors"
              >
                {isDark ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
