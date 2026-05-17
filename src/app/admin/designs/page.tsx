'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Image as ImageIcon, Loader2, X } from 'lucide-react';

export default function AdminDesigns() {
  const [themes, setThemes] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    const { data } = await supabase.from('design_themes').select('*').order('created_at', { ascending: false });
    if (data) setThemes(data as any[]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || selectedFiles.length === 0) return;

    setIsSaving(true);
    try {
      const imageUrls = [];
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `designs/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('portfolio-assets').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
        imageUrls.push(publicUrl);
      }

      const { error } = await supabase.from('design_themes').insert([
        { title: formData.title, description: formData.description, images: imageUrls }
      ]);

      if (error) throw error;
      setFormData({ title: '', description: '' });
      setSelectedFiles([]);
      fetchThemes();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus tema desain ini?')) return;
    await supabase.from('design_themes').delete().eq('id', id);
    fetchThemes();
  };

  return (
    <div className="space-y-8 pb-20 text-[#ededed]">
      <header className="flex items-center justify-between py-4 border-b border-[#2e2e2e]">
        <div className="space-y-1">
          <h1 className="text-xl font-medium text-[#ededed]">Design Showcase</h1>
          <p className="text-[13px] text-[#707070]">Group your designs by theme and concept.</p>
        </div>
      </header>

      {/* Add Theme Form */}
      <form onSubmit={handleAddTheme} className="p-6 bg-[#1c1c1c] border border-[#2e2e2e] rounded-md space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Theme Title</label>
              <input 
                type="text" 
                placeholder="e.g. Health & Wellness UI"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#171717] border border-[#2e2e2e] rounded-md px-3 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Description</label>
              <textarea 
                placeholder="Explain the design concept..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#171717] border border-[#2e2e2e] rounded-md px-3 py-2 text-[13px] text-[#ededed] h-24 resize-none focus:outline-none focus:border-[#3ecf8e] transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Design Assets (Upload Many)</label>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, i) => (
                <div key={i} className="relative w-16 h-16 rounded bg-[#2e2e2e] overflow-hidden group">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-50" />
                  <button 
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ))}
              
              <input 
                id="design-assets-input"
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
              <label 
                htmlFor="design-assets-input"
                className="w-16 h-16 rounded border-2 border-dashed border-[#2e2e2e] hover:border-[#3ecf8e]/40 transition-colors flex items-center justify-center cursor-pointer group"
              >
                <Plus size={20} className="text-[#707070] group-hover:text-[#3ecf8e] transition-colors" />
              </label>
            </div>
          </div>
        </div>

        <button 
          disabled={isSaving}
          className="bg-[#3ecf8e] text-[#171717] px-6 py-2.5 rounded-md text-[13px] font-medium hover:bg-[#24b47e] transition-all flex items-center gap-2"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          Create Design Theme
        </button>
      </form>

      {/* Themes List */}
      <div className="grid grid-cols-1 gap-4">
        {themes.map((theme) => (
          <div key={theme.id} className="p-4 bg-[#1c1c1c] border border-[#2e2e2e] rounded-md flex items-center justify-between group hover:border-[#3e3e3e] transition-all">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {theme.images.slice(0, 3).map((img: string, i: number) => (
                  <img key={i} src={img} className="w-9 h-9 rounded-full border-2 border-[#1c1c1c] object-cover" />
                ))}
                {theme.images.length > 3 && (
                  <div className="w-9 h-9 rounded-full bg-[#2e2e2e] border-2 border-[#1c1c1c] flex items-center justify-center text-[10px] text-[#707070] font-bold">
                    +{theme.images.length - 3}
                  </div>
                )}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-[14px] font-medium text-[#ededed]">{theme.title}</h3>
                <p className="text-[11px] text-[#707070] uppercase font-bold tracking-wider">{theme.images.length} Assets</p>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(theme.id)}
              className="p-2 text-[#707070] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
