'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { compressToWebP } from '@/lib/image';
import {
  Save,
  Loader2,
  Info,
  Camera,
  Mail,
  Globe,
  FileText,
  Activity,
  Scissors,
  Highlighter,
  Strikethrough,
  Eraser,
  Film,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { cn, purgeSystemCache } from '@/lib/utils';
import { invalidateSiteSettingsCache } from '@/hooks/useSiteSettings';
import MediaLibraryModal from '@/components/Admin/MediaLibraryModal';

const DEFAULT_BIO_BEFORE = `Hey there, I'm Adrian (Dri4n)
a creative technologist & full-stack developer based in [strike:labs, late-night commits,] Makassar

By day I build digital systems & data workflows at [blue:PK Identitas Unhas], and modernize web platforms as an intern at [orange:UKK Sains Unhas].

I love crafting fast, expressive [pink:full-stack web apps] with Next.js, TypeScript, and Bun + SQLite.`;

const DEFAULT_BIO_AFTER = `I'm an Informatics Engineering student at [green:Hasanuddin University] passionate about [yellow:creative technology, digital experiences], and building intelligent systems through code.`;

type MarkToken = 'blue' | 'orange' | 'pink' | 'green' | 'yellow' | 'strike';
type BioSectionKey = 'before' | 'after';

const HIGHLIGHT_SWATCHES: {
  id: Exclude<MarkToken, 'strike'>;
  label: string;
  bg: string;
  text: string;
  dot: string;
}[] = [
  {
    id: 'blue',
    label: 'Blue',
    bg: 'rgba(56, 189, 248, 0.22)',
    text: '#7dd3fc',
    dot: '#38bdf8',
  },
  {
    id: 'orange',
    label: 'Orange',
    bg: 'rgba(251, 146, 60, 0.24)',
    text: '#fdba74',
    dot: '#fb923c',
  },
  {
    id: 'pink',
    label: 'Pink',
    bg: 'rgba(244, 114, 182, 0.22)',
    text: '#f9a8d4',
    dot: '#f472b6',
  },
  {
    id: 'green',
    label: 'Green',
    bg: 'rgba(52, 211, 153, 0.22)',
    text: '#6ee7b7',
    dot: '#34d399',
  },
  {
    id: 'yellow',
    label: 'Yellow',
    bg: 'rgba(250, 204, 21, 0.22)',
    text: '#fde047',
    dot: '#facc15',
  },
];

const SWATCH_MAP = Object.fromEntries(
  HIGHLIGHT_SWATCHES.map((s) => [s.id, s])
) as Record<
  Exclude<MarkToken, 'strike'>,
  (typeof HIGHLIGHT_SWATCHES)[number]
>;

function renderPreviewRichLine(raw: string) {
  const parts = raw.split(
    /(\[(?:blue|orange|pink|green|yellow|strike):[^\]]+\])/g
  );
  return parts.map((part, idx) => {
    const m = part.match(
      /^\[(blue|orange|pink|green|yellow|strike):([^\]]+)\]$/
    );
    if (!m) return <span key={idx}>{part}</span>;
    if (m[1] === 'strike') {
      return (
        <span key={idx} className="line-through opacity-55">
          {m[2]}
        </span>
      );
    }
    const sw = SWATCH_MAP[m[1] as Exclude<MarkToken, 'strike'>];
    return (
      <span
        key={idx}
        className="rounded-[4px] px-1.5 py-0.5 font-normal"
        style={{ backgroundColor: sw.bg, color: sw.text }}
      >
        {m[2]}
      </span>
    );
  });
}

function renderPreviewBlocks(text: string, highlightFirstLine = false) {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block, bIdx) => {
    const lines = block.split('\n');
    return (
      <div key={bIdx} className="space-y-0.5">
        {lines.map((line, lIdx) => (
          <p
            key={lIdx}
            className={
              highlightFirstLine && bIdx === 0 && lIdx === 0
                ? 'text-[#f1eee9]'
                : 'text-[#a3a3a3]'
            }
          >
            {renderPreviewRichLine(line)}
          </p>
        ))}
      </div>
    );
  });
}

export default function SettingOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState<
    'profileImage' | 'resume' | 'activityGif' | 'loadingGif' | null
  >(null);

  // Activity Bento GIF Collection (Auto-rotates every 5s)
  const [activityGifs, setActivityGifs] = useState<string[]>([]);
  const [gifUrlInput, setGifUrlInput] = useState('');
  const [uploadingGif, setUploadingGif] = useState(false);

  // Loading Screen GIF
  const [loadingGif, setLoadingGif] = useState('');
  const [loadingGifInput, setLoadingGifInput] = useState('');
  const [uploadingLoadingGif, setUploadingLoadingGif] = useState(false);

  // Profile & Status
  const [heroImage, setHeroImage] = useState('');
  const [status, setStatus] = useState('Open for Collaboration');

  // 2 Clean Bio Sections: Before Cut & After Cut
  const [bioBefore, setBioBefore] = useState(DEFAULT_BIO_BEFORE);
  const [bioAfter, setBioAfter] = useState(DEFAULT_BIO_AFTER);

  // Formatting toolbar state
  const [activeSection, setActiveSection] = useState<BioSectionKey>('before');
  const [selectionHint, setSelectionHint] = useState<string | null>(null);
  const beforeRef = useRef<HTMLTextAreaElement | null>(null);
  const afterRef = useRef<HTMLTextAreaElement | null>(null);

  // Social Links & Resume
  const [socials, setSocials] = useState({
    email: '',
    github: '',
    instagram: '',
    linkedin: '',
    resume: '',
  });

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      if (error) throw error;

      if (data) {
        const settingsMap = data.reduce(
          (acc: Record<string, string>, item: any) => {
            acc[item.key] = item.value;
            return acc;
          },
          {}
        );

        setHeroImage(settingsMap.hero_image || '');
        setStatus(settingsMap.site_status || 'Open for Collaboration');

        if (settingsMap.bio_before_cut !== undefined) {
          setBioBefore(settingsMap.bio_before_cut);
        } else if (settingsMap.hero_greeting || settingsMap.hero_bio_1) {
          const g = settingsMap.hero_greeting || "Hey there, I'm Adrian (Dri4n)";
          const sub =
            settingsMap.hero_subtitle ||
            'a creative technologist & full-stack developer based in';
          const strike = settingsMap.hero_strike
            ? `[strike:${settingsMap.hero_strike}] `
            : '';
          const city = settingsMap.hero_city || 'Makassar';
          const b1 = settingsMap.hero_bio_1 || '';
          const b2 = settingsMap.hero_bio_2 || '';
          setBioBefore(
            [`${g}\n${sub} ${strike}${city}`, b1, b2].filter(Boolean).join('\n\n')
          );
        }

        if (settingsMap.bio_after_cut !== undefined) {
          setBioAfter(settingsMap.bio_after_cut);
        } else if (settingsMap.about_text) {
          setBioAfter(settingsMap.about_text);
        }

        setSocials({
          email: settingsMap.email_address || '',
          github: settingsMap.github_url || '',
          instagram: settingsMap.instagram_url || '',
          linkedin: settingsMap.linkedin_url || '',
          resume: settingsMap.resume_url || '',
        });

        if (settingsMap.loading_gif) {
          setLoadingGif(settingsMap.loading_gif);
        }

        if (settingsMap.activity_gifs) {
          try {
            const parsed = JSON.parse(settingsMap.activity_gifs);
            if (Array.isArray(parsed)) {
              setActivityGifs(
                parsed.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
              );
            }
          } catch {
            // Ignore invalid JSON
          }
        }
      }
    } catch {
      // Keep defaults
    } finally {
      setLoading(false);
    }
  };

  const applyFormat = (token: MarkToken | 'clear') => {
    const isBefore = activeSection === 'before';
    const el = isBefore ? beforeRef.current : afterRef.current;
    const value = isBefore ? bioBefore : bioAfter;
    const setter = isBefore ? setBioBefore : setBioAfter;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (start === end) {
      setSelectionHint(
        'Blok/pilih dulu kata di kolom teks yang ingin diberi highlight atau strikethrough.'
      );
      window.setTimeout(() => setSelectionHint(null), 2400);
      return;
    }

    const selected = value.slice(start, end);
    const cleaned = selected.replace(
      /\[(?:blue|orange|pink|green|yellow|strike):([^\]]+)\]/g,
      '$1'
    );
    const replacement = token === 'clear' ? cleaned : `[${token}:${cleaned}]`;

    const nextValue = value.slice(0, start) + replacement + value.slice(end);
    setter(nextValue);
    setSelectionHint(null);

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start, start + replacement.length);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressedFile = await compressToWebP(file);
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `profile-${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      setHeroImage(`/api/assets/${filePath}`);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const persistActivityGifs = async (nextGifs: string[]) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          [{ key: 'activity_gifs', value: JSON.stringify(nextGifs) }],
          { onConflict: 'key' }
        );
      if (error) throw error;
      invalidateSiteSettingsCache();
      purgeSystemCache().catch(() => {});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan koleksi GIF';
      setMessage({ type: 'error', text: msg });
    }
  };

  const handleGifUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingGif(true);
    setMessage(null);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const ext = (file.name.split('.').pop() || 'gif').toLowerCase();
        const isAnimated = ext === 'gif' || ext === 'webp';
        const uploadFile = isAnimated ? file : await compressToWebP(file);
        const finalExt = isAnimated
          ? ext
          : uploadFile.name.split('.').pop() || 'webp';
        const fileName = `activity-gif-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${finalExt}`;
        const filePath = `uploads/${fileName}`;

        const formData = new FormData();
        formData.append('file', uploadFile);

        const { error: uploadError } = await supabase.storage
          .from('portfolio-assets')
          .upload(filePath, formData);

        if (uploadError) throw uploadError;
        uploadedUrls.push(`/api/assets/${filePath}`);
      }

      const nextGifs = [...activityGifs, ...uploadedUrls];
      setActivityGifs(nextGifs);
      await persistActivityGifs(nextGifs);
      setMessage({
        type: 'success',
        text: `${uploadedUrls.length} GIF ditambahkan & langsung tersimpan!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload GIF gagal';
      setMessage({ type: 'error', text: msg });
    } finally {
      setUploadingGif(false);
      e.target.value = '';
    }
  };

  const handleAddGifUrl = async () => {
    const trimmed = gifUrlInput.trim();
    if (!trimmed) return;
    const nextGifs = activityGifs.includes(trimmed)
      ? activityGifs
      : [...activityGifs, trimmed];
    setActivityGifs(nextGifs);
    setGifUrlInput('');
    await persistActivityGifs(nextGifs);
    setMessage({ type: 'success', text: 'GIF URL ditambahkan & langsung tersimpan!' });
  };

  const handleRemoveGif = async (index: number) => {
    const nextGifs = activityGifs.filter((_, idx) => idx !== index);
    setActivityGifs(nextGifs);
    await persistActivityGifs(nextGifs);
  };

  const persistLoadingGif = async (nextUrl: string) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'loading_gif', value: nextUrl }], { onConflict: 'key' });
      if (error) throw error;
      try {
        if (nextUrl) localStorage.setItem('dri4n_loading_gif', nextUrl);
        else localStorage.removeItem('dri4n_loading_gif');
      } catch {
        // ignore storage errors
      }
      invalidateSiteSettingsCache();
      purgeSystemCache().catch(() => {});
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Gagal menyimpan Loading GIF';
      setMessage({ type: 'error', text: msg });
    }
  };

  const handleLoadingGifUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLoadingGif(true);
    setMessage(null);
    try {
      const ext = (file.name.split('.').pop() || 'gif').toLowerCase();
      const isAnimated = ext === 'gif' || ext === 'webp';
      const uploadFile = isAnimated ? file : await compressToWebP(file);
      const finalExt = isAnimated
        ? ext
        : uploadFile.name.split('.').pop() || 'webp';
      const fileName = `loading-gif-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${finalExt}`;
      const filePath = `uploads/${fileName}`;

      const formData = new FormData();
      formData.append('file', uploadFile);

      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, formData);

      if (uploadError) throw uploadError;

      const url = `/api/assets/${filePath}`;
      setLoadingGif(url);
      await persistLoadingGif(url);
      setMessage({
        type: 'success',
        text: 'Loading Screen GIF tersimpan!',
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Upload Loading GIF gagal';
      setMessage({ type: 'error', text: msg });
    } finally {
      setUploadingLoadingGif(false);
      e.target.value = '';
    }
  };

  const handleSetLoadingGifUrl = async () => {
    const trimmed = loadingGifInput.trim();
    if (!trimmed) return;
    setLoadingGif(trimmed);
    setLoadingGifInput('');
    await persistLoadingGif(trimmed);
    setMessage({
      type: 'success',
      text: 'Loading Screen GIF URL tersimpan!',
    });
  };

  const handleClearLoadingGif = async () => {
    setLoadingGif('');
    await persistLoadingGif('');
    setMessage({
      type: 'success',
      text: 'Loading Screen dikembalikan ke animasi default.',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const upsertData = [
        { key: 'hero_image', value: heroImage },
        { key: 'site_status', value: status },
        { key: 'bio_before_cut', value: bioBefore },
        { key: 'bio_after_cut', value: bioAfter },
        { key: 'about_text', value: bioAfter },
        { key: 'email_address', value: socials.email },
        { key: 'github_url', value: socials.github },
        { key: 'instagram_url', value: socials.instagram },
        { key: 'linkedin_url', value: socials.linkedin },
        { key: 'resume_url', value: socials.resume },
        { key: 'activity_gifs', value: JSON.stringify(activityGifs) },
        { key: 'loading_gif', value: loadingGif },
      ];

      const { error } = await supabase
        .from('site_settings')
        .upsert(upsertData, { onConflict: 'key' });

      if (error) throw error;
      await purgeSystemCache();
      setMessage({
        type: 'success',
        text: 'Bio narrative, profile & links saved!',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#707070]">
        <Loader2 size={22} className="animate-spin text-[#ff5a3d]" />
        <p className="font-mono text-[10px] uppercase tracking-widest">
          Loading Bio CMS...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-10 pb-20 text-[#ededed]">
      <header className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-[#262626]">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-[#f1eee9]">
            Overview &amp; Bio CMS
          </h1>
          <p className="text-[13px] text-[#8a8a8a]">
            Atur profil, 2 section narasi (sebelum &amp; setelah digunting), highlight warna, dan strikethrough.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="inline-flex items-center gap-2 bg-[#ff5a3d] text-white px-5 py-2 rounded-[7px] text-[13px] font-medium hover:bg-[#e54d32] transition-all disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </header>

      {message && (
        <div
          className={cn(
            'p-3.5 rounded-[7px] text-[12px] font-mono border',
            message.type === 'success'
              ? 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/25'
              : 'bg-[#ff5a3d]/10 text-[#ff5a3d] border-[#ff5a3d]/25'
          )}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-8">
        {/* Left Column: Profile Photo & Social Links */}
        <aside className="space-y-8">
          <section className="space-y-3">
            <label className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#8a8a8a] flex items-center gap-2">
              <Camera size={12} /> Profile Photo
            </label>
            <div className="relative group aspect-[4/5] bg-[#171717] border border-[#262626] rounded-[8px] overflow-hidden">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#707070] italic text-xs">
                  No image
                </div>
              )}
              <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#a3a3a3]">
                  Profile Image
                </span>
                <div className="flex flex-col gap-2 w-32">
                  <label className="cursor-pointer bg-[#262626] hover:bg-[#333333] border border-[#3a3a3a] text-white text-center py-1.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all">
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                    Upload File
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLibraryTarget('profileImage');
                      setIsMediaModalOpen(true);
                    }}
                    className="bg-[#ff5a3d] text-white text-center py-1.5 rounded text-[10px] font-mono uppercase tracking-wider hover:bg-[#e54d32] transition-all cursor-pointer"
                  >
                    From Library
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3.5 pt-6 border-t border-[#262626]">
            <label className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#8a8a8a] flex items-center gap-2">
              <Globe size={12} /> Social Presence
            </label>
            <div className="space-y-2.5">
              {[
                { icon: Mail, key: 'email', placeholder: 'Email Address' },
                { icon: Globe, key: 'github', placeholder: 'GitHub URL' },
                { icon: Camera, key: 'instagram', placeholder: 'Instagram URL' },
                { icon: Globe, key: 'linkedin', placeholder: 'LinkedIn URL' },
              ].map((item: any) => (
                <div
                  key={item.key}
                  className="flex items-center gap-3 px-3 py-2.5 bg-[#171717] border border-[#262626] rounded-[7px] focus-within:border-[#ff5a3d]/60 transition-colors"
                >
                  <item.icon size={14} className="text-[#707070] shrink-0" />
                  <input
                    type="text"
                    placeholder={item.placeholder}
                    value={(socials as any)[item.key]}
                    onChange={(e) =>
                      setSocials({ ...socials, [item.key]: e.target.value })
                    }
                    className="bg-transparent border-none focus:outline-none text-[13px] w-full text-[#ededed] placeholder-[#525252]"
                  />
                </div>
              ))}
            </div>
          </section>
        </aside>

        {/* Right Column: Status, Resume & 2-Section Bio Editor */}
        <div className="space-y-7">
          {/* Status & Resume Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <section className="space-y-2">
              <label className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#8a8a8a] flex items-center gap-2">
                <Activity size={12} /> Status
              </label>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={cn(
                  'w-full border px-3.5 py-2.5 text-[13px] font-medium rounded-[7px] bg-[#171717] focus:outline-none transition-all',
                  status.toLowerCase().includes('busy') ||
                    status.toLowerCase().includes('full') ||
                    status.toLowerCase().includes('closed')
                    ? 'border-red-500/50 text-red-400'
                    : 'border-[#262626] text-[#34d399] focus:border-[#ff5a3d]'
                )}
              />
            </section>

            <section className="space-y-2">
              <label className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#8a8a8a] flex items-center gap-2">
                <FileText size={12} /> Resume / CV (PDF)
              </label>
              <div className="flex items-center gap-2 p-2 bg-[#171717] border border-[#262626] rounded-[7px] focus-within:border-[#ff5a3d]/60 transition-colors">
                <input
                  type="text"
                  placeholder="Resume PDF URL"
                  value={socials.resume}
                  onChange={(e) =>
                    setSocials({ ...socials, resume: e.target.value })
                  }
                  className="bg-transparent border-none focus:outline-none text-[12px] w-full text-[#ededed] font-mono px-1.5"
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  <label className="cursor-pointer bg-[#252525] border border-[#333333] px-2.5 py-1.5 rounded text-[10px] font-mono text-[#ededed] hover:bg-[#2f2f2f] transition-colors">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                          const fileName = `resume-${Date.now()}.pdf`;
                          const { error } = await supabase.storage
                            .from('portfolio-assets')
                            .upload(`documents/${fileName}`, file);
                          if (error) throw error;
                          setSocials({
                            ...socials,
                            resume: `/api/assets/documents/${fileName}`,
                          });
                        } catch (err: any) {
                          alert(err.message);
                        } finally {
                          setUploading(false);
                        }
                      }}
                    />
                    UPLOAD
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLibraryTarget('resume');
                      setIsMediaModalOpen(true);
                    }}
                    className="bg-[#ff5a3d] text-white px-2.5 py-1.5 rounded text-[10px] font-mono uppercase hover:bg-[#e54d32] transition-all cursor-pointer"
                  >
                    Library
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* 2-Section Interactive Bio Narrative Editor */}
          <section className="rounded-[10px] border border-[#262626] bg-[#171717] p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#242424] pb-3">
              <label className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#f1eee9] flex items-center gap-2">
                <Info size={13} className="text-[#ff5a3d]" /> Bio Narrative (2 Sections)
              </label>
              <span className="font-mono text-[10px] text-[#737373]">
                Blok kata lalu pilih Highlight Warna atau Strikethrough
              </span>
            </div>

            {/* Sticky Rich Format Toolbar (5 Highlight Colors + Strikethrough + Clear) */}
            <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1.5 rounded-[8px] border border-[#2a2a2a] bg-[#121212] p-2">
              <span className="inline-flex items-center gap-1.5 px-1.5 font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                <Highlighter size={12} className="text-[#ff5a3d]" />
                Format:
              </span>
              {HIGHLIGHT_SWATCHES.map((sw) => (
                <button
                  key={sw.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyFormat(sw.id)}
                  className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 font-mono text-[10.5px] font-medium transition-transform active:scale-95 hover:brightness-110"
                  style={{
                    backgroundColor: sw.bg,
                    color: sw.text,
                    border: `1px solid ${sw.dot}55`,
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: sw.dot }}
                  />
                  <span>{sw.label}</span>
                </button>
              ))}

              <span className="mx-0.5 h-4 w-px bg-[#2a2a2a]" />

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('strike')}
                className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#383838] bg-[#1e1e1e] px-2.5 py-1 font-mono text-[10.5px] font-medium text-[#d4d4d4] hover:bg-[#2a2a2a] hover:text-white transition-all active:scale-95"
                title="Coret teks yang diblok (Strikethrough)"
              >
                <Strikethrough size={12} />
                <span className="line-through">Strike</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFormat('clear')}
                className="ml-auto inline-flex items-center gap-1 rounded-[6px] border border-[#2e2e2e] bg-[#1c1c1c] px-2.5 py-1 font-mono text-[10px] text-[#a3a3a3] hover:text-white hover:bg-[#262626] transition-colors"
                title="Hapus highlight / strikethrough dari teks yang diblok"
              >
                <Eraser size={11} />
                <span>Hapus</span>
              </button>
            </div>

            {selectionHint && (
              <p className="font-mono text-[11px] text-[#fbbf24]">
                ⚠ {selectionHint}
              </p>
            )}

            {/* SECTION 1: SEBELUM DIGUNTING */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#34d399]" />
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#34d399]">
                    Section 1 — Sebelum Digunting
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#666666]">
                  Enter 2× untuk paragraf baru
                </span>
              </div>
              <textarea
                ref={beforeRef}
                onFocus={() => setActiveSection('before')}
                value={bioBefore}
                onChange={(e) => setBioBefore(e.target.value)}
                rows={7}
                className={cn(
                  'w-full bg-[#121212] border rounded-[8px] px-4 py-3 text-[13.5px] text-[#ededed] leading-relaxed focus:outline-none resize-y transition-colors',
                  activeSection === 'before'
                    ? 'border-[#ff5a3d]'
                    : 'border-[#262626]'
                )}
                placeholder="Tulis teks bio yang langsung terlihat di homepage..."
              />
            </div>

            {/* VISUAL SCISSORS CUT-LINE DIVIDER */}
            <div className="py-1">
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-dashed border-[#ff5a3d]/55" />
                <span className="inline-flex items-center gap-2 rounded-full border border-[#ff5a3d]/55 bg-[#ff5a3d]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#ff5a3d]">
                  <Scissors size={12} />
                  <span>Garis Gunting</span>
                </span>
                <div className="flex-1 border-t border-dashed border-[#ff5a3d]/55" />
              </div>
            </div>

            {/* SECTION 2: SETELAH DIGUNTING */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#ff5a3d]" />
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#ff5a3d]">
                    Section 2 — Setelah Digunting
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#666666]">
                  Baru terbuka setelah pengunjung menggunting garis
                </span>
              </div>
              <textarea
                ref={afterRef}
                onFocus={() => setActiveSection('after')}
                value={bioAfter}
                onChange={(e) => setBioAfter(e.target.value)}
                rows={5}
                className={cn(
                  'w-full bg-[#121212] border rounded-[8px] px-4 py-3 text-[13.5px] text-[#ededed] leading-relaxed focus:outline-none resize-y transition-colors',
                  activeSection === 'after'
                    ? 'border-[#ff5a3d]'
                    : 'border-[#262626]'
                )}
                placeholder="Tulis teks lanjutan yang baru muncul setelah garis gunting dipotong..."
              />
            </div>

            {/* LIVE RENDERED PREVIEW */}
            <div className="rounded-[8px] border border-[#262626] bg-[#121212] p-4 space-y-3 text-[13.5px] leading-[22px]">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#737373]">
                Live Preview (dri4n.com)
              </p>
              <div className="space-y-3">
                {renderPreviewBlocks(bioBefore, true)}
                <p className="text-[#a3a3a3]">
                  Currently: <span className="text-[#f1eee9]">{status}</span>.
                </p>

                <div className="flex items-center gap-2 py-1">
                  <div className="flex-1 border-t border-dashed border-[#3a3a3a]" />
                  <Scissors size={11} className="text-[#ff5a3d]" />
                  <div className="flex-1 border-t border-dashed border-[#3a3a3a]" />
                </div>

                {bioAfter && renderPreviewBlocks(bioAfter, false)}
              </div>
            </div>
          </section>

          {/* Activity Bento GIF Collection (Auto-Rotate every 5s) */}
          <section className="space-y-4 rounded-[10px] border border-[#262626] bg-[#141414] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#f1eee9] flex items-center gap-2">
                  <Film size={13} className="text-[#ff5a3d]" />
                  Activity Bento GIF Collection ({activityGifs.length})
                </h2>
                <p className="mt-1 text-[12px] text-[#8a8a8a]">
                  Upload sebanyak-banyaknya file GIF atau tempel URL GIF pihak ke-3. Tile Activity di beranda akan otomatis berganti setiap 5 detik.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-[6px] border border-[#3a3a3a] bg-[#222222] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-wider text-[#f1eee9] hover:border-[#ff5a3d] transition-colors">
                  {uploadingGif ? (
                    <Loader2 size={12} className="animate-spin text-[#ff5a3d]" />
                  ) : (
                    <Upload size={12} />
                  )}
                  <span>{uploadingGif ? 'Uploading...' : 'Upload GIF'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/gif,image/webp,image/*"
                    onChange={handleGifUpload}
                    disabled={uploadingGif}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setLibraryTarget('activityGif');
                    setIsMediaModalOpen(true);
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-[6px] border border-[#2e2e2e] bg-[#1a1a1a] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-wider text-[#a3a3a3] hover:text-white transition-colors"
                >
                  Library
                </button>
              </div>
            </div>

            {/* Paste 3rd-party GIF URL */}
            <div className="flex gap-2">
              <input
                type="url"
                value={gifUrlInput}
                onChange={(e) => setGifUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                    handleAddGifUrl();
                  }
                }}
                placeholder="https://media.giphy.com/media/.../giphy.gif"
                className="flex-1 rounded-[6px] border border-[#2e2e2e] bg-[#1c1c1c] px-3 py-2 text-[12.5px] text-[#ededed] placeholder:text-[#666] focus-visible:border-[#ff5a3d] focus-visible:outline-none"
              />
              <button
                type="button"
                onClick={handleAddGifUrl}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-[6px] border border-[#3a3a3a] bg-[#242424] px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-wider text-[#f1eee9] hover:border-[#ff5a3d] transition-colors"
              >
                <Plus size={12} />
                <span>Add URL</span>
              </button>
            </div>

            {/* Uploaded / Added GIF Grid */}
            {activityGifs.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {activityGifs.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="group relative aspect-square overflow-hidden rounded-[8px] border border-[#2a2a2a] bg-[#0e0e0e]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Activity GIF ${idx + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[9px] text-white/80">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGif(idx)}
                      aria-label={`Remove GIF ${idx + 1}`}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-black/75 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#ff5a3d] hover:text-white"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[8px] border border-dashed border-[#2e2e2e] py-8 text-center font-mono text-[11px] text-[#707070]">
                Belum ada GIF di koleksi. Upload file GIF atau tempel link GIF di atas.
              </div>
            )}
          </section>

          {/* Loading Screen GIF Slot */}
          <section className="space-y-4 rounded-[10px] border border-[#262626] bg-[#141414] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#f1eee9] flex items-center gap-2">
                  <Loader2 size={13} className="text-[#ff5a3d]" />
                  Loading Screen GIF
                </h2>
                <p className="mt-1 text-[12px] text-[#8a8a8a]">
                  GIF yang tampil di tengah halaman loading saat berpindah rute. Jika kosong, akan tampil mock animasi radar editorial default.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-[6px] border border-[#3a3a3a] bg-[#222222] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-wider text-[#f1eee9] hover:border-[#ff5a3d] transition-colors">
                  {uploadingLoadingGif ? (
                    <Loader2 size={12} className="animate-spin text-[#ff5a3d]" />
                  ) : (
                    <Upload size={12} />
                  )}
                  <span>{uploadingLoadingGif ? 'Uploading...' : 'Upload GIF'}</span>
                  <input
                    type="file"
                    accept="image/gif,image/webp,image/*"
                    onChange={handleLoadingGifUpload}
                    disabled={uploadingLoadingGif}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setLibraryTarget('loadingGif');
                    setIsMediaModalOpen(true);
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-[6px] border border-[#2e2e2e] bg-[#1a1a1a] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-wider text-[#a3a3a3] hover:text-white transition-colors"
                >
                  Library
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Live Mock Preview */}
              <div className="relative flex h-[112px] w-[112px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-[#2e2e2e] bg-[#0e0e0e]">
                {loadingGif ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={loadingGif}
                      alt="Loading Screen GIF preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleClearLoadingGif}
                      aria-label="Remove loading GIF"
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-black/75 text-white/85 hover:bg-[#ff5a3d] hover:text-white transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-[#707070]">
                    <span className="h-3 w-3 rounded-[3px] bg-[#ff5a3d] animate-pulse" />
                    <span className="font-mono text-[9px] uppercase tracking-widest">
                      GIF SLOT
                    </span>
                  </div>
                )}
              </div>

              <div className="flex w-full flex-1 flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={loadingGifInput}
                    onChange={(e) => setLoadingGifInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                        handleSetLoadingGifUrl();
                      }
                    }}
                    placeholder="https://media.giphy.com/media/.../giphy.gif"
                    className="flex-1 rounded-[6px] border border-[#2e2e2e] bg-[#1c1c1c] px-3 py-2 text-[12.5px] text-[#ededed] placeholder:text-[#666] focus-visible:border-[#ff5a3d] focus-visible:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSetLoadingGifUrl}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-[6px] border border-[#3a3a3a] bg-[#242424] px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-wider text-[#f1eee9] hover:border-[#ff5a3d] transition-colors"
                  >
                    <Plus size={12} />
                    <span>Set URL</span>
                  </button>
                </div>
                <p className="font-mono text-[10px] text-[#707070]">
                  Status:{' '}
                  <span className="text-[#a3a3a3]">
                    {loadingGif ? 'Custom GIF aktif' : 'Default mock radar aktif'}
                  </span>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setLibraryTarget(null);
        }}
        onSelect={(url) => {
          if (libraryTarget === 'profileImage') {
            setHeroImage(url);
          } else if (libraryTarget === 'resume') {
            setSocials((prev) => ({ ...prev, resume: url }));
          } else if (libraryTarget === 'activityGif') {
            const nextGifs = activityGifs.includes(url)
              ? activityGifs
              : [...activityGifs, url];
            setActivityGifs(nextGifs);
            persistActivityGifs(nextGifs);
          } else if (libraryTarget === 'loadingGif') {
            setLoadingGif(url);
            persistLoadingGif(url);
          }
          setIsMediaModalOpen(false);
          setLibraryTarget(null);
        }}
        title={
          libraryTarget === 'profileImage'
            ? 'Select Profile Photo'
            : libraryTarget === 'activityGif'
            ? 'Select Activity GIF'
            : libraryTarget === 'loadingGif'
            ? 'Select Loading Screen GIF'
            : 'Select Resume / CV'
        }
      />
    </div>
  );
}
