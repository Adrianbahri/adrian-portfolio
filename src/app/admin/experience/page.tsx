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
import { compressToWebP } from '@/lib/image';
import { cn, purgeSystemCache } from '@/lib/utils';
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
    title: '', company: '', timeline: '', location: '', description: '', points: [] as string[]
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
      description: exp.description || '',
      points: Array.isArray(exp.points) ? exp.points : []
    });
    setView('edit');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editingId) { await supabase.from('experiences').update(formData).eq('id', editingId); }
      else { await supabase.from('experiences').insert([formData]); }
      await purgeSystemCache();
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
      await purgeSystemCache();
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
        onImageUpload={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = async (e: any) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
               const compressedFile = await compressToWebP(file);
               const fileExt = compressedFile.name.split('.').pop();
               const fileName = `${Math.random()}.${fileExt}`;
               const { data, error } = await supabase.storage.from('portfolio-assets').upload(fileName, compressedFile);
               if (error) throw error;
               const cleanProxyUrl = `/api/assets/${fileName}`;
               setFormData(prev => ({ ...prev, description: prev.description + `<img src="${cleanProxyUrl}" alt="Experience Image" />` }));
            } catch (err: any) { alert(err.message); }
          };
          input.click();
        }}
        topContent={
          <div className="space-y-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Key Highlights / Points Builder */}
            <div className="space-y-3 bg-[#171717] border border-[#2e2e2e] rounded-lg p-5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">Key Highlights / Achievements</label>
                <span className="text-[10px] text-[#707070] font-mono">{formData.points.length} points</span>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {formData.points.map((point, index) => (
                  <div key={index} className="flex items-start gap-2 bg-[#202020] border border-[#2e2e2e] rounded px-3 py-2 text-[12px] group">
                    <span className="text-[#3ecf8e] mt-0.5">•</span>
                    <span className="flex-1 text-[#ededed] leading-relaxed">{point}</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          points: prev.points.filter((_, idx) => idx !== index)
                        }));
                      }}
                      className="text-[#707070] hover:text-[#ff2201] p-0.5 rounded hover:bg-[#2e2e2e] transition-all shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {formData.points.length === 0 && (
                  <p className="text-[11px] text-[#707070] italic">No highlights added yet. Add some achievements below.</p>
                )}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="newPointInput"
                  placeholder="Add a key highlight or responsibility..."
                  className="flex-1 bg-[#1c1c1c] border border-[#2e2e2e] rounded px-3 py-1.5 text-[12px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value) {
                        setFormData(prev => ({
                          ...prev,
                          points: [...prev.points, value]
                        }));
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button 
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('newPointInput') as HTMLInputElement;
                    const value = input?.value.trim();
                    if (value) {
                      setFormData(prev => ({
                        ...prev,
                        points: [...prev.points, value]
                      }));
                      input.value = '';
                    }
                  }}
                  className="bg-[#2e2e2e] hover:bg-[#3e3e3e] text-[#ededed] border border-[#2e2e2e] px-4 py-1.5 rounded text-[12px] font-medium transition-all"
                >
                  Add
                </button>
              </div>
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
          onClick={() => { setEditingId(null); setFormData({ title: '', company: '', timeline: '', location: '', description: '', points: [] }); setView('edit'); }}
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
              className="text-[13px] text-[#9a9a9a] line-clamp-2 leading-relaxed prose prose-invert prose-sm max-w-none mb-4"
              dangerouslySetInnerHTML={{ __html: exp.description }}
            />

            {exp.points && exp.points.length > 0 && (
              <div className="pt-4 border-t border-[#2e2e2e] space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#3ecf8e]/70">Key Highlights:</p>
                <div className="space-y-1.5">
                  {exp.points.slice(0, 3).map((pt: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-[#9a9a9a]">
                      <span className="text-[#3ecf8e] shrink-0 font-bold">•</span>
                      <span className="line-clamp-1">{pt}</span>
                    </div>
                  ))}
                  {exp.points.length > 3 && (
                    <p className="text-[10px] text-[#707070] italic pl-2.5">+{exp.points.length - 3} more highlights</p>
                  )}
                </div>
              </div>
            )}
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
