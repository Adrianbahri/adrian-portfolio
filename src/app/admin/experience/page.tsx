'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Briefcase,
  MapPin,
  ChevronLeft,
  Save,
  Clock,
  Loader2
} from 'lucide-react';
import UnifiedEditorLayout from '@/components/UnifiedEditorLayout';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import DeleteModal from '@/components/Admin/DeleteModal';

export default function AdminExperience() {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '', company: '', timeline: '', location: '', description: ''
  });

  const fetchExperiences = async () => {
    setLoading(true);
    const { data } = await supabase.from('experiences').select('*').order('created_at', { ascending: false });
    if (data) setExperiences(data);
    setLoading(false);
  };

  useEffect(() => { fetchExperiences(); }, []);

  const handleEdit = (exp: any) => {
    setEditingId(exp.id);
    setFormData({
      title: exp.title || '',
      company: exp.company || '',
      timeline: exp.timeline || '',
      location: exp.location || '',
      description: exp.description || ''
    });
    setView('edit');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editingId) { await supabase.from('experiences').update(formData).eq('id', editingId); }
      else { await supabase.from('experiences').insert([formData]); }
      setView('list');
      setEditingId(null);
      fetchExperiences();
    } catch (err: any) { alert('Error: ' + err.message); }
    finally { setIsSaving(false); }
  };

  const confirmDelete = (item: any) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const { error } = await supabase.from('experiences').delete().eq('id', itemToDelete.id);
      if (error) throw error;
      setExperiences(prev => prev.filter(e => e.id !== itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) { alert('Error: ' + err.message); }
  };

  if (view === 'edit') {
    return (
      <UnifiedEditorLayout 
        title={`${editingId ? 'Edit' : 'Create'} Experience`}
        subtitle={formData.company}
        content={formData.description}
        onContentChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
        onSave={handleSave}
        onBack={() => setView('list')}
        isSaving={isSaving}
        modeLabel="EXPERIENCE EDITOR"
        topContent={
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">Role Title</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">Company / Organization</label>
              <input 
                type="text" 
                value={formData.company} 
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
                placeholder="e.g. Supabase"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">Timeline</label>
              <input 
                type="text" 
                value={formData.timeline} 
                onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
                placeholder="e.g. Jan 2024 — Present"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">Location</label>
              <input 
                type="text" 
                value={formData.location} 
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
                placeholder="e.g. Remote"
              />
            </div>
          </div>
        }
      />
    );
  }

  return (
    <div data-lenis-prevent className="flex-1 space-y-8 pb-20 text-[#ededed]">
      <header className="flex items-center justify-between py-4 border-b border-[#2e2e2e]">
        <div className="space-y-1">
          <h1 className="text-xl font-medium text-[#ededed]">Experience</h1>
          <p className="text-[13px] text-[#707070]">Manage your professional career history.</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setFormData({ title: '', company: '', timeline: '', location: '', description: '' }); setView('edit'); }}
          className="bg-[#3ecf8e] text-[#171717] px-4 py-2 rounded-md text-[13px] font-medium hover:bg-[#24b47e] transition-all flex items-center gap-2"
        >
          <Plus size={14} /> New Experience
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {experiences.map((exp, i) => (
          <div key={exp.id || i} className="group relative bg-[#1c1c1c] border border-[#2e2e2e] rounded-md p-5 hover:border-[#3e3e3e] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-[#252525] rounded-md flex items-center justify-center text-[#3ecf8e] border border-[#2e2e2e]">
                <Briefcase size={18} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(exp)} className="p-1.5 bg-[#252525] text-[#9a9a9a] rounded hover:text-white border border-[#2e2e2e] transition-all"><Edit2 size={12} /></button>
                <button onClick={() => confirmDelete(exp)} className="p-1.5 bg-[#252525] text-[#9a9a9a] rounded hover:text-[#ff2201] border border-[#2e2e2e] transition-all"><Trash2 size={12} /></button>
              </div>
            </div>
            
            <div className="space-y-1 mb-4">
              <h3 className="text-[15px] font-medium text-[#ededed]">{exp.title}</h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#3ecf8e]">{exp.company}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-[11px] text-[#707070] mb-4">
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                <span>{exp.timeline}</span>
              </div>
              {exp.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} />
                  <span>{exp.location}</span>
                </div>
              )}
            </div>

            <div 
              className="text-[13px] text-[#9a9a9a] line-clamp-2 leading-relaxed prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: exp.description }}
            />
          </div>
        ))}
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Experience"
        itemName={itemToDelete?.title || 'this experience'}
      />
    </div>
  );
}
