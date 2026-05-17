'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { purgeSystemCache } from '@/lib/utils';
import { compressToWebP } from '@/lib/image';
import { Trash2, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import MediaLibraryModal from '@/components/Admin/MediaLibraryModal';

export default function AdminGallery() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (data) setPhotos(data);
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
        return supabase.from('gallery').insert([{ image_url: cleanProxyUrl }]);
      });

      await Promise.all(uploadPromises);
      await purgeSystemCache();
      fetchPhotos();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectFromLibrary = async (url: string) => {
    try {
      const { error } = await supabase.from('gallery').insert([{ image_url: url }]);
      if (error) throw error;
      await purgeSystemCache();
      fetchPhotos();
      setIsMediaModalOpen(false);
    } catch (err: any) {
      alert('Error adding from library: ' + err.message);
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Hapus foto ini dari galeri?')) return;

    try {
      const path = url.split('/').pop();
      if (path && url.includes('portfolio-assets')) {
        await supabase.storage.from('portfolio-assets').remove([`gallery/${path}`]);
      }
      await supabase.from('gallery').delete().eq('id', id);
      await purgeSystemCache();
      fetchPhotos();
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 pb-20 text-[#ededed]">
      <header className="flex items-center justify-between py-4 border-b border-[#2e2e2e]">
        <div className="space-y-1">
          <h1 className="text-xl font-medium text-[#ededed]">Photo Gallery</h1>
          <p className="text-[13px] text-[#707070]">Manage your visual exhibition.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="cursor-pointer bg-[#2e2e2e] text-[#ededed] px-4 py-2 rounded-md text-[13px] font-semibold hover:bg-[#3e3e3e] transition-all flex items-center gap-2 border border-white/5 whitespace-nowrap">
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {isUploading ? 'Uploading...' : 'Upload Photos'}
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} multiple />
          </label>
          <button
            type="button"
            onClick={() => setIsMediaModalOpen(true)}
            className="bg-[#3ecf8e] text-[#171717] px-4 py-2 rounded-md text-[13px] font-semibold hover:bg-[#24b47e] transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            Library
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {photos.map((photo: any) => (
          <div
            key={photo.id}
            className="group relative aspect-square bg-[#1c1c1c] border border-[#2e2e2e] rounded-md overflow-hidden"
          >
            <img 
              src={photo.image_url} 
              alt="Gallery" 
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                onClick={() => handleDelete(photo.id, photo.image_url)}
                className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        
        {photos.length === 0 && !isUploading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-[#2e2e2e] rounded-md text-[#707070]">
            <ImageIcon size={32} className="mb-4 opacity-20" />
            <p className="text-[13px] font-medium uppercase tracking-widest opacity-40">Gallery is empty</p>
          </div>
        )}
      </div>

      <MediaLibraryModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleSelectFromLibrary}
        title="Select Gallery Images"
      />
    </div>
  );
}
