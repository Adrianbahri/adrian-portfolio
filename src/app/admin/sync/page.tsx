'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { projects as staticProjects } from '@/data/projects';
import { articles as staticArticles } from '@/data/articles';
import { workData, organizationData, volunteerData } from '@/data/experience';
import { achievementsData } from '@/data/achievements';
import { Database, RefreshCw, CheckCircle2, AlertCircle, Rocket, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSync() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showSql, setShowSql] = useState(false);

  const syncAll = async () => {
    setLoading(true);
    setResults([]);
    const logs: any[] = [];

    // 1. PROJECTS
    logs.push({ name: 'Projects', status: 'processing' });
    try {
      const projectsToSync = staticProjects.map((p: any) => ({
        title: p.title,
        slug: p.slug,
        category: p.category,
        status: p.status || 'Active',
        mode: p.mode || 'developer',
        year_range: p.yearRange,
        description: p.desc,
        github_url: p.github,
        demo_url: p.demo,
        img_url: p.img, // Using 'img_url' as standard
        tags: p.tags || [],
        content: {
          role: p.content?.role,
          timeline: p.content?.timeline || p.yearRange,
          published: p.content?.published,
          highlights: p.content?.highlights || [],
          markdown: p.content?.whatItIs ? `## What it is\n${p.content.whatItIs}\n\n## Problem it solves\n${p.content.problemItSolves}\n\n## How it works\n${p.content.howItWorks}` : ''
        }
      }));
      const { error } = await supabase.from('projects').upsert(projectsToSync, { onConflict: 'slug' });
      if (error) throw error;
      logs[0] = { name: 'Projects', status: 'success', count: projectsToSync.length };
    } catch (err: any) { logs[0] = { name: 'Projects', status: 'error', message: err.message }; }

    // 2. ARTICLES
    logs.push({ name: 'Articles', status: 'processing' });
    try {
      const articlesToSync = staticArticles.map((a: any) => ({
        title: a.title,
        slug: a.slug,
        category: a.category,
        description: a.description || (a as any).desc || '',
        author: a.author || 'Drian',
        date: a.date,
        content: a.content || ''
      }));
      const { error } = await supabase.from('articles').upsert(articlesToSync, { onConflict: 'slug' });
      if (error) throw error;
      logs[1] = { name: 'Articles', status: 'success', count: articlesToSync.length };
    } catch (err: any) { logs[1] = { name: 'Articles', status: 'error', message: err.message }; }

    // 3. EXPERIENCES (Work)
    logs.push({ name: 'Experiences', status: 'processing' });
    try {
      const expToSync = workData.map((w: any) => ({
        title: w.role,
        company: w.company,
        timeline: w.year,
        location: w.location,
        description: w.desc,
        points: w.points || []
      }));
      const { error } = await supabase.from('experiences').upsert(expToSync, { onConflict: 'title,company' });
      if (error) throw error;
      logs[2] = { name: 'Experiences', status: 'success', count: expToSync.length };
    } catch (err: any) { logs[2] = { name: 'Experiences', status: 'error', message: err.message }; }

    // 4. ORGANIZATIONS
    logs.push({ name: 'Organizations', status: 'processing' });
    try {
      const orgsToSync = organizationData.map((o: any) => ({
        title: o.role,
        company: o.company,
        timeline: o.year,
        description: o.desc
      }));
      const { error } = await supabase.from('organizations').upsert(orgsToSync, { onConflict: 'title,company' });
      if (error) throw error;
      logs[3] = { name: 'Organizations', status: 'success', count: orgsToSync.length };
    } catch (err: any) { logs[3] = { name: 'Organizations', status: 'error', message: err.message }; }

    // 5. VOLUNTEERING
    logs.push({ name: 'Volunteering', status: 'processing' });
    try {
      const volToSync = volunteerData.map((v: any) => ({
        title: v.role,
        company: v.company,
        timeline: v.year,
        description: v.desc
      }));
      const { error } = await supabase.from('volunteers').upsert(volToSync, { onConflict: 'title,company' });
      if (error) throw error;
      logs[4] = { name: 'Volunteering', status: 'success', count: volToSync.length };
    } catch (err: any) { logs[4] = { name: 'Volunteering', status: 'error', message: err.message }; }

    // 6. ACHIEVEMENTS
    logs.push({ name: 'Achievements', status: 'processing' });
    try {
      const achToSync = achievementsData.map((a: any) => ({
        title: a.title,
        event: a.event,
        year: a.year,
        desc: a.desc,
        icon: (a as any).icon?.name || 'Trophy' // Fallback to string name if possible
      }));
      const { error } = await supabase.from('achievements').upsert(achToSync, { onConflict: 'title,year' });
      if (error) throw error;
      logs[5] = { name: 'Achievements', status: 'success', count: achToSync.length };
    } catch (err: any) { logs[5] = { name: 'Achievements', status: 'error', message: err.message }; }

    // 7. CREATIVE SPOTLIGHT (Homepage Creative Categories)
    logs.push({ name: 'Creative Spotlight', status: 'processing' });
    try {
      const creativeCategoriesToSync = [
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
      ];
      const { error } = await supabase.from('creative_categories').upsert(creativeCategoriesToSync, { onConflict: 'id' });
      if (error) throw error;
      logs[6] = { name: 'Creative Spotlight', status: 'success', count: creativeCategoriesToSync.length };
    } catch (err: any) { logs[6] = { name: 'Creative Spotlight', status: 'error', message: err.message }; }

    setResults([...logs]);
    setLoading(false);
  };

  const sqlScript = `
-- =======================================================
-- SUPABASE SCHEMA ALIGNMENT & CLEANUP SCRIPT
-- =======================================================

-- 1. CLEANUP TRANSLATION SCHEMA (DROP UNUSED TRANSLATE COLUMNS)
ALTER TABLE experiences DROP COLUMN IF EXISTS points_en;
ALTER TABLE experiences DROP COLUMN IF EXISTS points_id;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS points TEXT[];

-- 2. CREATE / ALIGN EXPERIENCES (WORK) TABLE
CREATE TABLE IF NOT EXISTS experiences (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  timeline TEXT,
  location TEXT,
  description TEXT,
  points TEXT[],
  UNIQUE(title, company)
);

-- 3. CREATE / ALIGN ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS organizations (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  timeline TEXT,
  location TEXT,
  description TEXT,
  UNIQUE(title, company)
);

-- 4. CREATE / ALIGN VOLUNTEERS TABLE
CREATE TABLE IF NOT EXISTS volunteers (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  timeline TEXT,
  location TEXT,
  description TEXT,
  UNIQUE(title, company)
);

-- 5. ALIGN PROJECTS TABLE
ALTER TABLE projects ADD COLUMN IF NOT EXISTS img_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'developer';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS demo_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS company_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS year_range TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_keywords TEXT;

-- 6. ALIGN ARTICLES (BLOG) TABLE
ALTER TABLE articles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS img TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_keywords TEXT;

-- 7. CREATE / ALIGN MESSAGES TABLE (CONTACT FORM)
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE
);

-- RLS & SECURITY FOR MESSAGES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert" ON messages;
CREATE POLICY "Allow public insert" ON messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow auth all" ON messages;
CREATE POLICY "Allow auth all" ON messages FOR ALL TO authenticated USING (true);

-- 8. CREATE / ALIGN CREATIVE SPOTLIGHT TABLE
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

-- RLS & SECURITY FOR CREATIVE SPOTLIGHT
ALTER TABLE creative_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select" ON creative_categories;
CREATE POLICY "Allow public select" ON creative_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow auth all" ON creative_categories;
CREATE POLICY "Allow auth all" ON creative_categories FOR ALL TO authenticated USING (true);

-- 9. CREATE / ALIGN SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  value TEXT
);

-- RLS & SECURITY FOR SITE SETTINGS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select" ON site_settings;
CREATE POLICY "Allow public select" ON site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow auth all" ON site_settings;
CREATE POLICY "Allow auth all" ON site_settings FOR ALL TO authenticated USING (true);

-- 10. ALIGN DESIGN THEMES TABLE WITH PDF URL SUPPORT
ALTER TABLE design_themes ADD COLUMN IF NOT EXISTS pdf_url TEXT;
  `.trim();

  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-12 shadow-2xl relative">
        <header className="mb-12 text-center">
          <Database className="text-primary mx-auto mb-6 shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]" size={48} />
          <h1 className="text-4xl font-heading font-medium italic">Database <span className="text-primary">Alignment</span></h1>
          <p className="text-white/40 mt-4">Ensuring your Supabase schema matches the CMS requirements.</p>
        </header>

        {results.length > 0 && (
          <div className="space-y-3 mb-12">
            {results.map((res: any, i: number) => (
              <div key={i} className={cn("p-6 rounded-2xl border transition-all", res.status === 'error' ? "bg-red-500/5 border-red-500/20" : "bg-white/[0.02] border-white/5")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {res.status === 'success' ? <CheckCircle2 className="text-primary" size={20} /> : res.status === 'error' ? <AlertCircle className="text-red-500" size={20} /> : <RefreshCw className="animate-spin text-white/20" size={20} />}
                    <span className="font-bold uppercase tracking-widest text-xs text-white/60">{res.name}</span>
                  </div>
                  {res.status === 'error' && (
                    <button onClick={() => setShowSql(true)} className="text-[0.6rem] font-bold uppercase tracking-widest text-red-500 underline underline-offset-4">Fix Schema</button>
                  )}
                </div>
                {res.message && <p className="mt-3 text-[0.65rem] font-mono text-red-500/80 leading-relaxed">{res.message}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <button onClick={syncAll} disabled={loading} className="w-full bg-primary text-black py-6 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3">
             {loading ? <RefreshCw className="animate-spin" size={20} /> : <Rocket size={20} />}
             {loading ? 'Processing...' : 'Run Sync'}
          </button>
          
          <button onClick={() => setShowSql(!showSql)} className="py-4 text-xs font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors">
            {showSql ? 'Hide SQL Fix' : 'Show Manual SQL Fix'}
          </button>
        </div>

        {showSql && (
          <div className="mt-12 animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-xs font-bold uppercase tracking-widest text-primary">SQL Schema Script</h3>
               <button onClick={() => { navigator.clipboard.writeText(sqlScript); alert('Copied to clipboard!'); }} className="flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-widest text-white/40 hover:text-white"><Copy size={12} /> Copy Script</button>
             </div>
             <pre className="bg-black/50 p-8 rounded-2xl border border-white/5 text-[0.7rem] font-mono text-white/40 overflow-x-auto">
               {sqlScript}
             </pre>
             <p className="mt-4 text-[0.6rem] text-white/20 italic">Copy this script and run it in the SQL Editor on your Supabase Dashboard to add missing columns.</p>
          </div>
        )}
      </div>
    </div>
  );
}
