'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Video, Loader2, Youtube, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RemoteIcon = ({ url, className }: { url: string, className?: string }) => (
  <img 
    src={url} 
    alt="icon" 
    className={className || "w-5 h-5 brightness-0 invert"}
  />
);

export default function AdminVideos() {
  const [videos, setVideos] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', url: '' });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data } = await supabase.from('video_works').select('*').order('created_at', { ascending: false });
    if (data) setVideos(data);
  };

  const getPlatform = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('instagram.com')) return 'instagram';
    return 'other';
  };

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return;

    setIsSaving(true);
    try {
      let thumbnailUrl = '';

      // Upload thumbnail if exists
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `video-thumbnails/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('portfolio-assets')
          .upload(filePath, thumbnailFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-assets')
          .getPublicUrl(filePath);
        
        thumbnailUrl = publicUrl;
      }

      const platform = getPlatform(formData.url);
      const { error } = await supabase.from('video_works').insert([
        { 
          title: formData.title, 
          video_url: formData.url,
          platform: platform,
          thumbnail_url: thumbnailUrl
        }
      ]);

      if (error) throw error;
      
      setFormData({ title: '', url: '' });
      setThumbnailFile(null);
      fetchVideos();
      alert('Video link and thumbnail added!');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus link video ini?')) return;
    await supabase.from('video_works').delete().eq('id', id);
    fetchVideos();
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-medium text-[#ededed]">Video Showcase</h1>
        <p className="text-[13px] text-[#707070]">Paste your YouTube or Instagram links here.</p>
      </header>

      {/* Add Video Form */}
      <form onSubmit={handleAddVideo} className="p-6 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Video Title</label>
            <input 
              type="text" 
              placeholder="e.g. Cinematic Travel Reel 2024"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#252525] border border-[#2e2e2e] rounded-md px-3 py-2 text-sm text-[#ededed] focus:outline-none focus:ring-1 focus:ring-[#3ecf8e]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Video Link (YT / IG)</label>
            <input 
              type="text" 
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full bg-[#252525] border border-[#2e2e2e] rounded-md px-3 py-2 text-sm text-[#ededed] focus:outline-none focus:ring-1 focus:ring-[#3ecf8e]"
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Custom Thumbnail (Optional)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            className="w-full text-xs text-[#707070] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#2e2e2e] file:text-[#ededed] hover:file:bg-[#3e3e3e]"
          />
        </div>

        <button 
          disabled={isSaving}
          className="bg-[#3ecf8e] text-[#171717] px-4 py-2 rounded-md text-[13px] font-medium hover:bg-[#24b47e] transition-all flex items-center gap-2"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Add Video Link
        </button>
      </form>

      {/* Video List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {videos.map((video) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between p-4 bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#252525] flex items-center justify-center">
                  {video.platform === 'youtube' && <RemoteIcon url="https://cdn.simpleicons.org/youtube" />}
                  {video.platform === 'instagram' && <RemoteIcon url="https://cdn.simpleicons.org/instagram" />}
                  {video.platform === 'other' && <Globe size={20} className="text-[#707070]" />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-[#ededed] truncate">{video.title}</h3>
                  <p className="text-[11px] text-[#707070] truncate">{video.video_url}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(video.id)}
                className="p-2 text-[#707070] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
