'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Loader2, 
  FileText,
  ExternalLink,
  Save,
  X
} from 'lucide-react';
import { cn, purgeSystemCache } from '@/lib/utils';
import MediaLibraryModal from '@/components/Admin/MediaLibraryModal';
import PdfThumbnail from '@/components/PdfThumbnail';

export default function AdminMagazines() {
  const [magazines, setMagazines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pdfUrl: '',
    category: 'Magazine'
  });
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fetchMagazines = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('magazines')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) {
        // Table might not exist yet, we will log but not crash
        console.warn('Magazines table fetch failed. Make sure to run the sync script in Supabase dashboard.');
      } else if (data) {
        setMagazines(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMagazines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.pdfUrl) {
      alert('Title and PDF File Link are required!');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        // Update magazine
        const { error } = await supabase
          .from('magazines')
          .update({
            title: formData.title,
            description: formData.description,
            pdf_url: formData.pdfUrl,
            category: formData.category
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        // Insert new magazine
        // Get next order index
        const nextOrderIndex = magazines.length > 0 
          ? Math.max(...magazines.map(m => m.order_index || 0)) + 1 
          : 0;

        const { error } = await supabase
          .from('magazines')
          .insert([
            {
              title: formData.title,
              description: formData.description,
              pdf_url: formData.pdfUrl,
              category: formData.category,
              order_index: nextOrderIndex
            }
          ]);

        if (error) throw error;
      }

      // Reset
      setFormData({ title: '', description: '', pdfUrl: '', category: 'Magazine' });
      setEditingId(null);
      await fetchMagazines();
      await purgeSystemCache();
      alert('Magazine / Print layout saved successfully!');
    } catch (err: any) {
      alert('Error saving magazine: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (mag: any) => {
    setEditingId(mag.id);
    setFormData({
      title: mag.title,
      description: mag.description || '',
      pdfUrl: mag.pdf_url || '',
      category: mag.category || 'Magazine'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', pdfUrl: '', category: 'Magazine' });
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this publication / layout?')) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('magazines').delete().eq('id', id);
      if (error) throw error;
      await fetchMagazines();
      await purgeSystemCache();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder functions
  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === magazines.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const itemA = magazines[index];
    const itemB = magazines[targetIndex];

    setIsSaving(true);
    try {
      const { error: errorA } = await supabase
        .from('magazines')
        .update({ order_index: itemB.order_index })
        .eq('id', itemA.id);

      const { error: errorB } = await supabase
        .from('magazines')
        .update({ order_index: itemA.order_index })
        .eq('id', itemB.id);

      if (errorA || errorB) throw new Error('Order swap failed');

      await fetchMagazines();
      await purgeSystemCache();
    } catch (err: any) {
      alert('Sorting failed: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const list = [...magazines];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setMagazines(list);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;
    setDraggedIndex(null);

    setIsSaving(true);
    try {
      // Reassign order indices based on current list order
      for (let i = 0; i < magazines.length; i++) {
        await supabase
          .from('magazines')
          .update({ order_index: i })
          .eq('id', magazines[i].id);
      }
      await fetchMagazines();
      await purgeSystemCache();
    } catch (err: any) {
      alert('Save order failed: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 text-[#ededed] font-sans">
      <header className="flex items-center justify-between py-4 border-b border-[#2e2e2e]">
        <div className="space-y-1">
          <h1 className="text-xl font-medium text-[#ededed] tracking-tight uppercase">Print & Editorial CMS</h1>
          <p className="text-[12px] text-[#707070]">Manage your printed magazines, packaging designs, booklet layouts, and posters.</p>
        </div>
      </header>

      {/* Editor Form (COMPLETELY SHARP AND BOXY - ROUNDED-NONE) */}
      <form onSubmit={handleSubmit} className="p-6 bg-[#1c1c1c] border border-[#2e2e2e] rounded-none space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#3ecf8e]">
          {editingId ? 'Edit Layout' : 'Add New Layout / Magazine'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Column 1: Title & Category */}
          <div className="space-y-4 md:col-span-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Publication Title</label>
              <input 
                type="text" 
                placeholder="e.g. Unhas Dalam Angka"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#171717] border border-[#2e2e2e] rounded-none px-3 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Design Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#171717] border border-[#2e2e2e] rounded-none px-3 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
              >
                <option value="Magazine">Magazine / Editorial</option>
                <option value="Packaging">Packaging Design</option>
                <option value="Poster">Poster Collection</option>
              </select>
            </div>
          </div>

          {/* Column 2: Description */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Concept & Description</label>
            <textarea 
              placeholder="Explain the structure, theme, spreads, layout rules..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#171717] border border-[#2e2e2e] rounded-none px-3 py-2 text-[13px] text-[#ededed] h-[106px] resize-none focus:outline-none focus:border-[#3ecf8e] transition-all"
            />
          </div>

          {/* Column 3: PDF File Link */}
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">PDF or Image File Link</label>
            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                placeholder="e.g. /api/assets/designs/file.pdf (or .png/.jpg)"
                value={formData.pdfUrl}
                onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                className="w-full bg-[#171717] border border-[#2e2e2e] rounded-none px-3 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
              />
              
              <div className="flex items-center gap-2">
                <label className="bg-[#2e2e2e] text-[#ededed] px-3.5 py-1.5 rounded-none text-[11px] font-bold uppercase tracking-wider hover:bg-[#3e3e3e] transition-all border border-[#3e3e3e] cursor-pointer whitespace-nowrap">
                  Upload PDF / Image
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsSaving(true);
                      try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `magazine-${Math.random()}.${fileExt}`;
                        const { error } = await supabase.storage
                          .from('portfolio-assets')
                          .upload(`designs/${fileName}`, file);
                        
                        if (error) throw error;
                        const proxyUrl = `/api/assets/designs/${fileName}`;
                        setFormData(prev => ({ ...prev, pdfUrl: proxyUrl }));
                        alert('File uploaded successfully!');
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
                  className="bg-[#3ecf8e] text-[#171717] px-3.5 py-1.5 rounded-none text-[11px] font-bold uppercase tracking-wider hover:bg-[#24b47e] transition-all whitespace-nowrap cursor-pointer"
                >
                  Library
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons (COMPLETELY SHARP AND BOXY - ROUNDED-NONE) */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2e2e2e]">
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="border border-[#2e2e2e] text-[#ededed] px-6 py-2.5 rounded-none text-[13px] font-medium hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <X size={14} /> Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="bg-[#3ecf8e] hover:bg-[#24b47e] text-[#171717] px-8 py-2.5 rounded-none text-[13px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            {editingId ? 'Update Layout' : 'Publish Layout'}
          </button>
        </div>
      </form>

      {/* Database Listing (COMPLETELY SHARP AND BOXY - ROUNDED-NONE) */}
      <div className="space-y-3">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">
          Active Publications / Layouts ({magazines.length})
        </label>
        
        {loading ? (
          <div className="py-20 bg-[#1c1c1c] border border-[#2e2e2e] flex flex-col items-center justify-center gap-2 text-[#707070] rounded-none">
            <Loader2 className="animate-spin text-[#3ecf8e]" size={28} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Checking publications database...</span>
          </div>
        ) : magazines.length === 0 ? (
          <div className="py-20 bg-[#1c1c1c] border border-[#2e2e2e] text-center text-[#707070] rounded-none space-y-2">
            <FileText className="mx-auto" size={32} />
            <p className="text-[13px] font-sans">No publications added yet. Use the sync panel first, then add your first layout!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {magazines.map((mag, index) => (
              <div 
                key={mag.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-center gap-4 bg-[#1c1c1c] border border-[#2e2e2e] p-4 rounded-none group hover:border-[#3ecf8e]/30 transition-all duration-300",
                  draggedIndex === index && "opacity-30 border-dashed border-[#3ecf8e]"
                )}
              >
                {/* Drag arrows & order */}
                <div className="flex flex-col gap-1 border-r border-[#2e2e2e] pr-3 mr-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0 || isSaving}
                    className="p-1 text-[#707070] hover:text-[#3ecf8e] disabled:opacity-20 transition-colors cursor-pointer"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === magazines.length - 1 || isSaving}
                    className="p-1 text-[#707070] hover:text-[#3ecf8e] disabled:opacity-20 transition-colors cursor-pointer"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                {/* PDF Live Cover Auto-rendered */}
                <div className="w-12 h-16 shrink-0 bg-[#111] border border-white/10 select-none overflow-hidden relative group/cover">
                  {mag.pdf_url && (
                    <PdfThumbnail pdfUrl={mag.pdf_url} className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Detail content */}
                <div className="space-y-0.5 min-w-0 flex-1 pr-4 pointer-events-none select-none">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-[#707070] bg-[#2e2e2e] px-1.5 py-0.5 rounded-none shrink-0 border border-[#3e3e3e]">Order #{index + 1}</span>
                    <span className="text-[10px] font-mono text-[#3ecf8e] bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 px-1.5 py-0.5 rounded-none shrink-0 uppercase tracking-widest">{mag.category}</span>
                    <h3 className="text-[14px] font-medium text-[#ededed] truncate leading-none">{mag.title}</h3>
                  </div>
                  <p className="text-[11px] text-[#707070] font-sans line-clamp-1">{mag.description || 'No description provided'}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
                  <a 
                    href={mag.pdf_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-[#707070] hover:text-white transition-colors cursor-pointer"
                    title="Open PDF File"
                  >
                    <ExternalLink size={15} />
                  </a>
                  <button 
                    type="button"
                    onClick={() => startEdit(mag)}
                    className="p-2 text-[#707070] hover:text-[#3ecf8e] transition-colors cursor-pointer"
                    title="Edit publication"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDelete(mag.id)}
                    className="p-2 text-[#707070] hover:text-red-500 transition-colors cursor-pointer"
                    title="Delete publication"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Media Library selector modal */}
      {isMediaModalOpen && (
        <MediaLibraryModal
          isOpen={isMediaModalOpen}
          onClose={() => setIsMediaModalOpen(false)}
          onSelect={(url) => {
            setFormData(prev => ({ ...prev, pdfUrl: url }));
            setIsMediaModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
