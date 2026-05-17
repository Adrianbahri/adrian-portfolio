'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Image as ImageIcon, Loader2, X } from 'lucide-react';

export default function AdminDesigns() {
  const [themes, setThemes] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadMode, setUploadMode] = useState<'single' | 'batch'>('single');
  
  // Single Theme state
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Batch Upload state
  const [batchFiles, setBatchFiles] = useState<{ file: File; title: string; description: string }[]>([]);

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

  // Batch Upload handlers
  const handleBatchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => {
        const cleanName = file.name
          .split('.')
          .slice(0, -1)
          .join('.')
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        return {
          file,
          title: cleanName,
          description: ''
        };
      });
      setBatchFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeBatchFile = (index: number) => {
    setBatchFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBatchFieldChange = (index: number, field: 'title' | 'description', value: string) => {
    setBatchFiles(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleBatchUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (batchFiles.length === 0) return;

    setIsSaving(true);
    try {
      for (const item of batchFiles) {
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `designs/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('portfolio-assets')
          .upload(filePath, item.file);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-assets')
          .getPublicUrl(filePath);

        const { error } = await supabase.from('design_themes').insert([
          { 
            title: item.title || 'Untitled Design', 
            description: item.description, 
            images: [publicUrl] 
          }
        ]);

        if (error) throw error;
      }

      setBatchFiles([]);
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

      {/* Mode Switcher */}
      <div className="flex border-b border-[#2e2e2e] gap-6">
        <button 
          onClick={() => setUploadMode('single')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all ${
            uploadMode === 'single' ? "border-b-2 border-[#3ecf8e] text-[#3ecf8e]" : "text-[#707070] hover:text-[#ededed]"
          }`}
        >
          Single Theme (Multiple Images)
        </button>
        <button 
          onClick={() => setUploadMode('batch')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all ${
            uploadMode === 'batch' ? "border-b-2 border-[#3ecf8e] text-[#3ecf8e]" : "text-[#707070] hover:text-[#ededed]"
          }`}
        >
          Batch Upload (Individual Designs)
        </button>
      </div>

      {uploadMode === 'single' ? (
        /* Add Theme Form */
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
                <label className="w-16 h-16 rounded border-2 border-dashed border-[#2e2e2e] hover:border-[#3ecf8e]/40 transition-colors flex items-center justify-center cursor-pointer group">
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
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
      ) : (
        /* Batch Upload Form */
        <form onSubmit={handleBatchUpload} className="p-6 bg-[#1c1c1c] border border-[#2e2e2e] rounded-md space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Select Multiple Design Files</label>
              {batchFiles.length > 0 && (
                <button 
                  type="button" 
                  onClick={() => setBatchFiles([])}
                  className="text-[11px] font-bold uppercase tracking-wider text-red-500 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batchFiles.map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-[#171717] border border-[#2e2e2e] rounded-md relative group">
                  <div className="w-16 h-16 rounded bg-[#2e2e2e] overflow-hidden shrink-0">
                    <img src={URL.createObjectURL(item.file)} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-[#707070]">Design Title</label>
                      <input 
                        type="text"
                        value={item.title}
                        onChange={(e) => handleBatchFieldChange(i, 'title', e.target.value)}
                        className="w-full bg-[#202020] border border-[#2e2e2e] rounded px-2.5 py-1 text-[12px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-[#707070]">Description (Optional)</label>
                      <input 
                        type="text"
                        placeholder="Description..."
                        value={item.description}
                        onChange={(e) => handleBatchFieldChange(i, 'description', e.target.value)}
                        className="w-full bg-[#202020] border border-[#2e2e2e] rounded px-2.5 py-1 text-[12px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
                      />
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeBatchFile(i)}
                    className="absolute top-2 right-2 p-1 text-[#707070] hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <label className="border-2 border-dashed border-[#2e2e2e] hover:border-[#3ecf8e]/40 transition-colors rounded-md p-8 flex flex-col items-center justify-center gap-3 cursor-pointer group min-h-[140px] md:col-span-2">
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleBatchFileChange} />
                <Plus size={32} className="text-[#707070] group-hover:text-[#3ecf8e] transition-colors" />
                <div className="text-center space-y-1">
                  <span className="block text-[12px] font-medium text-[#ededed] group-hover:text-[#3ecf8e] transition-colors">Choose design files to upload</span>
                  <span className="block text-[10px] text-[#707070]">You can select multiple files at once</span>
                </div>
              </label>
            </div>
          </div>

          {batchFiles.length > 0 && (
            <button 
              disabled={isSaving}
              className="bg-[#3ecf8e] text-[#171717] px-6 py-2.5 rounded-md text-[13px] font-medium hover:bg-[#24b47e] transition-all flex items-center gap-2"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
              Upload {batchFiles.length} Designs
            </button>
          )}
        </form>
      )}

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
