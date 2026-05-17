'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { compressToWebP } from '@/lib/image';
import { 
  Trash2, 
  Plus, 
  Image as ImageIcon, 
  Loader2, 
  X, 
  Pencil, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  GripHorizontal,
  GripVertical
} from 'lucide-react';
import { cn, purgeSystemCache } from '@/lib/utils';
import MediaLibraryModal from '@/components/Admin/MediaLibraryModal';

interface FormImage {
  id: string;
  type: 'existing' | 'new';
  url?: string;
  file?: File;
  previewUrl: string;
}

export default function AdminDesigns() {
  const [themes, setThemes] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', pdfUrl: '' });
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isMediaModalOpenForImages, setIsMediaModalOpenForImages] = useState(false);
  
  // Unified images state: tracks the exact order, including existing and new files
  const [formImages, setFormImages] = useState<FormImage[]>([]);
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Drag states
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [draggedThemeIndex, setDraggedThemeIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    const { data } = await supabase.from('design_themes').select('*').order('created_at', { ascending: false });
    if (data) setThemes(data as any[]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newItems: FormImage[] = Array.from(e.target.files).map((file) => ({
        id: `new-${Math.random()}`,
        type: 'new',
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      setFormImages(prev => [...prev, ...newItems]);
    }
  };

  const removeImage = (id: string) => {
    setFormImages(prev => prev.filter(img => img.id !== id));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === formImages.length - 1) return;

    const nextIndex = direction === 'left' ? index - 1 : index + 1;
    const updated = [...formImages];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    setFormImages(updated);
  };

  // Image Drag Handlers
  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleImageDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === targetIndex) return;

    const updated = [...formImages];
    const draggedItem = updated[draggedImageIndex];
    
    // Remove from old index and insert into target index
    updated.splice(draggedImageIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);
    
    setFormImages(updated);
    setDraggedImageIndex(null);
  };

  const handleThemeDragStart = (e: React.DragEvent, index: number) => {
    setDraggedThemeIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleThemeDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleThemeDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedThemeIndex === null || draggedThemeIndex === targetIndex) return;

    setIsSaving(true);
    try {
      const themeA = themes[draggedThemeIndex];
      const themeB = themes[targetIndex];

      // Swap created_at timestamps to swap display order
      const tempCreated = themeA.created_at;

      const { error: errorA } = await supabase
        .from('design_themes')
        .update({ created_at: themeB.created_at })
        .eq('id', themeA.id);

      if (errorA) throw errorA;

      const { error: errorB } = await supabase
        .from('design_themes')
        .update({ created_at: tempCreated })
        .eq('id', themeB.id);

      if (errorB) throw errorB;

      await fetchThemes();
    } catch (err: any) {
      alert('Error sorting themes: ' + err.message);
    } finally {
      setIsSaving(false);
      setDraggedThemeIndex(null);
    }
  };

  const moveTheme = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === themes.length - 1) return;

    setIsSaving(true);
    try {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const themeA = themes[index];
      const themeB = themes[targetIndex];

      // Swap created_at timestamps
      const tempCreated = themeA.created_at;

      const { error: errorA } = await supabase
        .from('design_themes')
        .update({ created_at: themeB.created_at })
        .eq('id', themeA.id);

      if (errorA) throw errorA;

      const { error: errorB } = await supabase
        .from('design_themes')
        .update({ created_at: tempCreated })
        .eq('id', themeB.id);

      if (errorB) throw errorB;

      await fetchThemes();
    } catch (err: any) {
      alert('Error sorting themes: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (theme: any) => {
    setEditingId(theme.id);
    const pdfMatch = theme.description?.match(/\[PDF:\s*(.*?)\]/);
    const cleanDescription = theme.description?.replace(/\[PDF:\s*(.*?)\]/, '').trim() || theme.description;
    setFormData({
      title: theme.title,
      description: cleanDescription || '',
      pdfUrl: theme.pdf_url || (pdfMatch ? pdfMatch[1] : '')
    });
    setFormImages((theme.images || []).map((url: string, index: number) => ({
      id: `existing-${index}-${Math.random()}`,
      type: 'existing',
      url,
      previewUrl: url
    })));
    
    // Smooth scroll to top form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', pdfUrl: '' });
    setFormImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    if (formImages.length === 0) {
      alert('Design theme must contain at least one image!');
      return;
    }

    setIsSaving(true);
    try {
      const finalImages: string[] = [];
      for (const item of formImages) {
        if (item.type === 'existing' && item.url) {
          finalImages.push(item.url);
        } else if (item.type === 'new' && item.file) {
          const compressedFile = await compressToWebP(item.file);
          const fileExt = compressedFile.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `designs/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('portfolio-assets').upload(filePath, compressedFile);
          if (uploadError) throw uploadError;
          finalImages.push(`/api/assets/${filePath}`);
        }
      }

      const finalDescription = formData.pdfUrl 
        ? `${formData.description}\n\n[PDF: ${formData.pdfUrl}]` 
        : formData.description;

      if (editingId) {
        // Update Design Theme
        const { error } = await supabase
          .from('design_themes')
          .update({ 
            title: formData.title, 
            description: finalDescription, 
            images: finalImages 
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        // Create Design Theme
        const { error } = await supabase.from('design_themes').insert([
          { title: formData.title, description: finalDescription, images: finalImages }
        ]);

        if (error) throw error;
      }

      // Reset State
      setFormData({ title: '', description: '', pdfUrl: '' });
      setFormImages([]);
      setEditingId(null);
      fetchThemes();
    } catch (err: any) {
      alert('Error saving theme: ' + err.message);
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
          <p className="text-[13px] text-[#707070]">Group your designs by theme and drag-and-drop to customize their exact order.</p>
        </div>
      </header>

      {/* Add / Edit Theme Form */}
      <form onSubmit={handleSubmit} className="p-6 bg-[#1c1c1c] border border-[#2e2e2e] rounded-md space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5 md:col-span-1">
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
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Description</label>
              <textarea 
                placeholder="Explain the design concept..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#171717] border border-[#2e2e2e] rounded-md px-3 py-2 text-[13px] text-[#ededed] h-24 resize-none focus:outline-none focus:border-[#3ecf8e] transition-all"
              />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">PDF Magazine File (Optional)</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. /api/assets/...pdf or direct link"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  className="w-full bg-[#171717] border border-[#2e2e2e] rounded-md px-3 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
                />
                <div className="flex items-center gap-2">
                  <label className="bg-[#2e2e2e] text-[#ededed] px-3.5 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider hover:bg-[#3e3e3e] transition-all border border-[#3e3e3e] cursor-pointer whitespace-nowrap">
                    Upload PDF
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="application/pdf" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsSaving(true);
                        try {
                          const fileExt = file.name.split('.').pop();
                          const fileName = `magazine-${Math.random()}.${fileExt}`;
                          const { error } = await supabase.storage.from('portfolio-assets').upload(`designs/${fileName}`, file);
                          if (error) throw error;
                          const cleanProxyUrl = `/api/assets/designs/${fileName}`;
                          setFormData(prev => ({ ...prev, pdfUrl: cleanProxyUrl }));
                          alert('PDF Magazine uploaded successfully!');
                        } catch (err: any) { 
                          alert('Upload failed: ' + err.message); 
                        } finally { 
                          setIsSaving(false); 
                        }
                      }} 
                    />
                  </label>
                  <button 
                    type="button"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="bg-[#3ecf8e] text-[#171717] px-3.5 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider hover:bg-[#24b47e] transition-all whitespace-nowrap"
                  >
                    Library
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#2e2e2e]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">
                Design Assets Ordering (First to Rightmost)
              </label>
              <span className="text-[11px] text-[#707070]">
                <strong>Drag and drop</strong> images directly, or use arrows to adjust position. The rightmost is position #{formImages.length}.
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {formImages.map((item, i) => (
                <div 
                  key={item.id} 
                  draggable
                  onDragStart={(e) => handleImageDragStart(e, i)}
                  onDragOver={(e) => handleImageDragOver(e, i)}
                  onDragEnd={() => setDraggedImageIndex(null)}
                  onDrop={(e) => handleImageDrop(e, i)}
                  className={cn(
                    "relative aspect-video rounded bg-[#252525] overflow-hidden group border transition-all flex flex-col justify-between cursor-grab active:cursor-grabbing select-none",
                    draggedImageIndex === i ? "opacity-30 border-[#3ecf8e]" : "border-[#2e2e2e] hover:border-[#3ecf8e]/40"
                  )}
                >
                  {/* Image View */}
                  <div className="relative flex-1 bg-[#171717]">
                    <img src={item.previewUrl} className="w-full h-full object-cover pointer-events-none" />
                    <button 
                      type="button"
                      onClick={() => removeImage(item.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                    
                    {/* Drag Handle Indicator */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <GripHorizontal className="text-white" size={24} />
                    </div>

                    <div className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded leading-none select-none pointer-events-none ${
                      item.type === 'existing' ? 'bg-[#3ecf8e]/90 text-[#171717]' : 'bg-yellow-500/90 text-black'
                    }`}>
                      {item.type === 'existing' ? 'Live' : 'New'}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono pointer-events-none select-none">
                      #{i + 1} {i === formImages.length - 1 ? '(Rightmost)' : i === 0 ? '(Leftmost)' : ''}
                    </div>
                  </div>

                  {/* Move buttons */}
                  <div className="bg-[#1c1c1c] border-t border-[#2e2e2e] px-2 py-1 flex items-center justify-between gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => moveImage(i, 'left')}
                      disabled={i === 0}
                      className="p-1 text-[#707070] hover:text-[#3ecf8e] disabled:opacity-20 disabled:hover:text-[#707070] transition-colors cursor-pointer disabled:cursor-not-allowed"
                      title="Move Left"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <span className="text-[10px] text-[#707070] font-mono font-bold select-none">
                      {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => moveImage(i, 'right')}
                      disabled={i === formImages.length - 1}
                      className="p-1 text-[#707070] hover:text-[#3ecf8e] disabled:opacity-20 disabled:hover:text-[#707070] transition-colors cursor-pointer disabled:cursor-not-allowed"
                      title="Move Right"
                    >
                      <ArrowRight size={14} />
                    </button>
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
              <div className="aspect-video rounded border-2 border-dashed border-[#2e2e2e] flex flex-col items-center justify-center p-3 gap-2 bg-[#171717]/10">
                <Plus size={16} className="text-[#707070]" />
                <div className="flex flex-col gap-1.5 w-full">
                  <label 
                    htmlFor="design-assets-input"
                    className="w-full text-center py-1 bg-[#2e2e2e] hover:bg-[#3e3e3e] text-[#ededed] text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer border border-[#3e3e3e] transition-colors"
                  >
                    Upload File
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMediaModalOpenForImages(true)}
                    className="w-full text-center py-1 bg-[#3ecf8e] hover:bg-[#24b47e] text-[#171717] text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer transition-colors"
                  >
                    From Library
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-[#2e2e2e] pt-6">
          <button 
            type="submit"
            disabled={isSaving}
            className="bg-[#3ecf8e] text-[#171717] px-6 py-2.5 rounded-md text-[13px] font-medium hover:bg-[#24b47e] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
            {editingId ? 'Update Design Theme' : 'Create Design Theme'}
          </button>
          
          {editingId && (
            <button 
              type="button"
              onClick={cancelEdit}
              className="border border-[#2e2e2e] text-[#ededed] px-6 py-2.5 rounded-md text-[13px] font-medium hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Themes List */}
      <div className="space-y-3">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">
          Active Design Themes ({themes.length}) - Drag and drop items or use arrows to reorder
        </label>
        <div className="grid grid-cols-1 gap-4">
          {themes.map((theme, index) => (
            <div 
              key={theme.id} 
              draggable
              onDragStart={(e) => handleThemeDragStart(e, index)}
              onDragOver={(e) => handleThemeDragOver(e, index)}
              onDragEnd={() => setDraggedThemeIndex(null)}
              onDrop={(e) => handleThemeDrop(e, index)}
              className={cn(
                "p-4 bg-[#1c1c1c] border rounded-md flex items-center justify-between group hover:border-[#3e3e3e] transition-all cursor-grab active:cursor-grabbing",
                draggedThemeIndex === index ? "opacity-30 border-[#3ecf8e]" : "border-[#2e2e2e]"
              )}
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Drag handle dots */}
                <div className="text-[#404040] group-hover:text-[#707070] transition-colors pr-1 pointer-events-none select-none">
                  <GripVertical size={18} />
                </div>

                {/* Theme Sort Controls */}
                <div className="flex flex-col gap-1 border-r border-[#2e2e2e] pr-3 mr-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => moveTheme(index, 'up')}
                    disabled={index === 0 || isSaving}
                    className="p-1 text-[#707070] hover:text-[#3ecf8e] disabled:opacity-20 disabled:hover:text-[#707070] transition-colors cursor-pointer disabled:cursor-not-allowed"
                    title="Move Theme Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTheme(index, 'down')}
                    disabled={index === themes.length - 1 || isSaving}
                    className="p-1 text-[#707070] hover:text-[#3ecf8e] disabled:opacity-20 disabled:hover:text-[#707070] transition-colors cursor-pointer disabled:cursor-not-allowed"
                    title="Move Theme Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                <div className="flex -space-x-3 shrink-0 pointer-events-none select-none">
                  {(theme.images || []).slice(0, 3).map((img: string, i: number) => (
                    <img key={i} src={img} className="w-9 h-9 rounded-full border-2 border-[#1c1c1c] object-cover" />
                  ))}
                  {(theme.images || []).length > 3 && (
                    <div className="w-9 h-9 rounded-full bg-[#2e2e2e] border-2 border-[#1c1c1c] flex items-center justify-center text-[10px] text-[#707070] font-bold">
                      +{(theme.images || []).length - 3}
                    </div>
                  )}
                </div>
                <div className="space-y-0.5 min-w-0 flex-1 pr-4 pointer-events-none select-none">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-[#707070] bg-[#2e2e2e] px-1.5 py-0.5 rounded shrink-0">Order #{index + 1}</span>
                    <h3 className="text-[14px] font-medium text-[#ededed] truncate">{theme.title}</h3>
                  </div>
                  <p className="text-[11px] text-[#707070] uppercase font-bold tracking-wider">{(theme.images || []).length} Assets</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
                <button 
                  type="button"
                  onClick={() => startEdit(theme)}
                  className="p-2 text-[#707070] hover:text-[#3ecf8e] transition-colors cursor-pointer"
                  title="Edit Theme"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  type="button"
                  onClick={() => handleDelete(theme.id)}
                  className="p-2 text-[#707070] hover:text-red-500 transition-colors cursor-pointer"
                  title="Delete Theme"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <MediaLibraryModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => setFormData(prev => ({ ...prev, pdfUrl: url }))}
        title="Select Design PDF / Magazine"
      />
      <MediaLibraryModal 
        isOpen={isMediaModalOpenForImages}
        onClose={() => setIsMediaModalOpenForImages(false)}
        onSelect={(url) => {
          const newImg: FormImage = {
            id: `existing-lib-${Math.random()}`,
            type: 'existing',
            url,
            previewUrl: url
          };
          setFormImages(prev => [...prev, newImg]);
          setIsMediaModalOpenForImages(false);
        }}
        title="Select Design Images"
      />
    </div>
  );
}
