'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from '@/lib/motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { portfolioModeForPath, portfolioPath } from '@/lib/portfolio';
import { isMaintenanceModeForHost, shouldBypassMaintenance } from '@/lib/maintenance';
import { isArtHost } from '@/lib/sites';

import { useProjectMode } from '@/context/ProjectModeContext';

const navLinks = [
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Projects', href: '/projects' },
  { name: 'Contact', href: '/contact' },
];

export default function GlobalNav() {
  const pathname = usePathname();
  const { mode } = useProjectMode();
  const [isMounted, setIsMounted] = useState(false);

  const [isArtDomain, setIsArtDomain] = useState(false);
  const [isMaintenanceHost, setIsMaintenanceHost] = useState(false);

  useEffect(() => {
    const currentHost = window.location.host;
    setIsArtDomain(isArtHost(currentHost));
    setIsMaintenanceHost(isMaintenanceModeForHost(currentHost));
    setIsMounted(true);
  }, []);

  const activeMode = portfolioModeForPath(pathname) || (isMounted ? mode : 'developer');


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

  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll and support Escape key when mobile drawer is open
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  if (
    !isMounted ||
    pathname === '/' ||
    pathname?.startsWith('/blog/') ||
    pathname?.startsWith('/projects/') ||
    pathname?.startsWith('/setting') ||
    pathname?.startsWith('/maintenance') ||
    pathname?.startsWith('/art') ||
    isArtDomain ||
    (isMaintenanceHost && pathname && !shouldBypassMaintenance(pathname))
  ) {
    return null;
  }

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
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center text-body-muted hover:text-on-dark transition-colors rounded-[3px] hover:bg-surface-100 cursor-pointer"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
            </button>
          </div>

          {/* 2. TENGAH: Menu Navigasi Kotak Solid */}
          <div className="pointer-events-auto hidden md:flex items-center gap-1 h-12 px-4 bg-canvas/85 backdrop-blur-2xl border border-border-strong rounded-[5px] shadow-2xl shadow-black/20 transition-all duration-300 hover:border-primary/40 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.name === 'Projects' && isMounted ? portfolioPath(activeMode) : link.href}
                  aria-current={isActive ? 'page' : undefined}
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

          <div className="pointer-events-auto flex items-center gap-2 h-12">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-menu"
              className={cn(
                "md:hidden h-12 w-12 flex items-center justify-center bg-canvas/85 backdrop-blur-2xl border border-border-strong rounded-[5px] text-on-dark transition-colors cursor-pointer shadow-2xl",
                menuOpen ? "bg-primary/20 text-primary border-primary" : "hover:bg-surface-100"
              )}
            >
              {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          </div>

        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-nav-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[90] bg-canvas/90 md:hidden flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link, i) => {
              const isActive = pathname === link.href;
              return (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={link.name === 'Projects' && isMounted ? portfolioPath(activeMode) : link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      "text-4xl font-heading font-medium transition-colors tracking-tight",
                      isActive ? "text-primary" : "text-on-dark hover:text-primary"
                    )}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              );
            })}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: navLinks.length * 0.06 }}
              className="pt-4 border-t border-border-strong/40"
            >
              <button
                type="button"
                onClick={toggleTheme}
                className="flex min-h-[44px] items-center gap-2.5 px-5 py-2.5 bg-surface-100/90 border border-border-strong rounded-[4px] text-xs font-mono uppercase tracking-wider text-on-dark hover:border-primary/40 transition-colors cursor-pointer"
              >
                {isDark ? <Sun size={17} strokeWidth={2} aria-hidden="true" /> : <Moon size={17} strokeWidth={2} aria-hidden="true" />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
