'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { purgeSystemCache } from '@/lib/utils';
import {
  DEFAULT_PRINT_SHOWCASE,
  PRINT_CATEGORY_LABELS,
  parsePrintShowcase,
  type PrintShowcaseConfig,
  type PrintWorkCategory,
} from '@/lib/printShowcase';
import { Loader2, Plus, Save, Trash2, Upload } from 'lucide-react';

export function PrintAdminEditor() {
  const [config, setConfig] = useState<PrintShowcaseConfig>(
    DEFAULT_PRINT_SHOWCASE
  );
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'print_works_showcase')
          .maybeSingle();
        if (data?.value) {
          setConfig(parsePrintShowcase(data.value));
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
        [{ key: 'print_works_showcase', value: JSON.stringify(config) }],
        { onConflict: 'key' }
      );
      if (error) throw error;
      await purgeSystemCache();
      setNotice('Print & Objects (Baris 5) berhasil disimpan ke /art!');
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
            Creative Mode · Baris 5 (/art#print-works)
          </p>
          <h2 className="mt-0.5 text-[15px] font-semibold text-[#f1eee9]">
            Print &amp; Objects (Magazine · Infographic · Product Design)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                items: [
                  ...prev.items,
                  {
                    id: `print-${Date.now()}`,
                    title: 'Karya Cetak Baru',
                    category: 'magazine',
                    spec: 'A4 · PRINT',
                    year: '2026',
                    narrative: '',
                    image: '',
                    extraImages: [],
                  },
                ],
              }))
            }
            className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#2e2e2e] bg-[#1a1a1a] px-3 py-1.5 text-xs text-[#ededed] hover:bg-[#252525]"
          >
            <Plus size={12} />
            <span>Tambah Karya Cetak</span>
          </button>

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
            <span>{saving ? 'Menyimpan...' : 'Simpan Baris 5'}</span>
          </button>
        </div>
      </div>

      {notice && (
        <p className="rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 font-mono text-xs text-emerald-300">
          {notice}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {config.items.map((item, idx) => (
          <div
            key={item.id}
            className="flex gap-3 rounded border border-[#262626] bg-[#121212] p-3.5"
          >
            {/* Cover Preview + Upload */}
            <div className="flex w-[100px] shrink-0 flex-col gap-1.5">
              <div className="aspect-[4/3] w-full overflow-hidden rounded border border-[#262626] bg-[#0e0e0e]">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center gap-1 rounded bg-[#262626] py-1 text-[10.5px] text-[#ededed] hover:bg-[#333]">
                {uploadingKey === item.id ? (
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
                    setUploadingKey(item.id);
                    try {
                      const url = await uploadFile(file, 'print-cover');
                      const next = [...config.items];
                      next[idx] = { ...next[idx], image: url };
                      setConfig((prev) => ({ ...prev, items: next }));
                    } catch (err: any) {
                      alert('Upload gagal: ' + err.message);
                    } finally {
                      setUploadingKey(null);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            </div>

            {/* Metadata Fields */}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => {
                    const next = [...config.items];
                    next[idx] = { ...next[idx], title: e.target.value };
                    setConfig((prev) => ({ ...prev, items: next }));
                  }}
                  placeholder="Judul karya cetak..."
                  className="min-w-0 flex-1 rounded border border-[#262626] bg-[#0e0e0e] px-2 py-1 text-xs text-[#ededed]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      items: prev.items.filter((_, i) => i !== idx),
                    }))
                  }
                  aria-label="Hapus karya cetak"
                  className="cursor-pointer rounded p-1 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <select
                  value={item.category}
                  onChange={(e) => {
                    const next = [...config.items];
                    next[idx] = {
                      ...next[idx],
                      category: e.target.value as PrintWorkCategory,
                    };
                    setConfig((prev) => ({ ...prev, items: next }));
                  }}
                  className="rounded border border-[#262626] bg-[#0e0e0e] px-2 py-1 text-[11px] text-[#ededed]"
                >
                  {(['magazine', 'infographic', 'product'] as const).map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {PRINT_CATEGORY_LABELS[cat]}
                      </option>
                    )
                  )}
                </select>
                <input
                  type="text"
                  value={item.spec}
                  onChange={(e) => {
                    const next = [...config.items];
                    next[idx] = { ...next[idx], spec: e.target.value };
                    setConfig((prev) => ({ ...prev, items: next }));
                  }}
                  placeholder="A4 · 48 PP"
                  className="rounded border border-[#262626] bg-[#0e0e0e] px-2 py-1 font-mono text-[10.5px] uppercase text-[#a3a3a3]"
                />
                <input
                  type="text"
                  value={item.year}
                  onChange={(e) => {
                    const next = [...config.items];
                    next[idx] = { ...next[idx], year: e.target.value };
                    setConfig((prev) => ({ ...prev, items: next }));
                  }}
                  placeholder="2026"
                  className="rounded border border-[#262626] bg-[#0e0e0e] px-2 py-1 font-mono text-[10.5px] text-[#a3a3a3]"
                />
              </div>

              <textarea
                rows={2}
                value={item.narrative}
                onChange={(e) => {
                  const next = [...config.items];
                  next[idx] = { ...next[idx], narrative: e.target.value };
                  setConfig((prev) => ({ ...prev, items: next }));
                }}
                placeholder="Narasi / cerita di balik karya cetak..."
                className="w-full rounded border border-[#262626] bg-[#0e0e0e] px-2 py-1 text-[11px] text-[#c0c0c0]"
              />

              {/* Multi-Spread Upload */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-[#737373]">
                    {1 + (item.extraImages?.length || 0)} Gambar Detail
                  </span>
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded bg-[#262626] px-2 py-0.5 text-[10.5px] text-[#ededed] hover:bg-[#333]">
                    {uploadingKey === `${item.id}-extra` ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : (
                      <Plus size={10} />
                    )}
                    <span>Upload Spread</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        setUploadingKey(`${item.id}-extra`);
                        try {
                          const urls = await Promise.all(
                            Array.from(files).map((f) =>
                              uploadFile(f, 'print-spread')
                            )
                          );
                          const next = [...config.items];
                          next[idx] = {
                            ...next[idx],
                            extraImages: [
                              ...(next[idx].extraImages || []),
                              ...urls,
                            ],
                          };
                          setConfig((prev) => ({ ...prev, items: next }));
                        } catch (err: any) {
                          alert('Upload spread gagal: ' + err.message);
                        } finally {
                          setUploadingKey(null);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                </div>

                {item.extraImages && item.extraImages.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.extraImages.map((sUrl, sIdx) => (
                      <div
                        key={`${sUrl}-${sIdx}`}
                        className="group relative h-9 w-12 overflow-hidden rounded border border-[#262626] bg-[#0e0e0e]"
                      >
                        <img
                          src={sUrl}
                          alt={`Spread ${sIdx + 2}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...config.items];
                            next[idx] = {
                              ...next[idx],
                              extraImages: (next[idx].extraImages || []).filter(
                                (_, i) => i !== sIdx
                              ),
                            };
                            setConfig((prev) => ({ ...prev, items: next }));
                          }}
                          aria-label="Hapus spread"
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
    </section>
  );
}
