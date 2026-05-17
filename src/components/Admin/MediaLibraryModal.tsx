'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Plus, Loader2, Check, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { compressToWebP } from '@/lib/image';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
}

export default function MediaLibraryModal({ isOpen, onClose, onSelect, title = "Select from Media Library" }: MediaLibraryModalProps) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPhotos();
      setSelectedUrl(null);
    }
  }, [isOpen]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      // 1. Fetch root items from the portfolio-assets bucket
      const { data: rootItems, error: rootError } = await supabase.storage
        .from('portfolio-assets')
        .list('', { limit: 150 });

      if (rootError) throw rootError;

      const items = rootItems || [];

      // Separate root files and subfolders
      const rootFiles = items.filter(item => item.metadata !== null && item.name !== '.emptyFolderPlaceholder');
      const folders = items.filter(item => item.metadata === null);

      // 2. Fetch contents of each folder in parallel
      const folderPromises = folders.map(async (folder) => {
        try {
          const { data: folderItems, error: folderError } = await supabase.storage
            .from('portfolio-assets')
            .list(folder.name, { limit: 150 });

          if (folderError) return [];

          return (folderItems || [])
            .filter(item => item.metadata !== null && item.name !== '.emptyFolderPlaceholder')
            .map(item => ({
              id: item.id,
              name: item.name,
              created_at: item.created_at || item.updated_at,
              image_url: `/api/assets/${folder.name}/${item.name}`
            }));
        } catch (e) {
          console.error(`Error listing folder ${folder.name}:`, e);
          return [];
        }
      });

      const nestedItemsArray = await Promise.all(folderPromises);

      // 3. Map root files to correct image_url proxy paths
      const mappedRootFiles = rootFiles.map(item => ({
        id: item.id,
        name: item.name,
        created_at: item.created_at || item.updated_at,
        image_url: `/api/assets/${item.name}`
      }));

      // 4. Merge all items and sort by date descending (newest first)
      const allAssets = [
        ...mappedRootFiles,
        ...nestedItemsArray.flat()
      ];

      allAssets.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      // Filter image and PDF types to display in the selector grid
      const imageAssets = allAssets.filter(asset => {
        const ext = asset.name.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'pdf'].includes(ext || '');
      });

      setPhotos(imageAssets);
    } catch (err) {
      console.error('Error fetching global storage assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const compressedFile = await compressToWebP(file);
        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('portfolio-assets')
          .upload(filePath, compressedFile);

        if (uploadError) throw uploadError;

        const cleanProxyUrl = `/api/assets/${filePath}`;
        return { image_url: cleanProxyUrl };
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      await fetchPhotos();
      
      // Auto-select the first newly uploaded image
      if (uploadedPhotos.length > 0 && uploadedPhotos[0]?.image_url) {
        setSelectedUrl(uploadedPhotos[0].image_url);
      }
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  const handleDelete = async (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation();
    if (!confirm('Hapus aset ini secara permanen dari Supabase Storage?')) return;

    try {
      const storagePath = imageUrl.replace(/^\/api\/assets\//, '');
      const { error } = await supabase.storage.from('portfolio-assets').remove([storagePath]);
      if (error) throw error;

      await supabase.from('gallery').delete().eq('image_url', imageUrl);
      
      if (selectedUrl === imageUrl) {
        setSelectedUrl(null);
      }
      
      fetchPhotos();
    } catch (err: any) {
      alert('Gagal menghapus file: ' + err.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl h-[80vh] flex flex-col bg-[#171717] border border-white/5 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <header className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-lg font-heading font-medium text-white italic">{title}</h3>
                <p className="text-xs text-white/40">Select any asset from your entire Supabase Storage bucket globally, or upload a new one.</p>
              </div>
              <button 
                onClick={onClose}
                className="text-white/20 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-[11px] font-mono font-bold tracking-wider text-white/45 uppercase">
                  {photos.length} Assets Found Globally
                </p>
                
                <label className="cursor-pointer bg-[#3ecf8e] text-[#171717] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#24b47e] transition-all flex items-center gap-2">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {isUploading ? 'Uploading...' : 'Upload Asset'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
                </label>
              </div>

              {/* Grid */}
              {loading && photos.length === 0 ? (
                <div className="h-[40vh] flex items-center justify-center text-white/40">
                  <Loader2 size={24} className="animate-spin text-[#3ecf8e] mr-2" />
                  Loading assets globally...
                </div>
              ) : photos.length === 0 ? (
                <div className="h-[40vh] flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl text-white/30">
                  <ImageIcon size={32} className="mb-3 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-wider opacity-40">Library is empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {photos.map((photo) => {
                    const isSelected = selectedUrl === photo.image_url;
                    return (
                      <div
                        key={photo.id}
                        onClick={() => setSelectedUrl(photo.image_url)}
                        className={`group relative aspect-square bg-[#1c1c1c] border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                          isSelected 
                            ? 'border-[#3ecf8e] ring-2 ring-[#3ecf8e]/20 scale-[0.98]' 
                            : 'border-white/5 hover:border-white/20'
                        }`}
                      >
                         {photo.image_url.toLowerCase().endsWith('.pdf') ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-[#202020] text-red-500 gap-2 border border-red-500/10">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10 opacity-70">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-red-400">PDF Document</span>
                          </div>
                        ) : (
                          <img 
                            src={photo.image_url} 
                            alt="Gallery Asset" 
                            className="w-full h-full object-cover"
                          />
                        )}
                        {/* Selector Indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#3ecf8e] text-[#171717] flex items-center justify-center shadow-md animate-in zoom-in duration-200">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={(e) => handleDelete(e, photo.image_url)}
                              className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-md"
                              title="Hapus file"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <span className="text-[8px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded truncate w-full">
                            {photo.image_url.split('/').pop()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="px-8 py-5 border-t border-white/5 bg-[#141414] flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelect}
                disabled={!selectedUrl}
                className="px-6 py-2.5 rounded-xl bg-[#3ecf8e] text-[#171717] text-xs font-bold uppercase tracking-widest hover:bg-[#24b47e] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#3ecf8e]/10"
              >
                Select Asset
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
