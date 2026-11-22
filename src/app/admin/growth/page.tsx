'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { purgeSystemCache } from '@/lib/utils';
import { Plus, Trash2, Save, Loader2, TrendingUp } from 'lucide-react';

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
          .eq('key', 'social_growth');
        const raw = data?.[0]?.value;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
          }
        }
      } catch {
        // Keep defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
          [{ key: 'social_growth', value: JSON.stringify(cleaned) }],
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
    </div>
  );
}
