'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { purgeSystemCache } from '@/lib/utils';
import {
  DEFAULT_ART_ABOUT,
  parseArtAboutConfig,
  type ArtAboutConfig,
  type ArtAboutExperienceItem,
} from '@/lib/artAbout';
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react';

export default function AdminArtAboutPage() {
  const [config, setConfig] = useState<ArtAboutConfig>(DEFAULT_ART_ABOUT);
  const [skillsText, setSkillsText] = useState(
    DEFAULT_ART_ABOUT.skills.join('\n')
  );
  const [toolsText, setToolsText] = useState(
    DEFAULT_ART_ABOUT.tools.join('\n')
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importingExp, setImportingExp] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: settingsRows }, { data: expRows }] = await Promise.all([
          supabase.from('site_settings').select('key, value'),
          supabase
            .from('experiences')
            .select('*')
            .order('created_at', { ascending: false }),
        ]);

        const settingsMap: Record<string, string> = {};
        if (settingsRows) {
          settingsRows.forEach((r: any) => {
            settingsMap[r.key] = r.value;
          });
        }

        const mappedExps: ArtAboutExperienceItem[] = (expRows || []).map(
          (row: any, idx: number) => ({
            id: String(row.id || `exp-${idx}`),
            company: String(row.company || row.organization || '').trim(),
            role: String(row.role || row.position || row.title || '').trim(),
            period: String(row.period || row.duration || row.year || '').trim(),
            description: row.description ? String(row.description).trim() : '',
          })
        );

        const resolved = parseArtAboutConfig(
          settingsMap.art_about_config,
          settingsMap,
          mappedExps
        );
        setConfig(resolved);
        setSkillsText(resolved.skills.join('\n'));
        setToolsText(resolved.tools.join('\n'));
      } catch (err) {
        console.error('Failed to load Art About config:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const importDevExperiences = async () => {
    setImportingExp(true);
    try {
      const { data } = await supabase
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const mapped: ArtAboutExperienceItem[] = data.map(
          (row: any, idx: number) => ({
            id: String(row.id || `exp-${idx}`),
            company: String(row.company || row.organization || '').trim(),
            role: String(row.role || row.position || row.title || '').trim(),
            period: String(row.period || row.duration || row.year || '').trim(),
            description: row.description ? String(row.description).trim() : '',
          })
        );
        setConfig((prev) => ({ ...prev, experiences: mapped }));
        setNotice(
          `Berhasil mengambil ${mapped.length} Work Experience dari Dev Mode. Klik "Simpan About" untuk menyimpan.`
        );
      }
    } catch {
      // ignore
    } finally {
      setImportingExp(false);
    }
  };

  const moveExperience = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= config.experiences.length) return;
    const next = [...config.experiences];
    [next[idx], next[target]] = [next[target], next[idx]];
    setConfig((prev) => ({ ...prev, experiences: next }));
  };

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const payload: ArtAboutConfig = {
        ...config,
        skills: skillsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        tools: toolsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const { error } = await supabase
        .from('site_settings')
        .upsert(
          [{ key: 'art_about_config', value: JSON.stringify(payload) }],
          { onConflict: 'key' }
        );
      if (error) throw error;

      await purgeSystemCache();
      setConfig(payload);
      setNotice('Halaman About (/art/about) berhasil disimpan!');
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-xs uppercase tracking-widest text-[#707070]">
        <Loader2 size={16} className="mr-2 animate-spin" />
        Memuat konfigurasi /art/about...
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262626] pb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f59e0b]">
            Creative Mode · /art/about
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-[#f1eee9]">
            About Page Editor
          </h1>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            Atur konten WHO AM I, WORK EXPERIENCE, SKILLS &amp; TOOLS, serta
            CONNECT di halaman /art/about.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/art/about"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded border border-[#2e2e2e] bg-[#161616] px-3 py-2 text-xs text-[#d4d4d4] hover:bg-[#222222]"
          >
            <span>Lihat /art/about</span>
            <ExternalLink size={12} />
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-[#f59e0b] px-4 py-2 text-xs font-semibold text-[#111111] hover:bg-[#fbbf24] disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            <span>{saving ? 'Menyimpan...' : 'Simpan About'}</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="rounded border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 font-mono text-xs text-emerald-300">
          {notice}
        </div>
      )}

      {/* 1. WHO AM I */}
      <section className="space-y-4 rounded-[10px] border border-[#2a2a2a] bg-[#161616] p-5">
        <div className="border-b border-[#262626] pb-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f59e0b]">
            01 · WHO AM I
          </p>
          <h2 className="mt-0.5 text-[14px] font-semibold text-[#f1eee9]">
            Profil Singkat (2 Paragraf)
          </h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
              Paragraf Utama
            </label>
            <textarea
              rows={3}
              value={config.bioPrimary}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, bioPrimary: e.target.value }))
              }
              className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs leading-relaxed text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
              Paragraf Kedua (Opsional)
            </label>
            <textarea
              rows={3}
              value={config.bioSecondary}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, bioSecondary: e.target.value }))
              }
              className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs leading-relaxed text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 2. WORK EXPERIENCE */}
      <section className="space-y-4 rounded-[10px] border border-[#2a2a2a] bg-[#161616] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262626] pb-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f59e0b]">
              02 · WORK EXPERIENCE ({config.experiences.length})
            </p>
            <h2 className="mt-0.5 text-[14px] font-semibold text-[#f1eee9]">
              Pengalaman Kerja &amp; Organisasi Kreatif
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={importDevExperiences}
              disabled={importingExp}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-2.5 py-1.5 text-xs text-[#fbbf24] hover:bg-[#f59e0b]/20 disabled:opacity-60"
            >
              {importingExp ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <RefreshCw size={12} />
              )}
              <span>Sync dari Dev Experience</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  experiences: [
                    ...prev.experiences,
                    {
                      id: `exp-${Date.now()}`,
                      company: 'NAMA ORGANISASI / PERUSAHAAN',
                      role: 'PERAN / POSISI',
                      period: '2026 - NOW',
                      description: '',
                    },
                  ],
                }))
              }
              className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#2e2e2e] bg-[#1a1a1a] px-2.5 py-1.5 text-xs text-[#ededed] hover:bg-[#252525]"
            >
              <Plus size={12} />
              <span>Tambah Pengalaman</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {config.experiences.map((exp, idx) => (
            <div
              key={exp.id}
              className="space-y-2.5 rounded border border-[#262626] bg-[#111111] p-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#f59e0b]">
                  #{String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveExperience(idx, -1)}
                    disabled={idx === 0}
                    className="cursor-pointer rounded p-1 text-[#8a8a8a] hover:bg-[#222] hover:text-white disabled:opacity-30"
                    title="Naikkan"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveExperience(idx, 1)}
                    disabled={idx === config.experiences.length - 1}
                    className="cursor-pointer rounded p-1 text-[#8a8a8a] hover:bg-[#222] hover:text-white disabled:opacity-30"
                    title="Turunkan"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        experiences: prev.experiences.filter(
                          (_, i) => i !== idx
                        ),
                      }))
                    }
                    className="cursor-pointer rounded p-1 text-red-400 hover:bg-red-500/20"
                    title="Hapus"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
                <div>
                  <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-wider text-[#737373]">
                    Perusahaan / Organisasi
                  </label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const next = [...config.experiences];
                      next[idx] = { ...next[idx], company: e.target.value };
                      setConfig((prev) => ({ ...prev, experiences: next }));
                    }}
                    className="w-full rounded border border-[#262626] bg-[#0c0c0c] px-2.5 py-1.5 text-xs text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-wider text-[#737373]">
                    Role / Posisi
                  </label>
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => {
                      const next = [...config.experiences];
                      next[idx] = { ...next[idx], role: e.target.value };
                      setConfig((prev) => ({ ...prev, experiences: next }));
                    }}
                    className="w-full rounded border border-[#262626] bg-[#0c0c0c] px-2.5 py-1.5 text-xs text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-wider text-[#737373]">
                    Periode
                  </label>
                  <input
                    type="text"
                    value={exp.period}
                    onChange={(e) => {
                      const next = [...config.experiences];
                      next[idx] = { ...next[idx], period: e.target.value };
                      setConfig((prev) => ({ ...prev, experiences: next }));
                    }}
                    placeholder="2025 - NOW"
                    className="w-full rounded border border-[#262626] bg-[#0c0c0c] px-2.5 py-1.5 font-mono text-xs text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-wider text-[#737373]">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  value={exp.description || ''}
                  onChange={(e) => {
                    const next = [...config.experiences];
                    next[idx] = { ...next[idx], description: e.target.value };
                    setConfig((prev) => ({ ...prev, experiences: next }));
                  }}
                  className="w-full rounded border border-[#262626] bg-[#0c0c0c] px-2.5 py-1.5 text-xs leading-relaxed text-[#d4d4d4] focus:border-[#f59e0b] focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SKILLS & TOOLS */}
      <section className="space-y-4 rounded-[10px] border border-[#2a2a2a] bg-[#161616] p-5">
        <div className="border-b border-[#262626] pb-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f59e0b]">
            03 · SKILLS &amp; TOOLS
          </p>
          <h2 className="mt-0.5 text-[14px] font-semibold text-[#f1eee9]">
            Daftar Keahlian &amp; Software (1 baris = 1 item)
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
              Skills Utama (per baris)
            </label>
            <textarea
              rows={7}
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="CREATIVE DIRECTION&#10;BRAND & VISUAL IDENTITY"
              className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 font-mono text-xs leading-relaxed text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
              Tools / Software (per baris)
            </label>
            <textarea
              rows={7}
              value={toolsText}
              onChange={(e) => setToolsText(e.target.value)}
              placeholder="FIGMA · PHOTOSHOP · ILLUSTRATOR&#10;PREMIERE PRO · AFTER EFFECTS"
              className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 font-mono text-xs leading-relaxed text-[#a3a3a3] focus:border-[#f59e0b] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 4. CONNECT & FOOTER */}
      <section className="space-y-4 rounded-[10px] border border-[#2a2a2a] bg-[#161616] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262626] pb-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#f59e0b]">
              04 · CONNECT &amp; FOOTER
            </p>
            <h2 className="mt-0.5 text-[14px] font-semibold text-[#f1eee9]">
              Email, Tautan Sosial &amp; Lokasi Footer
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                links: [
                  ...prev.links,
                  {
                    id: `link-${Date.now()}`,
                    label: '@HANDLE',
                    platform: 'PLATFORM',
                    url: 'https://',
                  },
                ],
              }))
            }
            className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#2e2e2e] bg-[#1a1a1a] px-2.5 py-1.5 text-xs text-[#ededed] hover:bg-[#252525]"
          >
            <Plus size={12} />
            <span>Tambah Link</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
              Email (Klik untuk copy di /art/about)
            </label>
            <input
              type="email"
              value={config.email}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 font-mono text-xs text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#8a8a8a]">
              Teks Kanan Footer
            </label>
            <input
              type="text"
              value={config.footerLocation}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  footerLocation: e.target.value,
                }))
              }
              className="w-full rounded border border-[#2a2a2a] bg-[#101010] px-3 py-2 font-mono text-xs text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          {config.links.map((item, idx) => (
            <div
              key={item.id}
              className="grid grid-cols-1 items-center gap-2 rounded border border-[#262626] bg-[#111111] p-2.5 md:grid-cols-[1fr_140px_1.6fr_auto]"
            >
              <input
                type="text"
                value={item.label}
                onChange={(e) => {
                  const next = [...config.links];
                  next[idx] = { ...next[idx], label: e.target.value };
                  setConfig((prev) => ({ ...prev, links: next }));
                }}
                placeholder="@ADRIANBAHRI"
                className="rounded border border-[#262626] bg-[#0c0c0c] px-2.5 py-1.5 text-xs text-[#ededed]"
              />
              <input
                type="text"
                value={item.platform}
                onChange={(e) => {
                  const next = [...config.links];
                  next[idx] = { ...next[idx], platform: e.target.value };
                  setConfig((prev) => ({ ...prev, links: next }));
                }}
                placeholder="INSTAGRAM"
                className="rounded border border-[#262626] bg-[#0c0c0c] px-2.5 py-1.5 font-mono text-xs uppercase text-[#a3a3a3]"
              />
              <input
                type="url"
                value={item.url}
                onChange={(e) => {
                  const next = [...config.links];
                  next[idx] = { ...next[idx], url: e.target.value };
                  setConfig((prev) => ({ ...prev, links: next }));
                }}
                placeholder="https://..."
                className="rounded border border-[#262626] bg-[#0c0c0c] px-2.5 py-1.5 font-mono text-[11px] text-[#a3a3a3]"
              />
              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    links: prev.links.filter((_, i) => i !== idx),
                  }))
                }
                className="cursor-pointer rounded p-1.5 text-red-400 hover:bg-red-500/20"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
