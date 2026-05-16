'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  Briefcase, 
  Users, 
  Trophy, 
  Settings, 
  LogOut,
  ChevronRight,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const sidebarLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { name: 'Articles', href: '/admin/articles', icon: FileText },
  { name: 'Experience', href: '/admin/experience', icon: Briefcase },
  { name: 'Organizations', href: '/admin/organizations', icon: Users },
  { name: 'Achievements', href: '/admin/achievements', icon: Trophy },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col fixed inset-y-0 z-50 bg-[#080808]">
        <div className="p-8">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-black">
              AB
            </div>
            <span className="font-heading font-bold tracking-widest text-sm">ADMIN PANEL</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <link.icon size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">{link.name}</span>
                </div>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/40 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <LogOut size={18} />
            Logout Session
          </button>
          <Link 
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <Globe size={18} />
            View Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
