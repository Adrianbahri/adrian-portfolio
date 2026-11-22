'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { compressToWebP } from '@/lib/image';
import { 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  LayoutGrid, 
  Info, 
  Target, 
  Camera, 
  Mail, 
  Globe, 
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';
import { cn, purgeSystemCache } from '@/lib/utils';
import MediaLibraryModal from '@/components/Admin/MediaLibraryModal';

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Media Library Integration State
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState<'profileImage' | 'resume' | null>(null);

  // Form State
  const [heroImage, setHeroImage] = useState('');
  const [status, setStatus] = useState('Open for Collaboration');
  const [aboutText, setAboutText] = useState('');
  const [principles, setPrinciples] = useState<string[]>([]);
  const [focus, setFocus] = useState<{ title: string; desc: string }[]>([]);
  
  // Social Links
  const [socials, setSocials] = useState({
    email: '',
    github: '',
    instagram: '',
    linkedin: '',
    resume: ''
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
        const settingsMap = data.reduce((acc: any, item: any) => {
          acc[item.key] = item.value;
          return acc;
        }, {});

        setHeroImage(settingsMap.hero_image || '');
        setStatus(settingsMap.site_status || 'Open for Collaboration');
        setAboutText(settingsMap.about_text || '');
        setPrinciples(JSON.parse(settingsMap.about_principles || '[]'));
        setFocus(JSON.parse(settingsMap.about_focus || '[]'));
        
        setSocials({
          email: settingsMap.email_address || '',
          github: settingsMap.github_url || '',
          instagram: settingsMap.instagram_url || '',
          linkedin: settingsMap.linkedin_url || '',
          resume: settingsMap.resume_url || ''
        });
      }
    } catch (err) {
      // Silently handle missing table
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

      const cleanProxyUrl = `/api/assets/${filePath}`;
      setHeroImage(cleanProxyUrl);
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
        { key: 'about_text', value: aboutText },
        { key: 'about_principles', value: JSON.stringify(principles) },
        { key: 'about_focus', value: JSON.stringify(focus) },
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
      setMessage({ type: 'success', text: 'All content updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const addPrinciple = () => setPrinciples([...principles, '']);
  const updatePrinciple = (i: number, val: string) => {
    const newP = [...principles];
    newP[i] = val;
    setPrinciples(newP);
  };
  const removePrinciple = (i: number) => setPrinciples(principles.filter((_, idx) => idx !== i));

  const addFocus = () => setFocus([...focus, { title: '', desc: '' }]);
  const updateFocus = (i: number, field: 'title' | 'desc', val: string) => {
    const newF = [...focus];
    newF[i] = { ...newF[i], [field]: val };
    setFocus(newF);
  };
  const removeFocus = (i: number) => setFocus(focus.filter((_, idx) => idx !== i));

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#ededed]/10">
      <Loader2 size={24} className="animate-spin" />
      <p className="text-[10px] uppercase tracking-widest font-bold">Loading CMS...</p>
    </div>
  );

  return (
    <div className="max-w-5xl space-y-12 pb-20 text-[#ededed]">
      <header className="flex items-center justify-between py-4 border-b border-[#2e2e2e]">
        <div className="space-y-1">
          <h1 className="text-xl font-medium text-[#ededed]">Universal CMS</h1>
          <p className="text-[13px] text-[#707070]">Manage your personal branding and social data.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#3ecf8e] text-[#171717] px-6 py-2 rounded-md text-[13px] font-medium hover:bg-[#24b47e] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Changes
        </button>
      </header>

      {message && (
        <div className={cn(
          "p-4 rounded-md text-[12px] font-medium",
          message.type === 'success' ? "bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
        )}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10">
        {/* Left Column: Media & Links */}
        <aside className="space-y-8">
          {/* Profile Photo */}
          <section className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070] flex items-center gap-2">
              <Camera size={12} /> Profile Photo
            </label>
            <div className="relative group aspect-[4/5] bg-[#1c1c1c] border border-[#2e2e2e] rounded-md overflow-hidden">
              {heroImage ? (
                <img src={heroImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#707070] italic text-xs">No image</div>
              )}
              <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#707070]">Profile Image</span>
                <div className="flex flex-col gap-2 w-32">
                  <label className="cursor-pointer bg-[#2e2e2e] hover:bg-[#3e3e3e] border border-[#3e3e3e] text-white text-center py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap">
                    <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                    Upload File
                  </label>
                  <button 
                    type="button"
                    onClick={() => {
                      setLibraryTarget('profileImage');
                      setIsMediaModalOpen(true);
                    }}
                    className="bg-[#3ecf8e] text-[#171717] text-center py-1.5 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-[#24b47e] transition-all cursor-pointer"
                  >
                    From Library
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="space-y-4 pt-6 border-t border-[#2e2e2e]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070] flex items-center gap-2">
              <Globe size={12} /> Social Presence
            </label>
            <div className="space-y-3">
              {[
                { icon: Mail, key: 'email', placeholder: 'Email' },
                { icon: Globe, key: 'github', placeholder: 'GitHub URL' },
                { icon: Camera, key: 'instagram', placeholder: 'Instagram URL' },
                { icon: Globe, key: 'linkedin', placeholder: 'LinkedIn URL' },
              ].map((item: any) => (
                <div key={item.key} className="flex items-center gap-3 p-3 bg-[#1c1c1c] border border-[#2e2e2e] rounded-md focus-within:border-[#3ecf8e]/50 transition-colors">
                  <item.icon size={14} className="text-[#707070]" />
                  <input 
                    type="text" 
                    placeholder={item.placeholder} 
                    value={(socials as any)[item.key]} 
                    onChange={(e) => setSocials({...socials, [item.key]: e.target.value})} 
                    className="bg-transparent border-none focus:outline-none text-[13px] w-full text-[#ededed] placeholder-[#4a4a4a]" 
                  />
                </div>
              ))}
            </div>
          </section>
        </aside>

        {/* Right Column: Content */}
        <div className="space-y-8">
          {/* Status & Resume Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070] flex items-center gap-2">
                <Activity size={12} /> Status
              </label>
              <input 
                type="text" 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                className={cn(
                  "w-full border px-4 py-2.5 text-[13px] font-medium rounded-md bg-[#1c1c1c] focus:outline-none transition-all",
                  (status.toLowerCase().includes('busy') || status.toLowerCase().includes('full') || status.toLowerCase().includes('closed'))
                    ? "border-red-500/50 text-red-500"
                    : "border-[#2e2e2e] text-[#3ecf8e] focus:border-[#3ecf8e]"
                )}
              />
            </section>

            <section className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070] flex items-center gap-2">
                <FileText size={12} /> Resume / CV
              </label>
              <div className="flex items-center gap-3 p-2.5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-md focus-within:border-[#3ecf8e]/50 transition-colors">
                <input 
                  type="text" 
                  placeholder="Resume URL" 
                  value={socials.resume} 
                  onChange={(e) => setSocials({...socials, resume: e.target.value})} 
                  className="bg-transparent border-none focus:outline-none text-[12px] w-full text-[#ededed] font-mono" 
                />
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-[#252525] border border-white/5 px-2.5 py-1.5 rounded text-[10px] font-bold text-[#ededed] hover:bg-[#2e2e2e] transition-colors whitespace-nowrap">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                          const fileName = `resume-${Date.now()}.pdf`;
                          const compressedFile = await compressToWebP(file);
                          const { error } = await supabase.storage.from('portfolio-assets').upload(`documents/${fileName}`, compressedFile);
                          if (error) throw error;
                          const cleanProxyUrl = `/api/assets/documents/${fileName}`;
                          setSocials({...socials, resume: cleanProxyUrl});
                        } catch (err: any) { alert(err.message); }
                        finally { setUploading(false); }
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
                    className="bg-[#3ecf8e] text-[#171717] px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-[#24b47e] transition-all cursor-pointer whitespace-nowrap"
                  >
                    Library
                  </button>
                </div>
              </div>
            </section>
          </div>
          
          {/* Bio */}
          <section className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070] flex items-center gap-2">
              <Info size={12} /> Bio Narrative
            </label>
            <textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              rows={6}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-4 py-3 text-[14px] text-[#ededed] leading-relaxed focus:outline-none focus:border-[#3ecf8e] transition-all resize-none"
              placeholder="Tell your story..."
            />
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#2e2e2e] pt-8">
            {/* Principles */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070] flex items-center gap-2">
                  <Target size={12} /> Principles
                </label>
                <button onClick={addPrinciple} className="p-1 text-[#3ecf8e] hover:bg-[#3ecf8e]/10 rounded-md transition-all"><Plus size={16} /></button>
              </div>
              <div className="space-y-2.5">
                {principles.map((p: string, i: number) => (
                  <div key={i} className="flex gap-2 group">
                    <input type="text" value={p} onChange={(e) => updatePrinciple(i, e.target.value)} className="flex-1 bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e]" />
                    <button onClick={() => removePrinciple(i)} className="p-2 text-[#707070] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </section>

            {/* Focus */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070] flex items-center gap-2">
                  <LayoutGrid size={12} /> Creative Focus
                </label>
                <button onClick={addFocus} className="p-1 text-[#3ecf8e] hover:bg-[#3ecf8e]/10 rounded-md transition-all"><Plus size={16} /></button>
              </div>
              <div className="space-y-3">
                {focus.map((f: any, i: number) => (
                  <div key={i} className="p-4 bg-[#1c1c1c] border border-[#2e2e2e] rounded-md space-y-2 relative group">
                    <button onClick={() => removeFocus(i)} className="absolute top-2 right-2 p-1 text-[#707070] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                    <input type="text" value={f.title} onChange={(e) => updateFocus(i, 'title', e.target.value)} className="w-full bg-transparent border-b border-[#2e2e2e] pb-1 text-[13px] font-bold text-[#ededed] focus:border-[#3ecf8e] outline-none" placeholder="Title" />
                    <textarea value={f.desc} onChange={(e) => updateFocus(i, 'desc', e.target.value)} rows={2} className="w-full bg-transparent text-[12px] text-[#707070] leading-relaxed resize-none focus:outline-none" placeholder="Description" />
                  </div>
                ))}
              </div>
            </section>
          </div>
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
            setSocials(prev => ({ ...prev, resume: url }));
          }
          setIsMediaModalOpen(false);
          setLibraryTarget(null);
        }}
        title={libraryTarget === 'profileImage' ? "Select Profile Photo" : "Select Resume / CV"}
      />
    </div>
  );
}
