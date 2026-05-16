'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus as PlusIcon, Search as SearchIcon, Edit2 as EditIcon, Trash2 as TrashIcon, Eye as EyeIcon, FileText as FileTextIcon, FileEdit as FileEditIcon, X as XIcon, Image as ImageIconComponent, Type as TypeIcon, Save as SaveIcon, ChevronLeft as ChevronLeftIcon } from 'lucide-react';
import { articles as staticArticles } from '@/data/articles';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function AdminArticles() {
  const [view, setView] = useState<'list' | 'metadata' | 'content'>('list');
  const [dbArticles, setDbArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  
  const [textContent, setTextContent] = useState('');
  const [activeArticle, setActiveArticle] = useState<any>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState({
    title: '', slug: '', category: '', description: '', author: 'Adrian Bahri', date: '',
    seo_title: '', seo_description: ''
  });

  const fetchArticles = async () => {
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (data) setDbArticles(data);
  };

  useEffect(() => { fetchArticles(); setLoading(false); }, []);

  const handleEditMetadata = (article: any) => {
    setEditingId(article.id);
    setActiveArticle(article);
    setFormData({
      title: article.title || '',
      slug: article.slug || '',
      category: article.category || '',
      description: article.description || '',
      author: article.author || 'Adrian Bahri',
      date: article.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      seo_title: article.seo_title || '',
      seo_description: article.seo_description || ''
    });
    setView('metadata');
  };

  const handleOpenContent = (article: any) => {
    setActiveArticle(article);
    setTextContent(article.content || '');
    setView('content');
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) { await supabase.from('articles').update(formData).eq('id', editingId); }
      else { await supabase.from('articles').insert([formData]); }
      setView('list');
      setEditingId(null);
      fetchArticles();
    } catch (err: any) { alert('Error: ' + err.message); }
    finally { setIsSaving(false); }
  };

  const handleSaveContent = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('articles').update({ content: textContent }).eq('id', activeArticle.id);
      if (error) throw error;
      setView('list');
      fetchArticles();
    } catch (err: any) { alert('Error: ' + err.message); }
    finally { setIsSaving(false); }
  };

  const insertHeading = () => {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + (before.endsWith('\n') || start === 0 ? '' : '\n') + '## ' + after;
    setTextContent(newText);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + 3, start + 3); }, 10);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('portfolio-assets').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('portfolio-assets').getPublicUrl(fileName);
      setTextContent((prev) => prev + `\n\n![Image](${publicUrl})\n\n`);
    } catch (err: any) { alert('Upload failed: ' + err.message); }
    finally { setIsUploading(false); }
  };

  const allArticles = dbArticles.length > 0 ? dbArticles : staticArticles;

  if (view === 'list') {
    return (
      <div className="space-y-12 pb-20 animate-in fade-in duration-500">
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-heading font-medium tracking-tight">Manage <span className="text-primary italic">Articles</span></h1>
            <p className="text-white/40">Total {allArticles.length} articles published.</p>
          </div>
          <button onClick={() => { setEditingId(null); setFormData({ title: '', slug: '', category: '', description: '', author: 'Adrian Bahri', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), seo_title: '', seo_description: '' }); setView('metadata'); }} className="flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
            <PlusIcon size={16} /> New Article
          </button>
        </header>
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/40">Article</th>
                <th className="px-8 py-5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allArticles.map((article, i) => (
                <tr key={article.id || i} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-primary/40"><FileTextIcon size={20} /></div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-white group-hover:text-primary transition-colors">{article.title}</p>
                        <p className="text-[0.65rem] text-white/30 font-mono">/{article.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenContent(article)} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-black transition-all shadow-sm" title="Edit Content"><FileEditIcon size={16} /></button>
                      <button onClick={() => handleEditMetadata(article)} className="p-2 text-white/20 hover:text-white transition-colors" title="Edit Metadata"><EditIcon size={16} /></button>
                      <button className="p-2 text-white/20 hover:text-red-500 transition-colors"><TrashIcon size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (view === 'metadata') {
    return (
      <div className="space-y-10 pb-20 animate-in slide-in-from-right-4 duration-500">
        <header className="flex items-center justify-between border-b border-white/5 pb-8">
          <div className="flex items-center gap-6">
            <button onClick={() => setView('list')} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all"><ChevronLeftIcon size={24} /></button>
            <h2 className="text-3xl font-heading font-medium italic">Article <span className="text-primary">Metadata</span></h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white">Cancel</button>
            <button onClick={handleSaveMetadata} disabled={isSaving} className="bg-primary text-black px-12 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">{isSaving ? 'Saving...' : 'Save Metadata'}</button>
          </div>
        </header>
        <form onSubmit={handleSaveMetadata} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div className="space-y-6">
              <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Title" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="Slug" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm" />
                <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="Category" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm" />
              </div>
              <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Short Description" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm" />
           </div>
           <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} placeholder="Author" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm" />
                <input type="text" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} placeholder="Date" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm" />
              </div>
              <div className="pt-6 border-t border-white/5 space-y-4">
                <p className="text-[0.6rem] font-bold uppercase tracking-widest text-primary/40 ml-2">Search Engine Optimization (SEO)</p>
                <input 
                  type="text" 
                  value={formData.seo_title} 
                  onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                  placeholder="Meta Title" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 outline-none" 
                />
                <textarea 
                  rows={2} 
                  value={formData.seo_description} 
                  onChange={(e) => setFormData({...formData, seo_description: e.target.value})}
                  placeholder="Meta Description" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 outline-none" 
                />
              </div>
           </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex items-center justify-between border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <button onClick={() => setView('list')} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all"><ChevronLeftIcon size={24} /></button>
          <h2 className="text-3xl font-heading font-medium italic">Edit <span className="text-primary">Article</span></h2>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
             <button onClick={insertHeading} className="p-2 hover:bg-white/10 rounded-lg text-white/60" title="Sub Heading"><TypeIcon size={18} /></button>
             <label className="p-2 hover:bg-white/10 rounded-lg text-white/60 cursor-pointer" title="Upload Image">
               <ImageIconComponent size={18} />
               <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
             </label>
           </div>
           <button onClick={handleSaveContent} disabled={isSaving} className="bg-primary text-black px-12 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
             {isSaving ? 'Saving...' : 'Save Article'}
           </button>
        </div>
      </header>
      <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="px-8 py-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
          <span className="text-[0.6rem] font-bold uppercase tracking-widest text-white/20">Article Editor</span>
          <span className="text-[0.6rem] font-bold uppercase tracking-widest text-primary/40">Auto-Expanding</span>
        </div>
        <textarea 
          ref={editorRef}
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          className="w-full bg-transparent p-12 lg:p-20 text-xl font-mono leading-relaxed text-white focus:outline-none resize-none min-h-[60vh]"
          placeholder="Start writing..."
          autoFocus
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
      </div>
    </div>
  );
}
