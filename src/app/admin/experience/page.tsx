'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Briefcase,
  MapPin,
  X,
  Save,
  ChevronLeft
} from 'lucide-react';
import Editor from '@/components/Editor';
import { workData as staticWork } from '@/wdata/experience';
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const allExperiences = experiences;

  if (view === 'list') {
    return (
      <div data-lenis-prevent className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
        <header className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-xl font-medium text-[#ededed]">Experience</h1>
            <p className="text-[13px] text-[#707070]">Professional career history and roles.</p>
          </div>
          <button
            onClick={() => { setEditingId(null); setFormData({ title: '', company: '', timeline: '', location: '', description: '' }); setView('edit'); }}
            className="bg-[#3ecf8e] text-[#171717] px-3 py-1.5 rounded-md text-[13px] font-medium hover:bg-[#24b47e] transition-all"
          >
            New Experience
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allExperiences.map((exp, i) => (
            <div key={exp.id || i} className="group relative bg-[#1c1c1c] border border-[#2e2e2e] rounded-md p-5 hover:border-[#3e3e3e] transition-all shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="w-8 h-8 bg-[#252525] rounded-md flex items-center justify-center text-[#3ecf8e] border border-[#2e2e2e]">
                  <Briefcase size={14} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(exp)} className="p-1.5 bg-[#252525] text-[#9a9a9a] rounded hover:text-white border border-[#2e2e2e] transition-all"><Edit2 size={12} /></button>
                  <button onClick={() => confirmDelete(exp)} className="p-1.5 bg-[#252525] text-[#9a9a9a] rounded hover:text-[#ff2201] border border-[#2e2e2e] transition-all"><Trash2 size={12} /></button>
                </div>
              </div>
              <h3 className="text-[15px] font-medium text-[#ededed] leading-snug">{exp.title}</h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#707070] mb-3">{exp.company}</p>
              <div className="flex flex-wrap gap-2 text-[10px] text-[#707070] mb-4">
                <span className="px-1.5 py-0.5 rounded bg-[#252525] border border-[#2e2e2e]">{exp.timeline}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#252525] border border-[#2e2e2e]">{exp.location}</span>
              </div>
              <p className="text-[13px] text-[#9a9a9a] line-clamp-2 leading-relaxed">{exp.description}</p>
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

  return (
    <div data-lenis-prevent className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
      <header className="flex items-center justify-between border-b border-[#2e2e2e] pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="w-8 h-8 bg-[#252525] rounded-md border border-[#2e2e2e] flex items-center justify-center text-[#707070] hover:text-[#ededed] transition-all"><ChevronLeft size={16} /></button>
          <h2 className="text-xl font-medium text-[#ededed]">{editingId ? 'Edit' : 'Create'} Experience</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="px-4 py-1.5 text-[13px] font-medium text-[#707070] hover:text-[#ededed]">Cancel</button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#3ecf8e] text-[#171717] px-5 py-1.5 rounded-md text-[13px] font-medium hover:bg-[#24b47e] transition-all flex items-center gap-2"
          >
            {isSaving ? 'Saving...' : <><Save size={14} /> Save Experience</>}
          </button>
        </div>
      </header>

      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Role Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
              placeholder="e.g. Senior Software Engineer"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Company / Organization</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
              placeholder="e.g. Supabase"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Timeline</label>
            <input
              type="text"
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
              placeholder="e.g. Jan 2024 — Present"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
              placeholder="e.g. Remote"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Job Description</label>
          <div className="min-h-[300px] flex flex-col">
            <Editor
              content={formData.description}
              onChange={(content) => setFormData({ ...formData, description: content })}
              onImageUpload={() => {
                // For experience, image upload might not be as common but let's keep the option
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async (e: any) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const { data, error } = await supabase.storage.from('portfolio-assets').upload(fileName, file);
                    if (error) throw error;
                    const { data: { publicUrl } } = supabase.storage.from('portfolio-assets').getPublicUrl(fileName);
                    setFormData(prev => ({ ...prev, description: prev.description + `<img src="${publicUrl}" alt="Exp image" />` }));
                  } catch (err: any) { alert('Upload failed: ' + err.message); }
                };
                input.click();
              }}
            />
          </div>
          <p className="text-[10px] text-[#707070] mt-1 italic">Professional rich-text editor enabled.</p>
        </div>
      </form>
    </div>
  );
}
