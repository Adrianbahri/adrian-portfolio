'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { compressToWebP } from '@/lib/image';
import { 
  Save, 
  Loader2, 
  Upload, 
  Image as ImageIcon, 
  Globe, 
  ExternalLink,
  Tv,
  Palette,
  Camera,
  AlertCircle,
  Database,
  Copy,
  Check
} from 'lucide-react';
import { cn, purgeSystemCache } from '@/lib/utils';
import MediaLibraryModal from '@/components/Admin/MediaLibraryModal';

interface CreativeCategory {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  link_url: string;
  order_index: number;
}

export default function AdminCreativeSpotlight() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [dbError, setDbError] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [rawError, setRawError] = useState<string | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // 3 Creative Items state matching the default creativeCategories
  const [items, setItems] = useState<CreativeCategory[]>([
    {
      id: 'motion',
      title: 'Cinematic & Motion',
      category: 'Motion',
      description: 'Crafting narratives through visual rhythm and cinematic motion graphics.',
      image_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
      link_url: '/projects?mode=creative',
      order_index: 0
    },
    {
      id: 'design',
      title: 'Visual Explorations',
      category: 'Design',
      description: 'Exploring aesthetics through themed visual compositions and high-fidelity experiments.',
      image_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80',
      link_url: '/projects?mode=creative',
      order_index: 1
    },
    {
      id: 'photo',
      title: 'Perspectives',
      category: 'Photography',
      description: 'A visual journal of light and perspectives captured through the lens.',
      image_url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80',
      link_url: '/projects?mode=creative',
      order_index: 2
    }
  ]);

  const sqlScript = `
-- RUN THIS IN SUPABASE SQL EDITOR TO CREATE THE CREATIVE SPOTLIGHT TABLE
CREATE TABLE IF NOT EXISTS creative_categories (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT DEFAULT '/projects?mode=creative',
  order_index INT DEFAULT 0
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE creative_categories ENABLE ROW LEVEL SECURITY;

-- POLICIES
DROP POLICY IF EXISTS "Allow public select" ON creative_categories;
CREATE POLICY "Allow public select" ON creative_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow auth all" ON creative_categories;
CREATE POLICY "Allow auth all" ON creative_categories FOR ALL TO authenticated USING (true);
`.trim();

  useEffect(() => {
    fetchCreativeData();
  }, []);

  const fetchCreativeData = async () => {
    setLoading(true);
    setDbError(false);
    try {
      const { data, error } = await supabase
        .from('creative_categories')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;

      if (data && data.length > 0) {
        // Map elements to state
        const sortedData = [...data].sort((a, b) => a.order_index - b.order_index);
        
        // Guarantee we have our 3 specific categories, filling default if some are missing
        const finalItems = items.map(defaultItem => {
          const dbItem = sortedData.find(d => d.id === defaultItem.id);
          return dbItem ? {
            id: dbItem.id,
            title: dbItem.title,
            category: dbItem.category,
            description: dbItem.description,
            image_url: dbItem.image_url,
            link_url: dbItem.link_url || '/projects?mode=creative',
            order_index: dbItem.order_index
          } : defaultItem;
        });

        setItems(finalItems);
      }
    } catch (err: any) {
      const errMsg = err?.message || err?.details || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      console.error('Database fetch error details:', errMsg);
      setDbError(true);
      setRawError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (id: string, field: keyof CreativeCategory, value: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(id);
    setMessage(null);
    try {
      const compressedFile = await compressToWebP(file);
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `creative-${id}-${Math.random()}.${fileExt}`;
      const filePath = `creative/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      // Generate clean proxy URL instead of raw Supabase URL
      const cleanProxyUrl = `/api/assets/${filePath}`;
      handleFieldChange(id, 'image_url', cleanProxyUrl);
      setMessage({ type: 'success', text: `Image uploaded successfully for ${id} card!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Upload failed: ' + err.message });
    } finally {
      setUploadingId(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Upsert all 3 items to Supabase
      const { error } = await supabase
        .from('creative_categories')
        .upsert(items, { onConflict: 'id' });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Creative spotlight cards updated successfully!' });
      
      // Auto-hide success message after 4s
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to save changes: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Helper icons for the previews
  const getIcon = (id: string) => {
    switch (id) {
      case 'motion': return Tv;
      case 'design': return Palette;
      case 'photo': return Camera;
      default: return ImageIcon;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-3 text-[#ededed]/10">
      <Loader2 size={28} className="animate-spin text-[#3ecf8e]" />
      <p className="text-[10px] uppercase tracking-widest font-mono font-bold text-[#707070]">Loading Spotlight Data...</p>
    </div>
  );

  return (
    <div className="max-w-5xl space-y-10 pb-24 text-[#ededed]">
      {/* HEADER BAR */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-b border-[#2e2e2e]">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[#ededed] font-sans">
            Creative Spotlight <span className="text-[#707070] font-light">/ Homed Desain</span>
          </h1>
          <p className="text-[13px] text-[#707070] max-w-2xl leading-relaxed">
            Manage the 3 high-impact cards shown in the Creative segment of Selected Works on your Homepage.
          </p>
        </div>
        {!dbError && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-[#3ecf8e] text-[#171717] px-6 py-2.5 rounded-md text-[13px] font-semibold hover:bg-[#24b47e] transition-all disabled:opacity-50 shadow-lg shadow-[#3ecf8e]/10 cursor-pointer"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Showcase Changes
          </button>
        )}
      </header>

      {/* FEEDBACK BANNER */}
      {message && (
        <div className={cn(
          "p-4 rounded-md text-[13px] font-medium border flex items-start gap-3 animate-in fade-in duration-300",
          message.type === 'success' 
            ? "bg-[#3ecf8e]/5 text-[#3ecf8e] border-[#3ecf8e]/20" 
            : "bg-red-500/5 text-red-500 border-red-500/20"
        )}>
          <div className="mt-0.5 font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-current/10 shrink-0">
            {message.type}
          </div>
          <span className="flex-1">{message.text}</span>
        </div>
      )}

      {/* DATABASE ERROR FALLBACK SCREEN */}
      {dbError ? (
        <div className="p-8 bg-[#1c1c1c] border border-red-500/10 rounded-lg space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/10 rounded-md text-red-500 shrink-0">
              <Database size={24} />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-[15px] font-semibold text-white">Database Query Interrupted</h3>
              <p className="text-[13px] text-[#707070] leading-relaxed max-w-2xl">
                The application encountered an error while querying the <code className="text-[#3ecf8e] font-mono px-1.5 py-0.5 bg-[#252525] rounded text-[12px]">creative_categories</code> table.
              </p>
              {rawError && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-mono rounded max-w-2xl break-all">
                  Error Details: {rawError}
                </div>
              )}
              <p className="text-[12px] text-[#707070] leading-relaxed max-w-2xl pt-2">
                If the table does not exist in your Supabase database yet, please copy the SQL script below, run it in your Supabase SQL Editor, then click <strong>Go to Sync Page</strong>.
              </p>
            </div>
          </div>

          <div className="bg-[#171717] border border-[#2e2e2e] rounded-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#2e2e2e] bg-[#1c1c1c]">
              <span className="text-[10px] font-mono font-bold text-[#707070] uppercase">SQL Migration Schema</span>
              <button 
                onClick={handleCopySql}
                className="flex items-center gap-1.5 text-[11px] font-medium text-[#707070] hover:text-[#3ecf8e] transition-colors cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <Check size={12} className="text-[#3ecf8e]" />
                    <span className="text-[#3ecf8e]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-[12px] font-mono text-[#9a9a9a] overflow-x-auto select-all max-h-[300px] custom-scrollbar bg-black/30">
              {sqlScript}
            </pre>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <a 
              href="/admin/sync"
              className="bg-[#3ecf8e] text-[#171717] px-6 py-2.5 rounded-md text-[13px] font-semibold hover:bg-[#24b47e] transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#3ecf8e]/10"
            >
              Go to Sync Page
              <ExternalLink size={14} />
            </a>
            <button 
              onClick={fetchCreativeData}
              className="px-6 py-2.5 border border-[#2e2e2e] text-[#ededed] hover:bg-white/5 rounded-md text-[13px] font-semibold transition-all cursor-pointer"
            >
              Refresh Status
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE EDITORS */
        <div className="space-y-16">
          {items.map((item, index) => {
            const PreviewIcon = getIcon(item.id);
            return (
              <section 
                key={item.id} 
                className="p-6 sm:p-8 bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg transition-all hover:border-[#3e3e3e] relative group shadow-md"
              >
                {/* CARD ORDER BADGE */}
                <div className="absolute -top-3.5 left-6 bg-[#252525] border border-[#2e2e2e] text-[#707070] font-mono font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider group-hover:border-[#3ecf8e]/40 group-hover:text-[#3ecf8e] transition-colors leading-none">
                  Spotlight Card #{index + 1} &middot; {item.id.toUpperCase()}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start pt-4">
                  {/* FORM FIELDS */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* CATEGORY (BOX TAG) */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070] flex items-center gap-2">
                          Badge / Tag Label
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. Motion, Design, Photography"
                          value={item.category}
                          onChange={(e) => handleFieldChange(item.id, 'category', e.target.value)}
                          className="w-full bg-[#171717] border border-[#2e2e2e] rounded-md px-3 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
                        />
                        <p className="text-[10px] text-[#555555]">This displays inside the badge on the homepage card.</p>
                      </div>

                      {/* TITLE */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">
                          Card Title
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. Cinematic & Motion"
                          value={item.title}
                          onChange={(e) => handleFieldChange(item.id, 'title', e.target.value)}
                          className="w-full bg-[#171717] border border-[#2e2e2e] rounded-md px-3 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
                        />
                        <p className="text-[10px] text-[#555555]">Main bold text header on the card.</p>
                      </div>
                    </div>

                    {/* SHORT DESCRIPTION */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">
                        Short Description
                      </label>
                      <textarea 
                        placeholder="Provide a brief, compelling introduction..."
                        value={item.description}
                        onChange={(e) => handleFieldChange(item.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full bg-[#171717] border border-[#2e2e2e] rounded-md px-3 py-2.5 text-[13px] text-[#ededed] leading-relaxed resize-none focus:outline-none focus:border-[#3ecf8e] transition-all"
                      />
                      <p className="text-[10px] text-[#555555]">Keep it under 15 words to ensure it fits beautifully in the grid card.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#252525]">
                      {/* LINK URL */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070] flex items-center gap-1.5">
                          <Globe size={11} /> Redirection Link (URL)
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. /projects?mode=creative"
                          value={item.link_url}
                          onChange={(e) => handleFieldChange(item.id, 'link_url', e.target.value)}
                          className="w-full bg-[#171717] border border-[#2e2e2e] rounded-md px-3 py-2 text-[12px] text-[#ededed] font-mono focus:outline-none focus:border-[#3ecf8e] transition-all"
                        />
                        <p className="text-[10px] text-[#555555]">Redirect target when clicking this card.</p>
                      </div>

                      {/* IMAGE URL DIRECT INPUT */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070] flex items-center gap-1.5">
                          <ImageIcon size={11} /> Cover Image URL
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. https://images.unsplash.com/..."
                          value={item.image_url}
                          onChange={(e) => handleFieldChange(item.id, 'image_url', e.target.value)}
                          className="w-full bg-[#171717] border border-[#2e2e2e] rounded-md px-3 py-2 text-[12px] text-[#ededed] font-mono focus:outline-none focus:border-[#3ecf8e] transition-all"
                        />
                        <p className="text-[10px] text-[#555555]">Direct image hyperlink (overwritten on file upload).</p>
                      </div>
                    </div>
                  </div>

                  {/* PREVIEW & MEDIA UPLOAD */}
                  <div className="space-y-3 shrink-0">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070] flex items-center justify-between">
                      <span>Interactive Live Preview</span>
                      <span className="text-[#3ecf8e] text-[9px] lowercase font-mono">Updates in real time</span>
                    </label>

                    {/* DYNAMIC CARD PREVIEW MODELING HOMEPAGE BENTO CARD */}
                    <div className="w-full aspect-[16/11] rounded-[5px] bg-[#171717]/50 border border-[#2e2e2e] relative overflow-hidden group/preview select-none flex flex-col p-5 justify-between">
                      
                      {/* Top bar info */}
                      <div className="flex justify-between items-start z-10">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[8px] uppercase tracking-widest text-[#3ecf8e] font-extrabold bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 px-1.5 py-0.5 rounded-[2px] leading-none select-none">
                              {item.category || 'CATEGORY'}
                            </span>
                            <PreviewIcon size={10} className="text-[#3ecf8e]/60" />
                          </div>
                          <h4 className="text-[14px] font-semibold text-white tracking-tight leading-tight truncate">
                            {item.title || 'Untitled Spotlight'}
                          </h4>
                          <p className="text-[11px] text-[#9a9a9a] leading-normal font-sans font-light mt-1 line-clamp-2 pr-6">
                            {item.description || 'No description provided.'}
                          </p>
                        </div>
                      </div>

                      {/* Image Box */}
                      <div className="mt-3 relative flex-1 bg-black/40 border border-[#252525] rounded-[3px] overflow-hidden group-hover/preview:border-[#3ecf8e]/20 transition-all shadow-md">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.title} 
                            className="w-full h-full object-cover grayscale group-hover/preview:grayscale-0 transition-all duration-700 pointer-events-none" 
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[#444] gap-1 text-[11px] font-sans">
                            <ImageIcon size={20} />
                            No cover image
                          </div>
                        )}
                        <div className="absolute inset-0 bg-[#171717]/30 group-hover/preview:bg-transparent transition-colors duration-500" />
                      </div>

                      {/* HOVER OVERLAY WITH TWO OPTIONS */}
                      <div 
                        className={cn(
                          "absolute inset-0 bg-black/85 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity duration-300 z-20",
                          uploadingId === item.id && "opacity-100 pointer-events-none"
                        )}
                      >
                        {uploadingId === item.id ? (
                          <>
                            <Loader2 size={24} className="animate-spin text-[#3ecf8e]" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#3ecf8e]">Uploading Assets...</span>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col items-center gap-1.5 mb-1 text-center">
                              <span className="text-[10px] uppercase font-bold tracking-widest text-white">Manage Spotlight Image</span>
                              <span className="text-[8px] text-[#707070] font-sans px-4">Choose from library or upload new file</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="bg-[#2e2e2e] text-[#ededed] px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-[#3e3e3e] transition-all border border-[#3e3e3e] cursor-pointer">
                                Upload
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={(e) => handleImageUpload(item.id, e)} 
                                  className="hidden" 
                                />
                              </label>
                              <button 
                                type="button"
                                onClick={() => {
                                  setActiveItemId(item.id);
                                  setIsMediaModalOpen(true);
                                }}
                                className="bg-[#3ecf8e] text-[#171717] px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-[#24b47e] transition-all shadow-md shadow-[#3ecf8e]/10"
                              >
                                Library
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] px-1 text-[#707070]">
                      <span>Grid width: <strong className="font-mono text-[#9a9a9a]">span-4</strong></span>
                      <a href={item.link_url} target="_blank" className="hover:underline flex items-center gap-1 hover:text-[#3ecf8e] transition-colors leading-none">
                        redirection test
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
          
          {/* SAVE BUTTON BOTTOM ROW */}
          <div className="flex items-center justify-between p-6 bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg">
            <div className="space-y-1">
              <h4 className="text-[13px] font-semibold text-white">Apply changes to homepage</h4>
              <p className="text-[11px] text-[#707070]">Saving will sync these card details with the client-facing portfolio home page instantly.</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-[#3ecf8e] text-[#171717] px-8 py-3 rounded-md text-[13px] font-semibold hover:bg-[#24b47e] transition-all disabled:opacity-50 shadow-lg shadow-[#3ecf8e]/10 cursor-pointer shrink-0"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save Spotlight Changes
            </button>
          </div>
        </div>
      )}
      
      <MediaLibraryModal 
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setActiveItemId(null);
        }}
        onSelect={(url) => {
          if (activeItemId) {
            handleFieldChange(activeItemId, 'image_url', url);
            setMessage({ type: 'success', text: `Spotlight cover image updated from library!` });
          }
        }}
        title="Select Spotlight Cover Image"
      />
    </div>
  );
}
