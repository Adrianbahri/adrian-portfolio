'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Image as ImageIcon, Loader2, X, Pencil } from 'lucide-react';

export default function AdminDesigns() {
  const [themes, setThemes] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

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

  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  const startEdit = (theme: any) => {
    setEditingId(theme.id);
    setFormData({
      title: theme.title,
      description: theme.description || ''
    });
    setExistingImages(theme.images || []);
    setSelectedFiles([]); // Reset new files queue
    
    // Smooth scroll to top form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '' });
    setExistingImages([]);
    setSelectedFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    if (!editingId && selectedFiles.length === 0) return;

    setIsSaving(true);
    try {
      const newUrls = [];
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `designs/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('portfolio-assets').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
        newUrls.push(publicUrl);
      }

      const finalImages = [...existingImages, ...newUrls];
      if (finalImages.length === 0) {
        alert('Design theme must contain at least one image!');
        setIsSaving(false);
        return;
      }

      if (editingId) {
        // Update Design Theme
        const { error } = await supabase
          .from('design_themes')
          .update({ 
            title: formData.title, 
            description: formData.description, 
            images: finalImages 
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        // Create Design Theme
        const { error } = await supabase.from('design_themes').insert([
          { title: formData.title, description: formData.description, images: finalImages }
        ]);

        if (error) throw error;
      }

      // Reset State
      setFormData({ title: '', description: '' });
      setSelectedFiles([]);
      setExistingImages([]);
      setEditingId(null);
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

      {/* Add / Edit Theme Form */}
      <form onSubmit={handleSubmit} className="p-6 bg-[#1c1c1c] border border-[#2e2e2e] rounded-md space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">
                {editingId ? 'Edit Theme Title' : 'Theme Title'}
              </label>
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
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">
              Design Assets {editingId ? '(Add or Manage)' : '(Upload Many)'}
            </label>
            <div className="flex flex-wrap gap-2">
              {/* Existing Images (Edit Mode Only) */}
              {editingId && existingImages.map((url, i) => (
                <div key={`existing-${i}`} className="relative w-16 h-16 rounded bg-[#2e2e2e] overflow-hidden group border border-[#2e2e2e]">
                  <img src={url} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} className="text-white" />
                  </button>
                  <div className="absolute top-0 right-0 bg-[#3ecf8e] text-[#171717] text-[8px] font-bold px-1 rounded-bl leading-normal">
                    Live
                  </div>
                </div>
              ))}

              {/* Newly Selected Files */}
              {selectedFiles.map((file, i) => (
                <div key={`new-${i}`} className="relative w-16 h-16 rounded bg-[#2e2e2e] overflow-hidden group border border-[#3ecf8e]/30">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-60" />
                  <button 
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} className="text-white" />
                  </button>
                  <div className="absolute top-0 right-0 bg-yellow-500 text-canvas text-[8px] font-bold px-1 rounded-bl leading-normal">
                    New
                  </div>
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

        <div className="flex items-center gap-3">
          <button 
            type="submit"
            disabled={isSaving}
            className="bg-[#3ecf8e] text-[#171717] px-6 py-2.5 rounded-md text-[13px] font-medium hover:bg-[#24b47e] transition-all flex items-center gap-2"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
            {editingId ? 'Update Design Theme' : 'Create Design Theme'}
          </button>
          
          {editingId && (
            <button 
              type="button"
              onClick={cancelEdit}
              className="border border-[#2e2e2e] text-[#ededed] px-6 py-2.5 rounded-md text-[13px] font-medium hover:bg-white/5 transition-all"
            >
              Cancel Edit
            </button>
          )}
        </div>
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
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => startEdit(theme)}
                className="p-2 text-[#707070] hover:text-[#3ecf8e] transition-colors"
                title="Edit Theme"
              >
                <Pencil size={16} />
              </button>
              <button 
                onClick={() => handleDelete(theme.id)}
                className="p-2 text-[#707070] hover:text-red-500 transition-colors"
                title="Delete Theme"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
