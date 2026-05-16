import { FolderKanban, FileText, Briefcase, Trophy, Zap, ArrowUpRight, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Projects', value: '7', change: '+2 this month', icon: FolderKanban },
    { name: 'Articles Published', value: '1', change: 'Drafts available', icon: FileText },
    { name: 'Exp. Entries', value: '4', change: 'Last updated 2d ago', icon: Briefcase },
    { name: 'Achievements', value: '12', change: 'Verified', icon: Trophy },
  ];

  return (
    <div data-lenis-prevent className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
      <header className="space-y-0.5">
        <h1 className="text-xl font-medium text-[#ededed]">Dashboard Overview</h1>
        <p className="text-[13px] text-[#707070]">Welcome back. Here's a quick look at your portfolio's status.</p>
      </header>

      {/* Stats Grid - Strict Supabase Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="p-4 bg-[#1c1c1c] border border-[#2e2e2e] rounded-md space-y-3 hover:border-[#3e3e3e] transition-all group shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">{stat.name}</span>
              <div className="w-7 h-7 rounded bg-[#252525] flex items-center justify-center border border-[#2e2e2e] group-hover:border-[#3ecf8e]/30 transition-all">
                <stat.icon size={12} className="text-[#707070] group-hover:text-[#3ecf8e] transition-colors" />
              </div>
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xl font-medium text-[#ededed]">{stat.value}</h3>
              <div className="flex items-center gap-1.5">
                 <Zap size={10} className="text-[#3ecf8e]" />
                 <p className="text-[10px] text-[#707070] font-medium uppercase tracking-wider">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 p-6 bg-[#1c1c1c] border border-[#2e2e2e] rounded-md space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[12px] font-bold text-[#707070] uppercase tracking-wider">Quick Actions</h2>
            <button className="text-[10px] text-[#707070] hover:text-[#ededed] transition-colors uppercase font-bold tracking-wider">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/admin/projects" className="p-3.5 bg-[#171717] border border-[#2e2e2e] rounded-md text-left hover:bg-[#202020] hover:border-[#3ecf8e]/20 transition-all group flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">Content</p>
                <p className="text-[13px] font-medium text-[#ededed]">Add New Project</p>
              </div>
              <ArrowUpRight size={14} className="text-[#707070] group-hover:text-[#3ecf8e] transition-all" />
            </Link>
            <Link href="/admin/articles" className="p-3.5 bg-[#171717] border border-[#2e2e2e] rounded-md text-left hover:bg-[#202020] hover:border-[#3ecf8e]/20 transition-all group flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">Writing</p>
                <p className="text-[13px] font-medium text-[#ededed]">Draft New Article</p>
              </div>
              <ArrowUpRight size={14} className="text-[#707070] group-hover:text-[#3ecf8e] transition-all" />
            </Link>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="p-6 bg-[#1c1c1c] border border-[#2e2e2e] rounded-md space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-[#707070]" />
            <h2 className="text-[12px] font-bold text-[#707070] uppercase tracking-wider">Recent Activity</h2>
          </div>
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 group">
                <div className="w-[1px] rounded-full bg-[#2e2e2e] group-hover:bg-[#3ecf8e] transition-colors" />
                <div className="flex-1 space-y-0.5">
                  <p className="text-[13px] text-[#ededed] font-medium leading-tight">Modified Project Archive</p>
                  <p className="text-[10px] text-[#707070] uppercase font-bold tracking-wider">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
