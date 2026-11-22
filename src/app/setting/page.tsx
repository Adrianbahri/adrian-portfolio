'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { cn, purgeSystemCache } from '@/lib/utils';
import MediaLibraryModal from '@/components/Admin/MediaLibraryModal';

const DEFAULT_HERO_GREETING = "Hey there, I'm Adrian Bahri (Dri4n)";
const DEFAULT_HERO_SUBTITLE =
  'a creative technologist & full-stack developer based in';
const DEFAULT_HERO_STRIKE = 'labs, late-night commits,';
const DEFAULT_HERO_CITY = 'Makassar';
const DEFAULT_HERO_BIO_1 =
  'By day I build digital systems & data workflows at [blue:PK Identitas Unhas], and modernize web platforms as an intern at [orange:UKK Sains Unhas].';
const DEFAULT_HERO_BIO_2 =
  'I love crafting fast, expressive [pink:full-stack web apps] with Next.js, TypeScript, and Bun + SQLite.';

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
    'profileImage' | 'resume' | null
  >(null);

  // Profile & Status
  const [heroImage, setHeroImage] = useState('');
  const [status, setStatus] = useState('Open for Collaboration');

  // Bio Narrative (All visible hero paragraphs + cut-line extended bio)
  const [heroGreeting, setHeroGreeting] = useState(DEFAULT_HERO_GREETING);
  const [heroSubtitle, setHeroSubtitle] = useState(DEFAULT_HERO_SUBTITLE);
  const [heroStrike, setHeroStrike] = useState(DEFAULT_HERO_STRIKE);
  const [heroCity, setHeroCity] = useState(DEFAULT_HERO_CITY);
  const [heroBio1, setHeroBio1] = useState(DEFAULT_HERO_BIO_1);
  const [heroBio2, setHeroBio2] = useState(DEFAULT_HERO_BIO_2);
  const [aboutText, setAboutText] = useState('');

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
        const settingsMap = data.reduce((acc: Record<string, string>, item: any) => {
          acc[item.key] = item.value;
          return acc;
        }, {});

        setHeroImage(settingsMap.hero_image || '');
        setStatus(settingsMap.site_status || 'Open for Collaboration');
        setHeroGreeting(settingsMap.hero_greeting || DEFAULT_HERO_GREETING);
        setHeroSubtitle(settingsMap.hero_subtitle || DEFAULT_HERO_SUBTITLE);
        setHeroStrike(
          settingsMap.hero_strike !== undefined
            ? settingsMap.hero_strike
            : DEFAULT_HERO_STRIKE
        );
        setHeroCity(settingsMap.hero_city || DEFAULT_HERO_CITY);
        setHeroBio1(settingsMap.hero_bio_1 || DEFAULT_HERO_BIO_1);
        setHeroBio2(settingsMap.hero_bio_2 || DEFAULT_HERO_BIO_2);
        setAboutText(settingsMap.about_text || '');

        setSocials({
          email: settingsMap.email_address || '',
          github: settingsMap.github_url || '',
          instagram: settingsMap.instagram_url || '',
          linkedin: settingsMap.linkedin_url || '',
          resume: settingsMap.resume_url || '',
        });
      }
    } catch {
      // Keep defaults
    } finally {
      setLoading(false);
    }
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

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const upsertData = [
        { key: 'hero_image', value: heroImage },
        { key: 'site_status', value: status },
        { key: 'hero_greeting', value: heroGreeting },
        { key: 'hero_subtitle', value: heroSubtitle },
        { key: 'hero_strike', value: heroStrike },
        { key: 'hero_city', value: heroCity },
        { key: 'hero_bio_1', value: heroBio1 },
        { key: 'hero_bio_2', value: heroBio2 },
        { key: 'about_text', value: aboutText },
        { key: 'email_address', value: socials.email },
        { key: 'github_url', value: socials.github },
        { key: 'instagram_url', value: socials.instagram },
        { key: 'linkedin_url', value: socials.linkedin },
        { key: 'resume_url', value: socials.resume },
      ];

      const { error } = await supabase
        .from('site_settings')
        .upsert(upsertData, { onConflict: 'key' });

      if (error) throw error;
      await purgeSystemCache();
      setMessage({
        type: 'success',
        text: 'Bio narrative, profile & links saved to dri4n.com!',
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
            Atur profil, narasi deskripsi utama di dri4n.com, CV, dan tautan sosial.
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

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
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

        {/* Right Column: Status, Resume & Full Bio Narrative */}
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

          {/* Complete Bio Narrative Editor */}
          <section className="rounded-[10px] border border-[#262626] bg-[#171717] p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#242424] pb-3">
              <label className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#f1eee9] flex items-center gap-2">
                <Info size={13} className="text-[#ff5a3d]" /> Bio Narrative (Hero &amp; Extended)
              </label>
              <span className="font-mono text-[10px] text-[#737373]">
                Highlight syntax: [blue:Text] [orange:Text] [pink:Text]
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#737373] mb-1.5">
                  Greeting / Headline
                </label>
                <input
                  type="text"
                  value={heroGreeting}
                  onChange={(e) => setHeroGreeting(e.target.value)}
                  className="w-full bg-[#121212] border border-[#262626] rounded-[7px] px-3.5 py-2 text-[13.5px] text-[#f1eee9] focus:outline-none focus:border-[#ff5a3d]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#737373] mb-1.5">
                    Subtitle / Role
                  </label>
                  <input
                    type="text"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full bg-[#121212] border border-[#262626] rounded-[7px] px-3.5 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#ff5a3d]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#737373] mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={heroCity}
                    onChange={(e) => setHeroCity(e.target.value)}
                    className="w-full bg-[#121212] border border-[#262626] rounded-[7px] px-3.5 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#ff5a3d]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#737373] mb-1.5">
                  Strikethrough Text (muncul tercoret saat gunting dibuka)
                </label>
                <input
                  type="text"
                  value={heroStrike}
                  onChange={(e) => setHeroStrike(e.target.value)}
                  placeholder="labs, late-night commits,"
                  className="w-full bg-[#121212] border border-[#262626] rounded-[7px] px-3.5 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#ff5a3d]"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#737373] mb-1.5">
                  Hero Paragraph 1 (By day...)
                </label>
                <textarea
                  value={heroBio1}
                  onChange={(e) => setHeroBio1(e.target.value)}
                  rows={2}
                  className="w-full bg-[#121212] border border-[#262626] rounded-[7px] px-3.5 py-2.5 text-[13.5px] text-[#ededed] leading-relaxed focus:outline-none focus:border-[#ff5a3d] resize-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#737373] mb-1.5">
                  Hero Paragraph 2 (I love crafting... — &quot;Currently: Status.&quot; otomatis ditambahkan)
                </label>
                <textarea
                  value={heroBio2}
                  onChange={(e) => setHeroBio2(e.target.value)}
                  rows={2}
                  className="w-full bg-[#121212] border border-[#262626] rounded-[7px] px-3.5 py-2.5 text-[13.5px] text-[#ededed] leading-relaxed focus:outline-none focus:border-[#ff5a3d] resize-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#737373] mb-1.5">
                  Extended Bio Narrative (terbuka di bawah garis gunting)
                </label>
                <textarea
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  rows={4}
                  className="w-full bg-[#121212] border border-[#262626] rounded-[7px] px-3.5 py-2.5 text-[13.5px] text-[#ededed] leading-relaxed focus:outline-none focus:border-[#ff5a3d] resize-none"
                  placeholder="Tell your story..."
                />
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
          }
          setIsMediaModalOpen(false);
          setLibraryTarget(null);
        }}
        title={
          libraryTarget === 'profileImage'
            ? 'Select Profile Photo'
            : 'Select Resume / CV'
        }
      />
    </div>
  );
}
