'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Youtube, Play, ExternalLink } from 'lucide-react';

const RemoteIcon = ({ url, className }: { url: string, className?: string }) => (
  <div 
    style={{ 
      maskImage: `url(${url})`, 
      WebkitMaskImage: `url(${url})`,
      maskSize: 'contain',
      WebkitMaskSize: 'contain',
      maskRepeat: 'no-repeat',
      WebkitMaskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskPosition: 'center'
    }}
    className={className || "w-4 h-4 bg-current"}
  />
);

export default function VideoShowcase() {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase.from('video_works').select('*').order('created_at', { ascending: false });
      if (data) setVideos(data);
    };
    fetchVideos();
  }, []);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (videos.length === 0) return null;

  return (
    <section className="section-container py-12">
      <div className="section-container mb-12">
        <p className="eyebrow mb-3">Motion</p>
        <h2 className="text-2xl lg:text-3xl font-medium text-on-dark tracking-tight font-heading mb-3">
          Cinematic & Motion Works
        </h2>
        <p className="text-sm text-body-muted max-w-xl font-sans">
          A selection of cinematic edits and motion graphics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {videos.map((video, idx) => {
          const ytId = getYoutubeId(video.video_url);
          
          return (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="relative aspect-video overflow-hidden bg-surface-100 border border-border-subtle group-hover:border-primary/50 transition-all duration-500 shadow-2xl">
                {ytId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${ytId}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] relative group/ig">
                    <img 
                      src={video.thumbnail_url || `https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=2000&auto=format&fit=crop`} 
                      alt="Thumbnail"
                      className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover/ig:grayscale-0 group-hover/ig:opacity-50 transition-all duration-700"
                    />
                    <a 
                      href={video.video_url} 
                      target="_blank" 
                      className="relative z-10 flex flex-col items-center gap-4 text-body-muted group-hover/ig:text-on-dark transition-colors"
                    >
                      <div className="flex items-center justify-center group-hover/ig:scale-110 group-hover/ig:text-primary transition-all">
                        {video.platform === 'instagram' ? (
                          <RemoteIcon url="https://cdn.simpleicons.org/instagram" className="w-10 h-10 bg-current group-hover/ig:text-primary transition-colors" />
                        ) : (
                          <Play size={40} strokeWidth={1.5} />
                        )}
                      </div>
                      <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em]">Open on {video.platform}</span>
                    </a>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-medium text-on-dark mb-2">{video.title}</h3>
                  <div className="flex items-center gap-2">
                    {video.platform === 'youtube' ? (
                      <RemoteIcon url="https://cdn.simpleicons.org/youtube" className="w-4 h-4 bg-current opacity-60" />
                    ) : (
                      <RemoteIcon url="https://cdn.simpleicons.org/instagram" className="w-4 h-4 bg-current opacity-60" />
                    )}
                    <span className="text-[0.6rem] font-bold uppercase tracking-widest text-body-muted">{video.platform} Work</span>
                  </div>
                </div>
                <a 
                  href={video.video_url} 
                  target="_blank"
                  className="p-3 border border-border-subtle hover:bg-surface-100 transition-colors text-body-muted hover:text-on-dark"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
