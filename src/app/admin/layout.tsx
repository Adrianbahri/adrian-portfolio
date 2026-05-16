'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  FolderKanban,
  ScrollText,
  Briefcase,
  RefreshCw,
  LogOut,
  Globe,
  Settings,
  User,
  Search,
  Users,
  Image as ImageIcon,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const [isProjectsOpen, setIsProjectsOpen] = useState(pathname.startsWith('/admin/projects'));
  const [isActivitiesOpen, setIsActivitiesOpen] = useState(pathname.startsWith('/admin/activities'));

  const links = [
    { name: 'Overview', href: '/admin', icon: LayoutGrid },
    {
      name: 'Projects',
      href: '/admin/projects',
      icon: FolderKanban,
      submenu: [
        { name: 'All Projects', href: '/admin/projects' },
        { name: 'Technical', href: '/admin/projects?type=developer' },
        { name: 'Creative', href: '/admin/projects?type=creative' },
      ]
    },
    { name: 'Articles', href: '/admin/articles', icon: ScrollText },
    { name: 'Experience', href: '/admin/experience', icon: Briefcase },
    {
      name: 'Activities',
      href: '/admin/activities',
      icon: Users,
      submenu: [
        { name: 'Organizations', href: '/admin/activities?type=organizations' },
        { name: 'Volunteering', href: '/admin/activities?type=volunteering' },
      ]
    },
    { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
    { name: 'Videos', href: '/admin/videos', icon: Video },
    { name: 'Designs', href: '/admin/designs', icon: ImageIcon },
    { name: 'Sync Database', href: '/admin/sync', icon: RefreshCw },
  ];

  return (
    <div className="flex h-screen bg-[#1c1c1c] text-white overflow-hidden font-sans selection:bg-[#3ecf8e]/30 selection:text-[#3ecf8e]">
      {/* Sidebar - Supabase Canvas Night */}
      <aside className="w-64 flex-shrink-0 bg-[#1c1c1c] border-r border-[#2e2e2e] flex flex-col">
        <div className="p-4">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md border border-[#2e2e2e] bg-[#202020] hover:bg-[#252525] transition-all text-left group">
            <div className="w-5 h-5 rounded bg-[#3ecf8e] flex items-center justify-center text-[#171717] font-bold text-[10px]">A</div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[12px] font-medium leading-tight text-[#ededed] truncate">Adrianbahri</span>
              <span className="text-[10px] text-[#707070] leading-tight truncate">Default Project</span>
            </div>
            <Settings size={12} className="text-[#707070] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#707070]">Project</p>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.submenu && pathname.startsWith(link.href));
            const hasSubmenu = !!link.submenu;
            const isOpen = link.name === 'Projects' ? isProjectsOpen : isActivitiesOpen;
            const setIsOpen = link.name === 'Projects' ? setIsProjectsOpen : setIsActivitiesOpen;

            return (
              <div key={link.href} className="flex flex-col">
                <div className="flex items-center group">
                  <Link
                    href={link.href}
                    onClick={(e) => {
                      if (hasSubmenu) {
                        setIsOpen(!isOpen);
                      }
                    }}
                    className={cn(
                      "flex-1 flex items-center gap-2.5 px-3 py-1.5 text-[13px] transition-all rounded-md",
                      isActive && !hasSubmenu
                        ? "bg-[#2e2e2e] text-[#ededed]"
                        : "text-[#9a9a9a] hover:text-[#ededed] hover:bg-[#252525]"
                    )}
                  >
                    <Icon size={14} className={isActive ? "text-[#3ecf8e]" : "text-[#707070] group-hover:text-[#ededed] transition-colors"} />
                    <span>{link.name}</span>
                  </Link>
                  {hasSubmenu && (
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="p-1.5 text-[#707070] hover:text-[#ededed] transition-colors"
                    >
                      <div className={cn("w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] transition-transform", isOpen ? "rotate-0 border-t-[#3ecf8e]" : "-rotate-90 border-t-[#707070]")} />
                    </button>
                  )}
                </div>

                {hasSubmenu && isOpen && (
                  <div className="ml-6 mt-0.5 mb-1 pl-3 border-l border-[#2e2e2e] space-y-0.5 animate-in slide-in-from-left-2 duration-300">
                    {link.submenu.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            "block px-3 py-1.5 text-[12px] transition-all rounded-md",
                            isSubActive
                              ? "text-[#3ecf8e] font-medium"
                              : "text-[#707070] hover:text-[#ededed] hover:bg-[#252525]"
                          )}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2e2e2e] space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-[#9a9a9a] hover:text-[#ededed] text-[13px] transition-all rounded-md hover:bg-[#252525]"
          >
            <Globe size={14} />
            <span>Visit Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-[#9a9a9a] hover:text-[#ff2201] text-[13px] transition-all rounded-md hover:bg-[#ff2201]/5"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#171717]">
        <header className="h-10 border-b border-[#2e2e2e] flex items-center px-6 bg-[#1c1c1c] justify-between">
          <div className="flex items-center gap-2 text-[11px] font-medium">
            <span className="text-[#707070]">Projects</span>
            <span className="text-[#2e2e2e]">/</span>
            <span className="text-[#ededed]">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-[#2e2e2e] text-[10px] text-[#707070] bg-[#252525]/30">
              <div className="w-1 h-1 rounded-full bg-[#3ecf8e]" />
              System Online
            </div>
            <div className="w-6 h-6 rounded-full bg-[#2e2e2e] border border-[#3e3e3e] flex items-center justify-center text-[9px] font-bold text-[#707070]">AB</div>
          </div>
        </header>
        <main className="flex-1 overflow-hidden flex flex-col p-6">
          <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col min-h-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
