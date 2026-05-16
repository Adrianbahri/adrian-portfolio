export default function AdminDashboard() {
  const stats = [
    { name: 'Total Projects', value: '7', change: '+2 this month', icon: 'FolderKanban' },
    { name: 'Articles Published', value: '1', change: 'Drafts available', icon: 'FileText' },
    { name: 'Exp. Entries', value: '4', change: 'Last updated 2d ago', icon: 'Briefcase' },
    { name: 'Achievements', value: '12', change: 'Verified', icon: 'Trophy' },
  ];

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-heading font-medium tracking-tight">System <span className="text-primary italic">Overview</span></h1>
        <p className="text-white/40 max-w-2xl">Selamat datang di pusat kendali portfolio Anda. Kelola semua konten mulai dari proyek hingga pencapaian dari satu tempat.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl space-y-4 hover:border-primary/30 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/40">{stat.name}</span>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                {/* Icon placeholder */}
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-heading font-medium">{stat.value}</h3>
              <p className="text-[0.6rem] text-primary font-bold uppercase tracking-widest">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 bg-[#0a0a0a] border border-white/5 rounded-3xl space-y-6">
          <h2 className="text-xl font-heading font-medium">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-primary/10 hover:border-primary/20 transition-all group">
              <p className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-1">Upload New</p>
              <p className="text-sm font-bold uppercase tracking-widest group-hover:text-primary transition-colors">Project</p>
            </button>
            <button className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-primary/10 hover:border-primary/20 transition-all group">
              <p className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-1">Write New</p>
              <p className="text-sm font-bold uppercase tracking-widest group-hover:text-primary transition-colors">Article</p>
            </button>
          </div>
        </div>

        <div className="p-8 bg-[#0a0a0a] border border-white/5 rounded-3xl space-y-6">
          <h2 className="text-xl font-heading font-medium">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Updated Project: EventKu</p>
                  <p className="text-[0.6rem] text-white/30 uppercase tracking-widest">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
