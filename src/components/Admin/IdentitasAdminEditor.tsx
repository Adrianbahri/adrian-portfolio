'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { purgeSystemCache } from '@/lib/utils';
import {
  DEFAULT_IDENTITAS_SHOWCASE,
  isDefaultMockDesigns,
  isDefaultMockDocs,
  mapDesignThemesToIdentitasDesigns,
  mapVideoWorksToIdentitasDocs,
  parseIdentitasShowcase,
  type IdentitasModeKey,
  type IdentitasShowcaseConfig,
} from '@/lib/identitasShowcase';
import {
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import MediaLibraryModal from '@/components/Admin/MediaLibraryModal';

type LibraryTarget =
  | { kind: 'video'; idx: number }
  | { kind: 'design-cover'; idx: number }
  | { kind: 'design-slide'; idx: number }
  | null;

export function IdentitasAdminEditor() {
  const [config, setConfig] = useState<IdentitasShowcaseConfig>(
    DEFAULT_IDENTITAS_SHOWCASE
  );
  const [tab, setTab] = useState<IdentitasModeKey>('videos');
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [importingThemes, setImportingThemes] = useState(false);
  const [importingDocs, setImportingDocs] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState<LibraryTarget>(null);

  const handleLibrarySelect = (url: string) => {
    if (!libraryTarget) return;
    if (libraryTarget.kind === 'video') {
      setConfig((prev) => {
        const next = [...prev.videos];
        if (next[libraryTarget.idx]) {
          next[libraryTarget.idx] = {
            ...next[libraryTarget.idx],
            mediaUrl: url,
          };
        }
        return { ...prev, videos: next };
      });
    } else if (libraryTarget.kind === 'design-cover') {
      setConfig((prev) => {
        const next = [...prev.designs];
        if (next[libraryTarget.idx]) {
          next[libraryTarget.idx] = { ...next[libraryTarget.idx], image: url };
        }
        return { ...prev, designs: next };
      });
    } else if (libraryTarget.kind === 'design-slide') {
      setConfig((prev) => {
        const next = [...prev.designs];
        if (next[libraryTarget.idx]) {
          next[libraryTarget.idx] = {
            ...next[libraryTarget.idx],
            extraImages: [...(next[libraryTarget.idx].extraImages || []), url],
          };
        }
        return { ...prev, designs: next };
      });
    }
    setLibraryTarget(null);
  };

  const importFromLegacyDesignThemes = async (silent = false) => {
    setImportingThemes(true);
    try {
      const { data } = await supabase
        .from('design_themes')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const mapped = mapDesignThemesToIdentitasDesigns(data as any[]);
        if (mapped.length > 0) {
          setConfig((prev) => ({ ...prev, designs: mapped }));
          if (!silent) {
            setNotice(
              `Berhasil memindahkan ${mapped.length} tema design dari Design Projects. Klik "Simpan Baris 4" untuk menyimpan permanen.`
            );
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setImportingThemes(false);
    }
  };

  const importFromLegacyVideoWorks = async (silent = false) => {
    setImportingDocs(true);
    try {
      const { data } = await supabase
        .from('video_works')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const mapped = mapVideoWorksToIdentitasDocs(data as any[]);
        if (mapped.length > 0) {
          setConfig((prev) => ({ ...prev, documenters: mapped }));
          if (!silent) {
            setNotice(
              `Berhasil memindahkan ${mapped.length} video dari Video & Motion ke Documenter. Klik "Simpan Baris 4" untuk menyimpan permanen.`
            );
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setImportingDocs(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'identitas_showcase')
          .maybeSingle();
        if (data?.value) {
          const parsed = parseIdentitasShowcase(data.value);
          setConfig(parsed);
          const hydrations: Promise<void>[] = [];
          if (isDefaultMockDesigns(parsed.designs)) {
            hydrations.push(importFromLegacyDesignThemes(true));
          }
          if (isDefaultMockDocs(parsed.documenters)) {
            hydrations.push(importFromLegacyVideoWorks(true));
          }
          if (hydrations.length > 0) {
            await Promise.all(hydrations);
          }
        } else {
          // Automatically hydrate Design 4:5 and Documenter from legacy tables
          await Promise.all([
            importFromLegacyDesignThemes(true),
            importFromLegacyVideoWorks(true),
          ]);
        }
      } catch {
        // Keep defaults
      }
    })();
  }, []);

  const uploadFile = async (file: File, prefix: string): Promise<string> => {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const filePath = `growth/${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}.${ext}`;
    const { error } = await supabase.storage
      .from('portfolio-assets')
      .upload(filePath, file);
    if (error) throw error;
    return `/api/assets/${filePath}`;
  };

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const { error } = await supabase.from('site_settings').upsert(
        [{ key: 'identitas_showcase', value: JSON.stringify(config) }],
        { onConflict: 'key' }
      );
      if (error) throw error;
      await purgeSystemCache();
      setNotice('Identitas Unhas (Baris 4) berhasil disimpan ke /art!');
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-[10px] border border-[#2a2a2a] bg-[#161616] p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262626] pb-3.5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f59e0b]">
            Creative Mode · Baris 4 (/art#identitas-unhas)
          </p>
          <h2 className="mt-0.5 text-[15px] font-semibold text-[#f1eee9]">
            Identitas Unhas (Videos · Design 4:5 · Documenter YouTube)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded border border-[#2e2e2e] bg-[#111111] p-0.5">
            {(
              [
                { key: 'videos', label: 'Videos' },
                { key: 'design', label: 'Design 4:5' },
                { key: 'documenter', label: 'Documenter' },
              ] as Array<{ key: IdentitasModeKey; label: string }>
            ).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`cursor-pointer rounded px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  tab === key
                    ? 'bg-[#f59e0b] text-[#111111] font-semibold'
                    : 'text-[#8a8a8a] hover:text-[#ededed]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-[#f59e0b] px-3.5 py-1.5 text-xs font-semibold text-[#111111] hover:bg-[#fbbf24] disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            <span>{saving ? 'Menyimpan...' : 'Simpan Baris 4'}</span>
          </button>
        </div>
      </div>

      {notice && (
        <p className="rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 font-mono text-xs text-emerald-300">
          {notice}
        </p>
      )}

      {/* Shared Title & Description */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
            Judul Kanan
          </label>
          <input
            type="text"
            value={config.title}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
            Deskripsi Identitas Unhas
          </label>
          <textarea
            rows={2}
            value={config.description}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs leading-relaxed text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
          />
        </div>
      </div>

      {/* TAB 1: VIDEOS */}
      {tab === 'videos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-[#8a8a8a]">
              Daftar Antrian Video Vertikal ({config.videos.length} video)
            </p>
            <button
              type="button"
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  videos: [
                    ...prev.videos,
                    {
                      id: `id-vid-${Date.now()}`,
                      title: 'Video Baru',
                      mediaUrl: '',
                    },
                  ],
                }))
              }
              className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#2e2e2e] bg-[#1a1a1a] px-2.5 py-1 text-xs text-[#ededed] hover:bg-[#252525]"
            >
              <Plus size={12} />
              <span>Tambah Video</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {config.videos.map((v, idx) => (
              <div
                key={v.id}
                className="grid grid-cols-1 items-center gap-2 rounded border border-[#262626] bg-[#121212] p-3 md:grid-cols-[44px_1fr_1.4fr_auto]"
              >
                <span className="font-mono text-xs text-[#f59e0b]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <input
                  type="text"
                  value={v.title}
                  onChange={(e) => {
                    const next = [...config.videos];
                    next[idx] = { ...next[idx], title: e.target.value };
                    setConfig((prev) => ({ ...prev, videos: next }));
                  }}
                  placeholder="Judul video..."
                  className="rounded border border-[#262626] bg-[#0e0e0e] px-2.5 py-1.5 text-xs text-[#ededed]"
                />
                <input
                  type="text"
                  value={v.mediaUrl}
                  onChange={(e) => {
                    const next = [...config.videos];
                    next[idx] = { ...next[idx], mediaUrl: e.target.value };
                    setConfig((prev) => ({ ...prev, videos: next }));
                  }}
                  placeholder="URL .mp4 / YouTube Shorts / Gambar..."
                  className="rounded border border-[#262626] bg-[#0e0e0e] px-2.5 py-1.5 font-mono text-[11px] text-[#a3a3a3]"
                />
                <div className="flex items-center gap-1.5">
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded bg-[#262626] px-2.5 py-1.5 text-[11px] text-[#ededed] hover:bg-[#333]">
                    {uploadingKey === v.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Upload size={12} />
                    )}
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="video/*,image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingKey(v.id);
                        try {
                          const url = await uploadFile(file, 'identitas-vid');
                          const next = [...config.videos];
                          next[idx] = { ...next[idx], mediaUrl: url };
                          setConfig((prev) => ({ ...prev, videos: next }));
                        } catch (err: any) {
                          alert('Upload gagal: ' + err.message);
                        } finally {
                          setUploadingKey(null);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setLibraryTarget({ kind: 'video', idx })}
                    className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-2 py-1.5 text-[11px] text-[#fbbf24] hover:bg-[#f59e0b]/20"
                  >
                    <ImageIcon size={12} />
                    <span>Library</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        videos: prev.videos.filter((_, i) => i !== idx),
                      }))
                    }
                    className="cursor-pointer rounded p-1.5 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DESIGN 4:5 GRID */}
      {tab === 'design' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-[#8a8a8a]">
              Grid Design 4:5 ({config.designs.length} karya — klik di /art
              untuk detail)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => importFromLegacyDesignThemes(false)}
                disabled={importingThemes}
                className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#2e2e2e] bg-[#1a1a1a] px-2.5 py-1 text-xs text-[#f59e0b] hover:bg-[#252525] disabled:opacity-60"
              >
                <RefreshCw
                  size={12}
                  className={importingThemes ? 'animate-spin' : ''}
                />
                <span>
                  {importingThemes
                    ? 'Memindahkan...'
                    : 'Import dari Design Lama'}
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    designs: [
                      ...prev.designs,
                      {
                        id: `id-des-${Date.now()}`,
                        title: 'Karya Design Baru',
                        tags: ['EDITORIAL', 'DESIGN'],
                        narrative: '',
                        image: '',
                        extraImages: [],
                      },
                    ],
                  }))
                }
                className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#2e2e2e] bg-[#1a1a1a] px-2.5 py-1 text-xs text-[#ededed] hover:bg-[#252525]"
              >
                <Plus size={12} />
                <span>Tambah Design</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {config.designs.map((d, idx) => (
              <div
                key={d.id}
                className="flex gap-3 rounded border border-[#262626] bg-[#121212] p-3"
              >
                <div className="flex w-[86px] shrink-0 flex-col gap-1.5">
                  <div className="aspect-[4/5] w-full overflow-hidden rounded border border-[#262626] bg-[#0e0e0e]">
                    {d.image ? (
                      <img
                        src={d.image}
                        alt={d.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center gap-1 rounded bg-[#262626] py-1 text-[10.5px] text-[#ededed] hover:bg-[#333]">
                    {uploadingKey === d.id ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Upload size={11} />
                    )}
                    <span>Cover</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingKey(d.id);
                        try {
                          const url = await uploadFile(file, 'identitas-des');
                          const next = [...config.designs];
                          next[idx] = { ...next[idx], image: url };
                          setConfig((prev) => ({ ...prev, designs: next }));
                        } catch (err: any) {
                          alert('Upload gagal: ' + err.message);
                        } finally {
                          setUploadingKey(null);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setLibraryTarget({ kind: 'design-cover', idx })
                    }
                    className="inline-flex cursor-pointer items-center justify-center gap-1 rounded border border-[#f59e0b]/40 bg-[#f59e0b]/10 py-1 text-[10.5px] text-[#fbbf24] hover:bg-[#f59e0b]/20"
                  >
                    <ImageIcon size={10} />
                    <span>Library</span>
                  </button>
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={d.title}
                      onChange={(e) => {
                        const next = [...config.designs];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setConfig((prev) => ({ ...prev, designs: next }));
                      }}
                      placeholder="Judul design..."
                      className="min-w-0 flex-1 rounded border border-[#262626] bg-[#0e0e0e] px-2 py-1 text-xs text-[#ededed]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          designs: prev.designs.filter((_, i) => i !== idx),
                        }))
                      }
                      className="cursor-pointer rounded p-1 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={d.tags.join(', ')}
                    onChange={(e) => {
                      const next = [...config.designs];
                      next[idx] = {
                        ...next[idx],
                        tags: e.target.value
                          .split(',')
                          .map((t) => t.trim().toUpperCase())
                          .filter(Boolean),
                      };
                      setConfig((prev) => ({ ...prev, designs: next }));
                    }}
                    placeholder="INFOGRAPHIC, EDITORIAL"
                    className="w-full rounded border border-[#262626] bg-[#0e0e0e] px-2 py-1 font-mono text-[10.5px] uppercase text-[#a3a3a3]"
                  />
                  <textarea
                    rows={2}
                    value={d.narrative}
                    onChange={(e) => {
                      const next = [...config.designs];
                      next[idx] = { ...next[idx], narrative: e.target.value };
                      setConfig((prev) => ({ ...prev, designs: next }));
                    }}
                    placeholder="Narasi detail saat diklik..."
                    className="w-full rounded border border-[#262626] bg-[#0e0e0e] px-2 py-1 text-[11px] text-[#c0c0c0]"
                  />

                  {/* Multi-Slide Carousel Upload (Slide 2..N for 4+1/4 peek & detail scroll) */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="font-mono text-[10px] uppercase text-[#737373]">
                        Total {1 + (d.extraImages?.length || 0)} Slide
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setLibraryTarget({ kind: 'design-slide', idx })
                          }
                          className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-2 py-0.5 text-[10.5px] text-[#fbbf24] hover:bg-[#f59e0b]/20"
                        >
                          <ImageIcon size={10} />
                          <span>Library</span>
                        </button>
                        <label className="inline-flex cursor-pointer items-center gap-1 rounded bg-[#262626] px-2 py-0.5 text-[10.5px] text-[#ededed] hover:bg-[#333]">
                        {uploadingKey === `${d.id}-extra` ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <Plus size={10} />
                        )}
                        <span>Upload Slide</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (!files || files.length === 0) return;
                            setUploadingKey(`${d.id}-extra`);
                            try {
                              const urls = await Promise.all(
                                Array.from(files).map((f) =>
                                  uploadFile(f, 'identitas-slide')
                                )
                              );
                              const next = [...config.designs];
                              next[idx] = {
                                ...next[idx],
                                extraImages: [
                                  ...(next[idx].extraImages || []),
                                  ...urls,
                                ],
                              };
                              setConfig((prev) => ({ ...prev, designs: next }));
                            } catch (err: any) {
                              alert('Upload slide gagal: ' + err.message);
                            } finally {
                              setUploadingKey(null);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                      </div>
                    </div>

                    {d.extraImages && d.extraImages.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {d.extraImages.map((sUrl, sIdx) => (
                          <div
                            key={`${sUrl}-${sIdx}`}
                            className="group relative h-11 w-9 overflow-hidden rounded border border-[#262626] bg-[#0e0e0e]"
                          >
                            <img
                              src={sUrl}
                              alt={`Slide ${sIdx + 2}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...config.designs];
                                next[idx] = {
                                  ...next[idx],
                                  extraImages: (
                                    next[idx].extraImages || []
                                  ).filter((_, i) => i !== sIdx),
                                };
                                setConfig((prev) => ({
                                  ...prev,
                                  designs: next,
                                }));
                              }}
                              aria-label="Hapus slide"
                              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/70 text-red-400 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENTER (YOUTUBE 16:9) */}
      {tab === 'documenter' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-[#8a8a8a]">
              Daftar Karya Dokumenter YouTube 16:9 ({config.documenters.length}{' '}
              karya)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => importFromLegacyVideoWorks(false)}
                disabled={importingDocs}
                className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-2.5 py-1 text-xs text-[#fbbf24] hover:bg-[#f59e0b]/20 disabled:opacity-60"
              >
                {importingDocs ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <RefreshCw size={12} />
                )}
                <span>Import dari Video Lama</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    documenters: [
                      ...prev.documenters,
                      {
                        id: `id-doc-${Date.now()}`,
                        title: 'Dokumenter Baru',
                        youtubeUrl: '',
                      },
                    ],
                  }))
                }
                className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#2e2e2e] bg-[#1a1a1a] px-2.5 py-1 text-xs text-[#ededed] hover:bg-[#252525]"
              >
                <Plus size={12} />
                <span>Tambah Dokumenter</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {config.documenters.map((doc, idx) => (
              <div
                key={doc.id}
                className="grid grid-cols-1 items-center gap-2 rounded border border-[#262626] bg-[#121212] p-3 md:grid-cols-[44px_1fr_1.4fr_auto]"
              >
                <span className="font-mono text-xs text-[#f59e0b]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <input
                  type="text"
                  value={doc.title}
                  onChange={(e) => {
                    const next = [...config.documenters];
                    next[idx] = { ...next[idx], title: e.target.value };
                    setConfig((prev) => ({ ...prev, documenters: next }));
                  }}
                  placeholder="Judul dokumenter..."
                  className="rounded border border-[#262626] bg-[#0e0e0e] px-2.5 py-1.5 text-xs text-[#ededed]"
                />
                <input
                  type="url"
                  value={doc.youtubeUrl}
                  onChange={(e) => {
                    const next = [...config.documenters];
                    next[idx] = { ...next[idx], youtubeUrl: e.target.value };
                    setConfig((prev) => ({ ...prev, documenters: next }));
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="rounded border border-[#262626] bg-[#0e0e0e] px-2.5 py-1.5 font-mono text-[11px] text-[#a3a3a3]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      documenters: prev.documenters.filter((_, i) => i !== idx),
                    }))
                  }
                  className="cursor-pointer rounded p-1.5 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <MediaLibraryModal
        isOpen={libraryTarget !== null}
        onClose={() => setLibraryTarget(null)}
        onSelect={handleLibrarySelect}
        title={
          libraryTarget?.kind === 'design-cover'
            ? 'Pilih Cover Design dari Media Library'
            : libraryTarget?.kind === 'design-slide'
            ? 'Tambah Slide Design dari Media Library'
            : 'Pilih Media dari Media Library'
        }
      />
    </section>
  );
}
