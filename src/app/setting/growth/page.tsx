'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { purgeSystemCache } from '@/lib/utils';
import {
  DEFAULT_MEDIA_SHOWCASE,
  DEFAULT_ORG_BRANDING,
  isVideoMediaUrl,
  parseMediaShowcase,
  parseOrgBranding,
  type MediaPlatformKey,
  type MediaShowcaseConfig,
  type OrgBrandingConfig,
  type OrgBrandingKey,
} from '@/lib/mediaShowcase';
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  TrendingUp,
  Upload,
} from 'lucide-react';
import MediaLibraryModal from '@/components/Admin/MediaLibraryModal';
import { IdentitasAdminEditor } from '@/components/Admin/IdentitasAdminEditor';
import { PrintAdminEditor } from '@/components/Admin/PrintAdminEditor';

interface SocialGrowthItem {
  id: string;
  account: string;
  handle: string;
  platform: string;
  role: string;
  period: string;
  focus: string;
  highlights: string[];
}

const DEFAULT_SOCIAL_GROWTH: SocialGrowthItem[] = [
  {
    id: 'sg-identitas',
    account: 'PK Identitas Unhas',
    handle: '@identitasunhas',
    platform: 'INSTAGRAM · CAMPUS MEDIA',
    role: 'DATA, EDITORIAL & VISUAL SYSTEMS',
    period: '2025 — NOW',
    focus:
      'Data journalism carousels, editorial infographics (SNBP, Pilrek Unhas), print magazine layout, and automated publishing workflows for Universitas Hasanuddin’s official student press.',
    highlights: [
      'Data-driven infographic series & high-share campus coverage',
      'Consistent editorial visual language across print & social feeds',
      'Structured content pipeline & digital workflow modernization',
    ],
  },
  {
    id: 'sg-sulawesipos',
    account: 'SulawesiPos.com',
    handle: 'Jawa Pos Group Network',
    platform: 'INSTAGRAM · TIKTOK · DIGITAL',
    role: 'MEDIA PRODUCTION & CONTENT',
    period: 'JAN 2026 — NOW',
    focus:
      'Daily digital content production, fast-turnaround news visual packaging, and short-form video editing under PT Tiran Multimedia Nusantara (Jawa Pos Group).',
    highlights: [
      'High-frequency daily visual publishing & breaking-news templates',
      'Short-form vertical reels & documentary storytelling',
      'Cross-platform audience retention & visual consistency',
    ],
  },
  {
    id: 'sg-kedai',
    account: 'Kedai Ayah UQ',
    handle: 'F&B Brand Campaign',
    platform: 'INSTAGRAM · PROMOTIONAL',
    role: 'GRAPHIC DESIGNER & SOCIAL VISUALS',
    period: 'JUN — SEP 2025',
    focus:
      'Campaign direction, promotional social feeds, seasonal menu visuals, and cohesive café marketing collateral tailored for local Makassar audiences.',
    highlights: [
      'End-to-end promotional feed & story visual templates',
      'Product-focused campaign graphics & seasonal promos',
      'Unified brand palette & typography for F&B identity',
    ],
  },
];

export default function AdminSocialGrowthPage() {
  const [items, setItems] = useState<SocialGrowthItem[]>(DEFAULT_SOCIAL_GROWTH);
  const [showcase, setShowcase] = useState<MediaShowcaseConfig>(
    DEFAULT_MEDIA_SHOWCASE
  );
  const [orgBranding, setOrgBranding] = useState<OrgBrandingConfig>(
    DEFAULT_ORG_BRANDING
  );
  const [activeTab, setActiveTab] = useState<MediaPlatformKey>('tiktok');
  const [activeOrgTab, setActiveOrgTab] = useState<OrgBrandingKey>('arjuna');
  const [uploadingShots, setUploadingShots] = useState(false);
  const [uploadingOrgMedia, setUploadingOrgMedia] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState<
    'media-prod' | 'org-branding'
  >('media-prod');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', [
            'social_growth',
            'media_production_showcase',
            'org_branding_showcase',
          ]);

        const growthRow = data?.find((r) => r.key === 'social_growth');
        if (growthRow?.value) {
          const parsed = JSON.parse(growthRow.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
          }
        }

        const showcaseRow = data?.find(
          (r) => r.key === 'media_production_showcase'
        );
        if (showcaseRow?.value) {
          setShowcase(parseMediaShowcase(showcaseRow.value));
        }

        const orgRow = data?.find((r) => r.key === 'org_branding_showcase');
        if (orgRow?.value) {
          setOrgBranding(parseOrgBranding(orgRow.value));
        }
      } catch {
        // Keep defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updatePlatform = (
    key: MediaPlatformKey,
    patch: Partial<MediaShowcaseConfig['platforms'][MediaPlatformKey]>
  ) => {
    setShowcase((prev) => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [key]: {
          ...prev.platforms[key],
          ...patch,
        },
      },
    }));
  };

  const handleUploadPlatformMedia = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingShots(true);
    try {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const filePath = `growth/${activeTab}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file);
      if (uploadErr) throw uploadErr;
      updatePlatform(activeTab, {
        mediaUrl: `/api/assets/${filePath}`,
      });
    } catch (err: any) {
      alert('Gagal upload media: ' + err.message);
    } finally {
      setUploadingShots(false);
      e.target.value = '';
    }
  };

  const updateOrgAccount = (
    key: OrgBrandingKey,
    patch: Partial<OrgBrandingConfig['accounts'][OrgBrandingKey]>
  ) => {
    setOrgBranding((prev) => ({
      ...prev,
      accounts: {
        ...prev.accounts,
        [key]: {
          ...prev.accounts[key],
          ...patch,
        },
      },
    }));
  };

  const handleUploadOrgMedia = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingOrgMedia(true);
    try {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const filePath = `growth/org-${activeOrgTab}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file);
      if (uploadErr) throw uploadErr;
      updateOrgAccount(activeOrgTab, {
        mediaUrl: `/api/assets/${filePath}`,
      });
    } catch (err: any) {
      alert('Gagal upload media branding: ' + err.message);
    } finally {
      setUploadingOrgMedia(false);
      e.target.value = '';
    }
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `sg-${Date.now()}`,
        account: '',
        handle: '',
        platform: 'INSTAGRAM',
        role: 'SOCIAL MEDIA & CREATIVE',
        period: '2026',
        focus: '',
        highlights: [''],
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateField = (
    id: string,
    field: keyof Omit<SocialGrowthItem, 'id' | 'highlights'>,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const updateHighlights = (id: string, rawText: string) => {
    const lines = rawText.split('\n');
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, highlights: lines } : item
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const cleaned = items
        .filter((it) => it.account.trim() !== '')
        .map((it) => ({
          ...it,
          highlights: it.highlights.map((h) => h.trim()).filter(Boolean),
        }));

      const { error } = await supabase
        .from('site_settings')
        .upsert(
          [
            { key: 'social_growth', value: JSON.stringify(cleaned) },
            {
              key: 'media_production_showcase',
              value: JSON.stringify(showcase),
            },
            {
              key: 'org_branding_showcase',
              value: JSON.stringify(orgBranding),
            },
          ],
          { onConflict: 'key' }
        );

      if (error) throw error;
      await purgeSystemCache();
      setItems(cleaned);
      setStatusMsg({
        type: 'success',
        text: 'Social Media Growth saved & synced to dri4n.com/art#growth!',
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err?.message || 'Failed to save changes.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#737373] font-mono text-xs uppercase tracking-widest">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading Social Media Growth...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262626] pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#f59e0b]">
            <TrendingUp size={13} />
            <span>Creative Mode · dri4n.com/art#growth</span>
          </div>
          <h1 className="mt-1 text-xl font-semibold text-[#f1eee9]">
            Social Media Growth Manager
          </h1>
          <p className="text-xs text-[#8a8a8a] mt-0.5">
            Kelola daftar akun sosial media &amp; media editorial yang Anda pegang.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[7px] border border-[#2e2e2e] bg-[#1c1c1c] hover:bg-[#252525] text-xs font-medium text-[#ededed] transition-colors"
          >
            <Plus size={14} />
            <span>Add Account</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[7px] bg-[#f59e0b] hover:bg-[#d97706] text-[#121212] text-xs font-semibold transition-colors disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`px-4 py-2.5 rounded-[7px] border text-xs font-mono ${
            statusMsg.type === 'success'
              ? 'bg-[#34d399]/10 border-[#34d399]/30 text-[#34d399]'
              : 'bg-[#ff5a3d]/10 border-[#ff5a3d]/30 text-[#ff5a3d]'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Baris 2 Showcase Editor (/art#media-production — YouTube & TikTok) */}
      {(() => {
        const active = showcase.platforms[activeTab];
        return (
          <section className="rounded-[10px] border border-[#2a2a2a] bg-[#161616] p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262626] pb-3.5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f59e0b]">
                  Creative Mode · Baris 2 (/art#media-production)
                </p>
                <h2 className="mt-0.5 text-[15px] font-semibold text-[#f1eee9]">
                  Media Production Showcase (SulawesiPos.com)
                </h2>
              </div>

              <div className="inline-flex rounded border border-[#2e2e2e] bg-[#111111] p-0.5">
                {(['tiktok', 'youtube'] as MediaPlatformKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`cursor-pointer rounded px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                      activeTab === key
                        ? 'bg-[#f59e0b] text-[#111111] font-semibold'
                        : 'text-[#8a8a8a] hover:text-[#ededed]'
                    }`}
                  >
                    {showcase.platforms[key].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                  Judul Utama
                </label>
                <input
                  type="text"
                  value={active.title}
                  onChange={(e) =>
                    updatePlatform(activeTab, { title: e.target.value })
                  }
                  className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                  Sub Judul / Peran
                </label>
                <input
                  type="text"
                  value={active.subtitle}
                  onChange={(e) =>
                    updatePlatform(activeTab, { subtitle: e.target.value })
                  }
                  className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                  Handle / Jaringan
                </label>
                <input
                  type="text"
                  value={active.handle}
                  onChange={(e) =>
                    updatePlatform(activeTab, { handle: e.target.value })
                  }
                  className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                Deskripsi ({active.label})
              </label>
              <textarea
                rows={3}
                value={active.description}
                onChange={(e) =>
                  updatePlatform(activeTab, { description: e.target.value })
                }
                className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs leading-relaxed text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
              />
            </div>

            {/* Engagement Metrics (Flexible count, 3-column grid) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                  Data Metrik ({active.metrics.length} item — {active.label})
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updatePlatform(activeTab, {
                      metrics: [
                        ...active.metrics,
                        { label: 'New Metric', value: '0', note: '' },
                      ],
                    })
                  }
                  className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#2e2e2e] bg-[#1a1a1a] px-2 py-1 text-[10.5px] text-[#ededed] hover:bg-[#252525]"
                >
                  <Plus size={11} />
                  <span>Tambah Data</span>
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {active.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="space-y-1.5 rounded border border-[#262626] bg-[#121212] p-3"
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={m.value}
                        onChange={(e) => {
                          const next = [...active.metrics];
                          next[idx] = { ...next[idx], value: e.target.value };
                          updatePlatform(activeTab, { metrics: next });
                        }}
                        placeholder="134.8M"
                        className="min-w-0 flex-1 rounded border border-[#262626] bg-[#0e0e0e] px-2 py-1 text-sm font-semibold text-[#ededed]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updatePlatform(activeTab, {
                            metrics: active.metrics.filter((_, i) => i !== idx),
                          })
                        }
                        aria-label="Hapus metrik"
                        className="cursor-pointer rounded p-1 text-[#737373] hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={m.label}
                      onChange={(e) => {
                        const next = [...active.metrics];
                        next[idx] = { ...next[idx], label: e.target.value };
                        updatePlatform(activeTab, { metrics: next });
                      }}
                      placeholder="Label (e.g. Video Views)"
                      className="w-full rounded border border-[#262626] bg-[#0e0e0e] px-2 py-1 text-[11px] text-[#a3a3a3]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Single Image or Video + Custom Link Tujuan */}
            <div className="space-y-4 rounded border border-[#262626] bg-[#121212] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-[10.5px] uppercase tracking-wider text-[#ededed]">
                    Media Channel ({active.label}) — 1 Gambar atau Video + Link
                    Tujuan
                  </p>
                  <p className="text-[11px] text-[#737373]">
                    Upload 1 gambar atau video (.mp4 / .webm / .mov) yang tampil
                    di kotak kanan `/art`, lalu atur link tujuan saat diklik.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-[#262626] px-3 py-1.5 text-xs font-medium text-[#ededed] hover:bg-[#333333]">
                    {uploadingShots ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Upload size={13} />
                    )}
                    <span>
                      {uploadingShots
                        ? 'Uploading...'
                        : 'Upload Gambar / Video'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      disabled={uploadingShots}
                      onChange={handleUploadPlatformMedia}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setLibraryTarget('media-prod');
                      setIsLibraryOpen(true);
                    }}
                    className="cursor-pointer rounded border border-[#2e2e2e] bg-[#1a1a1a] px-3 py-1.5 text-xs font-medium text-[#ededed] hover:bg-[#252525]"
                  >
                    Pilih dari Library
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[150px_1fr]">
                <div className="aspect-[3/4] w-full overflow-hidden rounded border border-[#262626] bg-[#0e0e0e]">
                  {active.mediaUrl ? (
                    isVideoMediaUrl(active.mediaUrl) ? (
                      <video
                        src={active.mediaUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={active.mediaUrl}
                        alt={active.label}
                        className="h-full w-full object-cover"
                      />
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center font-mono text-[10px] text-[#666]">
                      No Media
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                      Link Tujuan Saat Kotak Diklik ({active.label})
                    </label>
                    <input
                      type="url"
                      value={active.channelUrl || ''}
                      onChange={(e) =>
                        updatePlatform(activeTab, {
                          channelUrl: e.target.value,
                        })
                      }
                      placeholder="https://www.tiktok.com/@sulawesipos.com"
                      className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                      URL Media (Gambar / Video)
                    </label>
                    <input
                      type="text"
                      value={active.mediaUrl || ''}
                      onChange={(e) =>
                        updatePlatform(activeTab, {
                          mediaUrl: e.target.value,
                        })
                      }
                      placeholder="/api/assets/growth/... atau https://..."
                      className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 font-mono text-[11px] text-[#a3a3a3] focus:border-[#f59e0b] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Baris 3 Showcase Editor (/art#brand-identity — Instagram Branding Organisasi) */}
      {(() => {
        const activeOrg = orgBranding.accounts[activeOrgTab];
        return (
          <section className="rounded-[10px] border border-[#2a2a2a] bg-[#161616] p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262626] pb-3.5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f59e0b]">
                  Creative Mode · Baris 3 (/art#brand-identity)
                </p>
                <h2 className="mt-0.5 text-[15px] font-semibold text-[#f1eee9]">
                  Organization Instagram Branding ({activeOrg.handle})
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded border border-[#2e2e2e] bg-[#111111] p-0.5">
                  {(['arjuna', 'kknt'] as OrgBrandingKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveOrgTab(key)}
                      className={`cursor-pointer rounded px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                        activeOrgTab === key
                          ? 'bg-[#f59e0b] text-[#111111] font-semibold'
                          : 'text-[#8a8a8a] hover:text-[#ededed]'
                      }`}
                    >
                      {orgBranding.accounts[key].tabLabel}
                    </button>
                  ))}
                </div>

                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-[#262626] px-3 py-1.5 text-xs font-medium text-[#ededed] hover:bg-[#333333]">
                  {uploadingOrgMedia ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Upload size={13} />
                  )}
                  <span>
                    {uploadingOrgMedia
                      ? 'Uploading...'
                      : 'Upload Gambar / Video'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    disabled={uploadingOrgMedia}
                    onChange={handleUploadOrgMedia}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setLibraryTarget('org-branding');
                    setIsLibraryOpen(true);
                  }}
                  className="cursor-pointer rounded border border-[#2e2e2e] bg-[#1a1a1a] px-3 py-1.5 text-xs font-medium text-[#ededed] hover:bg-[#252525]"
                >
                  Pilih dari Library
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
              <div className="aspect-[3/4] w-full overflow-hidden rounded border border-[#262626] bg-[#0e0e0e]">
                {activeOrg.mediaUrl ? (
                  isVideoMediaUrl(activeOrg.mediaUrl) ? (
                    <video
                      src={activeOrg.mediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={activeOrg.mediaUrl}
                      alt={activeOrg.handle}
                      className="h-full w-full object-cover"
                    />
                  )
                ) : (
                  <div className="flex h-full items-center justify-center font-mono text-[10px] text-[#666]">
                    No Media
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                      Handle / Nama Akun ({activeOrg.tabLabel})
                    </label>
                    <input
                      type="text"
                      value={activeOrg.handle}
                      onChange={(e) =>
                        updateOrgAccount(activeOrgTab, {
                          handle: e.target.value,
                        })
                      }
                      placeholder="arjuna.uh"
                      className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                      Link Instagram Saat Kotak Diklik
                    </label>
                    <input
                      type="url"
                      value={activeOrg.instagramUrl}
                      onChange={(e) =>
                        updateOrgAccount(activeOrgTab, {
                          instagramUrl: e.target.value,
                        })
                      }
                      placeholder="https://www.instagram.com/arjuna.uh"
                      className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                    Deskripsi Kiri Atas ({activeOrg.tabLabel})
                  </label>
                  <textarea
                    rows={3}
                    value={activeOrg.leftDescription}
                    onChange={(e) =>
                      updateOrgAccount(activeOrgTab, {
                        leftDescription: e.target.value,
                      })
                    }
                    className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs leading-relaxed text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
                    Statement Branding Kanan Bawah (Tetap untuk Semua Akun)
                  </label>
                  <textarea
                    rows={2}
                    value={orgBranding.rightStatement}
                    onChange={(e) =>
                      setOrgBranding((prev) => ({
                        ...prev,
                        rightStatement: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs leading-relaxed text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Baris 4 Showcase Editor (/art#identitas-unhas — Videos / Design 4:5 / Documenter) */}
      <IdentitasAdminEditor />

      {/* Baris 5 Showcase Editor (/art#print-works — Magazine / Infographic / Product) */}
      <PrintAdminEditor />

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="rounded-[10px] border border-[#262626] bg-[#171717] p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#242424] pb-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#f59e0b]">
                Account #{String(idx + 1).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="inline-flex items-center gap-1 text-xs text-[#8a8a8a] hover:text-[#ff5a3d] transition-colors"
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#737373] mb-1">
                  Account / Brand Name
                </label>
                <input
                  type="text"
                  value={item.account}
                  onChange={(e) => updateField(item.id, 'account', e.target.value)}
                  placeholder="PK Identitas Unhas"
                  className="w-full rounded-[6px] border border-[#2a2a2a] bg-[#121212] px-3 py-2 text-xs text-white focus:border-[#f59e0b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#737373] mb-1">
                  Handle / Network
                </label>
                <input
                  type="text"
                  value={item.handle}
                  onChange={(e) => updateField(item.id, 'handle', e.target.value)}
                  placeholder="@identitasunhas"
                  className="w-full rounded-[6px] border border-[#2a2a2a] bg-[#121212] px-3 py-2 text-xs text-white focus:border-[#f59e0b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#737373] mb-1">
                  Period
                </label>
                <input
                  type="text"
                  value={item.period}
                  onChange={(e) => updateField(item.id, 'period', e.target.value)}
                  placeholder="2025 — NOW"
                  className="w-full rounded-[6px] border border-[#2a2a2a] bg-[#121212] px-3 py-2 text-xs text-white focus:border-[#f59e0b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#737373] mb-1">
                  Platform(s)
                </label>
                <input
                  type="text"
                  value={item.platform}
                  onChange={(e) => updateField(item.id, 'platform', e.target.value)}
                  placeholder="INSTAGRAM · TIKTOK"
                  className="w-full rounded-[6px] border border-[#2a2a2a] bg-[#121212] px-3 py-2 text-xs text-white focus:border-[#f59e0b] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#737373] mb-1">
                  Role / Scope
                </label>
                <input
                  type="text"
                  value={item.role}
                  onChange={(e) => updateField(item.id, 'role', e.target.value)}
                  placeholder="DATA, EDITORIAL & VISUAL SYSTEMS"
                  className="w-full rounded-[6px] border border-[#2a2a2a] bg-[#121212] px-3 py-2 text-xs text-white focus:border-[#f59e0b] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#737373] mb-1">
                Focus &amp; Strategy Description
              </label>
              <textarea
                rows={2}
                value={item.focus}
                onChange={(e) => updateField(item.id, 'focus', e.target.value)}
                placeholder="Describe content strategy, reach, and growth workflow..."
                className="w-full rounded-[6px] border border-[#2a2a2a] bg-[#121212] px-3 py-2 text-xs text-white focus:border-[#f59e0b] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#737373] mb-1">
                Key Impact / Growth Highlights (1 point per line)
              </label>
              <textarea
                rows={3}
                value={item.highlights.join('\n')}
                onChange={(e) => updateHighlights(item.id, e.target.value)}
                placeholder="Data-driven infographic series&#10;Consistent visual language"
                className="w-full rounded-[6px] border border-[#2a2a2a] bg-[#121212] px-3 py-2 text-xs text-white font-mono focus:border-[#f59e0b] focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      <MediaLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={(url) => {
          if (libraryTarget === 'org-branding') {
            updateOrgAccount(activeOrgTab, { mediaUrl: url });
          } else {
            updatePlatform(activeTab, { mediaUrl: url });
          }
          setIsLibraryOpen(false);
        }}
        title={
          libraryTarget === 'org-branding'
            ? `Pilih Media untuk ${orgBranding.accounts[activeOrgTab].handle}`
            : `Pilih Media untuk ${showcase.platforms[activeTab].label}`
        }
      />
    </div>
  );
}
