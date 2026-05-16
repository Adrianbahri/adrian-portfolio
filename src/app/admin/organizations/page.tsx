'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, Users, ChevronLeft } from 'lucide-react';
import { organizationData } from '@/data/experience';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function AdminOrganizations() {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const [formData, setFormData] = useState({
    name: '', role: '', timeline: '', description: ''
  });

  const fetchOrgs = async () => {
    const { data } = await supabase.from('organizations').select('*').order('created_at', { ascending: false });
    if (data) setOrganizations(data);
  };

  useEffect(() => { fetchOrgs(); setLoading(false); }, []);

  const handleEdit = (org: any) => {
    setEditingId(org.id);
    setFormData({
      name: org.name || '',
      role: org.role || '',
      timeline: org.timeline || '',
      description: org.description || ''
    });
    setView('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) { await supabase.from('organizations').update(formData).eq('id', editingId); }
      else { await supabase.from('organizations').insert([formData]); }
      setView('list');
      setEditingId(null);
      fetchOrgs();
    } catch (err: any) { alert('Error: ' + err.message); }
    finally { setIsSaving(false); }
  };

  const allOrgs = organizations.length > 0 ? organizations : organizationData;

  if (view === 'list') {
    return (
      <div className="space-y-12 pb-20 animate-in fade-in duration-500">
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-heading font-medium tracking-tight">Manage <span className="text-primary italic">Organizations</span></h1>
            <p className="text-white/40">Total {allOrgs.length} organizational roles.</p>
          </div>
          <button onClick={() => { setEditingId(null); setFormData({ name: '', role: '', timeline: '', description: '' }); setView('edit'); }} className="flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
            <Plus size={16} /> New Organization
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allOrgs.map((org, i) => (
            <div key={org.id || i} className="group relative bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 hover:border-primary/20 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors">
                  <Users size={24} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(org)} className="p-2 text-white/20 hover:text-white transition-colors"><Edit2 size={16} /></button>
                  <button className="p-2 text-white/20 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="text-xl font-heading font-medium text-white group-hover:text-primary transition-colors">{org.name}</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">{org.role}</p>
              <div className="flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/20 mb-6">
                <Calendar size={12} /> {org.timeline}
              </div>
              <p className="text-sm text-white/40 line-clamp-3 leading-relaxed">{org.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in slide-in-from-right-4 duration-500">
      <header className="flex items-center justify-between border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <button onClick={() => setView('list')} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all"><ChevronLeft size={24} /></button>
          <h2 className="text-3xl font-heading font-medium italic">{editingId ? 'Edit' : 'Create'} <span className="text-primary">Organization</span></h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="bg-primary text-black px-12 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">{isSaving ? 'Saving...' : 'Save Organization'}</button>
        </div>
      </header>
      <form onSubmit={handleSave} className="max-w-2xl space-y-8">
        <div className="space-y-2">
          <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40">Organization Name</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg" />
        </div>
        <div className="space-y-2">
          <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40">Your Role</label>
          <input type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40">Timeline (e.g. 2024 — 2025)</label>
          <input type="text" value={formData.timeline} onChange={(e) => setFormData({...formData, timeline: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40">Description</label>
          <textarea rows={6} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-5 text-sm" />
        </div>
      </form>
    </div>
  );
}
