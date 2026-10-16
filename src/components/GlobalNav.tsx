'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { portfolioModeForPath } from '@/lib/portfolio';

export default function GlobalNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const routeMode = portfolioModeForPath(pathname);
  const queryMode = searchParams.get('mode');
  const archiveMode = queryMode === 'creative' ? 'creative' : queryMode === 'developer' ? 'developer' : pathname === '/projects' ? 'developer' : null;
  const activeMode = routeMode || (pathname.startsWith('/projects') ? archiveMode : null);
  // URL-derived links must match during SSR and hydration, regardless of storage.
  const projectsMode = activeMode || 'developer';
  const navLinks = [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Projects', href: routeMode ? `${pathname}#work` : `/projects?mode=${projectsMode}` },
    { name: 'Contact', href: '/contact' },
  ];

  useEffect(() => {
    let savedTheme: string | null = null;
    try { savedTheme = localStorage.getItem('theme'); } catch { /* Storage is optional. */ }
    const dark = savedTheme === 'dark' || (savedTheme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    setIsDark(dark);
  }, []);

  const toggleTheme = () => {
    const dark = !isDark;
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch { /* Storage is optional. */ }
  };

  // All hooks stay above this return, including when navigating to/from admin.
  if (pathname.startsWith('/admin')) return null;

  return (
    <header className="portfolio-nav-shell">
      <nav className="portfolio-nav" aria-label="Main navigation">
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" onClick={() => setMenuOpen(false)} className="portfolio-wordmark" aria-label="DRI4N home">Dri4n<span>.</span></Link>
          <button onClick={toggleTheme} className="portfolio-theme-toggle" aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>{isDark ? <Sun size={16} /> : <Moon size={16} />}</button>
        </div>
        <div className="hidden lg:flex items-center gap-5">
          {navLinks.map(link => <Link key={link.name} href={link.href} className={cn('portfolio-nav-link', pathname === link.href.split('?')[0] && 'is-current')}>{link.name}</Link>)}
        </div>
        <div className="flex items-center gap-2">
          <div className="portfolio-mode-links" aria-label="Choose portfolio">
            <Link href="/dev" aria-current={activeMode === 'developer' ? 'page' : undefined} onClick={() => setMenuOpen(false)} className={activeMode === 'developer' ? 'is-active' : ''}>Dev</Link>
            <Link href="/creative" aria-current={activeMode === 'creative' ? 'page' : undefined} onClick={() => setMenuOpen(false)} className={activeMode === 'creative' ? 'is-active' : ''}>Creative</Link>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" className="portfolio-menu-toggle lg:hidden">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
      </nav>
      {menuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="portfolio-mobile-nav lg:hidden">{navLinks.map(link => <Link key={link.name} href={link.href} onClick={() => setMenuOpen(false)}>{link.name}</Link>)}</nav>}
    </header>
  );
}
