'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  FolderKanban,
  ScrollText,
  Briefcase,
  RefreshCw,
  LogOut,
  Globe,
  User,
  Users,
  Image as ImageIcon,
  Video,
  Inbox,
  Trophy,
  Palette,
  BookOpen,
  TrendingUp,
  Sparkles,
  Code2,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

type AdminMode = 'dev' | 'creative';

interface AdminNavLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
  matchPath?: string;
}

const CREATIVE_ROUTES = [
  '/setting/designs',
  '/setting/magazines',
  '/setting/videos',
  '/setting/gallery',
  '/setting/growth',
  '/setting/creative',
];

function isCreativePath(pathname: string) {
  return CREATIVE_ROUTES.some((p) => pathname.startsWith(p));
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-[#121212] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-[#707070]">
          Loading Studio Admin...
        </div>
      }
    >
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<AdminMode>(() =>
    isCreativePath(pathname) ? 'creative' : 'dev'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync mode automatically when navigating between dev & creative routes
  useEffect(() => {
    const inferred: AdminMode = isCreativePath(pathname) ? 'creative' : 'dev';
    setMode(inferred);
    try {
      localStorage.setItem('dri4n-admin-mode', inferred);
    } catch {
      // ignore storage errors
    }
    setMobileMenuOpen(false);
  }, [pathname]);

  const switchMode = (nextMode: AdminMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    try {
      localStorage.setItem('dri4n-admin-mode', nextMode);
    } catch {
      // ignore
    }
    if (nextMode === 'creative') {
      router.push('/setting/designs');
    } else {
      router.push('/setting');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const devLinks: AdminNavLink[] = [
    { name: 'Overview & Bio CMS', href: '/setting', icon: User, exact: true },
    {
      name: 'Technical Projects',
      href: '/setting/projects?type=developer',
      matchPath: '/setting/projects',
      icon: FolderKanban,
    },
    { name: 'Writing / Articles', href: '/setting/articles', icon: ScrollText },
    { name: 'Work Experience', href: '/setting/experience', icon: Briefcase },
    { name: 'Achievements', href: '/setting/achievements', icon: Trophy },
    {
      name: 'Activities & Org',
      href: '/setting/activities',
      icon: Users,
    },
    { name: 'Inbox Messages', href: '/setting/messages', icon: Inbox },
  ];

  const creativeLinks: AdminNavLink[] = [
    { name: 'Photography (HQ)', href: '/setting/gallery', icon: ImageIcon },
    { name: 'Creative Showcase (/art)', href: '/setting/growth', icon: TrendingUp },
    { name: 'Design Projects', href: '/setting/designs', icon: Palette },
    { name: 'Print & Infografis', href: '/setting/magazines', icon: BookOpen },
    { name: 'Video & Motion', href: '/setting/videos', icon: Video },
    { name: 'Creative Spotlight', href: '/setting/creative', icon: Sparkles },
  ];

  const activeLinks = mode === 'creative' ? creativeLinks : devLinks;
  const accentText = mode === 'creative' ? 'text-[#f59e0b]' : 'text-[#ff5a3d]';
  const accentBg =
    mode === 'creative'
      ? 'bg-[#f59e0b]/12 text-[#fbbf24] border-[#f59e0b]/30'
      : 'bg-[#ff5a3d]/12 text-[#ff5a3d] border-[#ff5a3d]/30';

  const currentFullUrl = `${pathname}${
    searchParams.toString() ? '?' + searchParams.toString() : ''
  }`;

  const renderSidebarInner = () => (
    <>
      {/* Brand + Dual Mode Switcher */}
      <div className="p-4 border-b border-[#262626] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                'w-6 h-6 rounded-[6px] flex items-center justify-center font-mono font-bold text-[11px] shrink-0 transition-colors',
                mode === 'creative'
                  ? 'bg-[#f59e0b] text-[#121212]'
                  : 'bg-[#ff5a3d] text-white'
              )}
            >
              D
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12.5px] font-semibold tracking-tight text-[#f1eee9] truncate">
                DRI4N STUDIO
              </span>
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#737373] truncate">
                {mode === 'creative' ? 'dri4n.com/art' : 'dri4n.com'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-[#8a8a8a] hover:text-white hover:bg-[#222222]"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2-Mode Segmented Workspace Switcher (DEV vs CREATIVE) */}
        <div
          role="tablist"
          aria-label="Admin workspace mode"
          className="grid grid-cols-2 gap-1 p-1 rounded-[8px] bg-[#121212] border border-[#262626]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'dev'}
            onClick={() => switchMode('dev')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[6px] font-mono text-[10.5px] uppercase tracking-[0.08em] transition-all',
              mode === 'dev'
                ? 'bg-[#ff5a3d] text-white font-semibold shadow-sm'
                : 'text-[#8a8a8a] hover:text-[#ededed]'
            )}
          >
            <Code2 size={12} />
            <span>DEV</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'creative'}
            onClick={() => switchMode('creative')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[6px] font-mono text-[10.5px] uppercase tracking-[0.08em] transition-all',
              mode === 'creative'
                ? 'bg-[#f59e0b] text-[#121212] font-semibold shadow-sm'
                : 'text-[#8a8a8a] hover:text-[#ededed]'
            )}
          >
            <Palette size={12} />
            <span>CREATIVE</span>
          </button>
        </div>
      </div>

      {/* Mode-Specific Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-2.5 pb-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
          {mode === 'creative' ? 'Creative Content' : 'Developer Content'}
        </p>

        {activeLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact
            ? pathname === link.href
            : link.matchPath
            ? pathname.startsWith(link.matchPath)
            : pathname.startsWith(link.href) || currentFullUrl === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-[7px] border transition-all',
                isActive
                  ? accentBg
                  : 'border-transparent text-[#9a9a9a] hover:text-[#f1eee9] hover:bg-[#1f1f1f]'
              )}
            >
              <Icon
                size={14}
                className={cn(
                  'shrink-0',
                  isActive ? accentText : 'text-[#707070]'
                )}
              />
              <span className="truncate">{link.name}</span>
            </Link>
          );
        })}

        {/* Shared System Tools */}
        <div className="pt-4 mt-4 border-t border-[#242424] space-y-1">
          <p className="px-2.5 pb-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
            System
          </p>
          <Link
            href="/setting/sync"
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-[7px] border transition-all',
              pathname.startsWith('/setting/sync')
                ? accentBg
                : 'border-transparent text-[#9a9a9a] hover:text-[#f1eee9] hover:bg-[#1f1f1f]'
            )}
          >
            <RefreshCw
              size={14}
              className={
                pathname.startsWith('/setting/sync')
                  ? accentText
                  : 'text-[#707070]'
              }
            />
            <span>Sync &amp; Cache</span>
          </Link>
        </div>
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-[#262626] space-y-1">
        <Link
          href={mode === 'creative' ? '/art' : '/'}
          target="_blank"
          className="flex items-center justify-between gap-2 px-3 py-2 text-[#9a9a9a] hover:text-[#f1eee9] text-[12.5px] transition-all rounded-[7px] hover:bg-[#1f1f1f]"
        >
          <span className="flex items-center gap-2.5">
            <Globe size={14} />
            <span>{mode === 'creative' ? 'Open dri4n.com/art' : 'Open dri4n.com'}</span>
          </span>
          <ExternalLink size={12} className="opacity-60" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-[#9a9a9a] hover:text-[#ff5a3d] text-[12.5px] transition-all rounded-[7px] hover:bg-[#ff5a3d]/10"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="dark flex h-screen bg-[#121212] text-[#f1eee9] overflow-hidden font-sans selection:bg-[#ff5a3d]/30 selection:text-[#ff5a3d]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-[#171717] border-r border-[#262626] flex-col">
        {renderSidebarInner()}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden bg-black/70 backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="w-72 max-w-[84vw] bg-[#171717] border-r border-[#262626] flex flex-col h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarInner()}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#121212]">
        <header className="h-12 border-b border-[#262626] flex items-center px-4 sm:px-6 bg-[#171717] justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-md border border-[#262626] text-[#a3a3a3] hover:text-white hover:bg-[#222222]"
              aria-label="Open menu"
            >
              <Menu size={15} />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] border font-mono text-[10px] uppercase tracking-[0.1em]',
                  accentBg
                )}
              >
                {mode === 'creative' ? <Palette size={10} /> : <Code2 size={10} />}
                {mode === 'creative' ? 'CREATIVE MODE' : 'DEV MODE'}
              </span>
              <span className="hidden sm:inline font-mono text-[11px] text-[#707070] truncate">
                {pathname}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-[6px] border border-[#262626] font-mono text-[10px] text-[#8a8a8a] bg-[#121212]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
              <span>api.dri4n.com</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#242424] border border-[#333333] flex items-center justify-center font-mono text-[10px] font-semibold text-[#d4d4d4]">
              AB
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-4 sm:p-6">
          <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col min-h-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
