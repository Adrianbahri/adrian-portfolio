'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  FileText, 
  FileEdit, 
  X, 
  Save, 
  ChevronLeft,
  PlusCircle
} from 'lucide-react';
import Editor from '@/components/Editor';
import UnifiedEditorLayout from '@/components/UnifiedEditorLayout';
import { articles as staticArticles } from '@/data/articles';
import { supabase } from '@/lib/supabase';
import { compressToWebP } from '@/lib/image';
import { cn, purgeSystemCache } from '@/lib/utils';
import DeleteModal from '@/components/Admin/DeleteModal';
import MediaLibraryModal from '@/components/Admin/MediaLibraryModal';

export default function AdminArticles() {
  const [view, setView] = useState<'list' | 'metadata' | 'content'>('list');
  const [dbArticles, setDbArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  
  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const [textContent, setTextContent] = useState('');
  const [activeArticle, setActiveArticle] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '', slug: '', category: '', description: '', author: 'Drian', date: '',
    seo_title: '', seo_description: '', img: '', tags: '', seo_keywords: ''
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
      author: article.author || 'Drian',
      date: article.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      seo_title: article.seo_title || '',
      seo_description: article.seo_description || '',
      img: article.img || '',
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
      seo_keywords: article.seo_keywords || ''
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

    const payload = {
      title: formData.title,
      slug: formData.slug,
      category: formData.category,
      description: formData.description,
      author: formData.author,
      date: formData.date,
      seo_title: formData.seo_title,
      seo_description: formData.seo_description,
      img: formData.img || null,
      seo_keywords: formData.seo_keywords || null,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim().toUpperCase()).filter(Boolean) : []
    };

    try {
      if (editingId) { await supabase.from('articles').update(payload).eq('id', editingId); }
      else { await supabase.from('articles').insert([payload]); }
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

  const confirmDelete = (article: any) => {
    setItemToDelete(article);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const { error } = await supabase.from('articles').delete().eq('id', itemToDelete.id);
      if (error) throw error;
      setDbArticles(prev => prev.filter(a => a.id !== itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) { alert('Error: ' + err.message); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const compressedFile = await compressToWebP(file);
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('portfolio-assets').upload(fileName, compressedFile);
      if (error) throw error;
      const cleanProxyUrl = `/api/assets/${fileName}`;
      
      // If we are in content view, we want to append the image to the editor
      // We'll handle this by updating the textContent which will be passed to the Editor
      setTextContent((prev) => prev + `<img src="${cleanProxyUrl}" alt="Uploaded image" />`);
    } catch (err: any) { alert('Upload failed: ' + err.message); }
    finally { setIsUploading(false); }
  };

  const allArticles = dbArticles;

  if (view === 'list') {
    return (
      <div data-lenis-prevent className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
        <header className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-xl font-medium text-[#ededed]">Articles</h1>
            <p className="text-[13px] text-[#707070]">Total {allArticles.length} articles published in your blog.</p>
          </div>
          <button 
            onClick={() => { setEditingId(null); setFormData({ title: '', slug: '', category: '', description: '', author: 'Drian', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), seo_title: '', seo_description: '', img: '', tags: '', seo_keywords: '' }); setView('metadata'); }} 
            className="bg-[#3ecf8e] text-[#171717] px-3 py-1.5 rounded-md text-[13px] font-medium hover:bg-[#24b47e] transition-all"
          >
            New Article
          </button>
        </header>

        <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-md overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2e2e2e] bg-[#202020]">
                <th className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#707070]">Article</th>
                <th className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#707070]">Category</th>
                <th className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#707070]">Date</th>
                <th className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#707070] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2e2e]">
              {allArticles.map((article: any, i: number) => (
                <tr key={article.id || i} className="group hover:bg-[#232323] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-[#2e2e2e] flex items-center justify-center text-[#3ecf8e] border border-[#3e3e3e]">
                        <FileText size={12} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-medium text-[#ededed] group-hover:text-[#3ecf8e] transition-colors truncate max-w-[300px]">{article.title}</span>
                        <span className="text-[10px] font-mono text-[#707070]">/{article.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2e2e2e] text-[#9a9a9a] border border-[#3e3e3e]">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[12px] text-[#707070]">{article.date}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={`/blog/${article.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#252525] text-[#9a9a9a] rounded hover:text-[#3ecf8e] border border-[#2e2e2e] transition-all" title="View live article"><Eye size={12} /></a>
                      <button onClick={() => handleOpenContent(article)} className="p-1.5 bg-[#252525] text-[#9a9a9a] rounded hover:text-[#3ecf8e] border border-[#2e2e2e] transition-all"><FileEdit size={12} /></button>
                      <button onClick={() => handleEditMetadata(article)} className="p-1.5 bg-[#252525] text-[#9a9a9a] rounded hover:text-white border border-[#2e2e2e] transition-all"><Edit2 size={12} /></button>
                      <button onClick={() => confirmDelete(article)} className="p-1.5 bg-[#252525] text-[#9a9a9a] rounded hover:text-[#ff2201] border border-[#2e2e2e] transition-all"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DeleteModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Article"
          itemName={itemToDelete?.title || 'this article'}
        />
      </div>
    );
  }

  if (view === 'metadata') {
    return (
      <div data-lenis-prevent className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
        <header className="flex items-center justify-between border-b border-[#2e2e2e] pb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="w-8 h-8 bg-[#252525] rounded-md border border-[#2e2e2e] flex items-center justify-center text-[#707070] hover:text-[#ededed] transition-all"><ChevronLeft size={16} /></button>
            <h2 className="text-xl font-medium text-[#ededed]">Article Metadata</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setView('list')} className="px-4 py-1.5 text-[13px] font-medium text-[#707070] hover:text-[#ededed]">Cancel</button>
            <button 
              onClick={handleSaveMetadata} 
              disabled={isSaving} 
              className="bg-[#3ecf8e] text-[#171717] px-5 py-1.5 rounded-md text-[13px] font-medium hover:bg-[#24b47e] transition-all flex items-center gap-2"
            >
              {isSaving ? 'Saving...' : <><Save size={14} /> Save Metadata</>}
            </button>
          </div>
        </header>
        <form onSubmit={handleSaveMetadata} className="max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="space-y-4">
              {/* Featured Image Section */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Featured Image (Gambar Unggulan)</label>
                <div className="relative group/thumb aspect-video rounded-xl bg-[#1c1c1c] border border-[#2e2e2e] overflow-hidden flex flex-col items-center justify-center transition-all hover:border-[#3ecf8e]/30">
                  {formData.img ? (
                    <>
                      <img src={formData.img} alt="Featured Image" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <label className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-[#3ecf8e] transition-all">
                          Change
                          <input type="file" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setIsUploading(true);
                            try {
                              const compressedFile = await compressToWebP(file);
                              const fileExt = compressedFile.name.split('.').pop();
                              const fileName = `${Math.random()}.${fileExt}`;
                              const { data, error } = await supabase.storage.from('portfolio-assets').upload(fileName, compressedFile);
                              if (error) throw error;
                              const cleanProxyUrl = `/api/assets/${fileName}`;
                              setFormData({...formData, img: cleanProxyUrl});
                            } catch (err: any) { alert('Upload failed: ' + err.message); }
                            finally { setIsUploading(false); }
                          }} accept="image/*" />
                        </label>
                        <button 
                          type="button" 
                          onClick={() => setIsMediaModalOpen(true)}
                          className="bg-[#3ecf8e] text-[#171717] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#24b47e] transition-all"
                        >
                          Library
                        </button>
                        <button type="button" onClick={() => setFormData({...formData, img: ''})} className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all">
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <PlusCircle size={32} className="text-[#3ecf8e] mb-2 opacity-40 group-hover/thumb:opacity-100 transition-all" />
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#707070] mb-3">Featured Image</p>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer bg-white/5 border border-white/10 text-white hover:bg-white/10 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
                          Upload File
                          <input type="file" className="hidden" onChange={async (e) => {
                             const file = e.target.files?.[0];
                             if (!file) return;
                             setIsUploading(true);
                             try {
                               const fileExt = file.name.split('.').pop();
                               const fileName = `${Math.random()}.${fileExt}`;
                               const { data, error } = await supabase.storage.from('portfolio-assets').upload(fileName, file);
                               if (error) throw error;
                               const cleanProxyUrl = `/api/assets/${fileName}`;
                               setFormData({...formData, img: cleanProxyUrl});
                             } catch (err: any) { alert('Upload failed: ' + err.message); }
                             finally { setIsUploading(false); }
                          }} accept="image/*" />
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsMediaModalOpen(true)}
                          className="bg-[#3ecf8e] text-[#171717] hover:bg-[#24b47e] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                        >
                          From Library
                        </button>
                      </div>
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-[#3ecf8e] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Slug</label>
                  <input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Category</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Description</label>
                <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Tags (Comma separated)</label>
                <input type="text" placeholder="e.g. FLUTTER, MOBILE, TECH" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e]" />
              </div>
           </div>
           <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Author</label>
                  <input type="text" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Date</label>
                  <input type="text" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e]" />
                </div>
              </div>
              <div className="pt-4 border-t border-[#2e2e2e] space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#3ecf8e]/60">SEO Configuration</p>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Meta Title</label>
                  <input type="text" value={formData.seo_title} onChange={(e) => setFormData({...formData, seo_title: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Meta Description</label>
                  <textarea rows={2} value={formData.seo_description} onChange={(e) => setFormData({...formData, seo_description: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">SEO Keywords</label>
                  <input type="text" placeholder="e.g. flutter 2026, mobile development, tech trends" value={formData.seo_keywords} onChange={(e) => setFormData({...formData, seo_keywords: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e]" />
                </div>
              </div>
           </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <UnifiedEditorLayout 
        title="Edit Article Content"
        subtitle={activeArticle?.title}
        content={textContent}
        onContentChange={setTextContent}
        onSave={handleSaveContent}
        onBack={() => setView('list')}
        isSaving={isSaving}
        modeLabel="ARTICLE EDITOR MODE"
        onImageUpload={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e: any) => handleImageUpload(e);
          input.click();
        }}
      />
      <MediaLibraryModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => {
          setFormData(prev => ({ ...prev, img: url }));
          setIsMediaModalOpen(false);
        }}
        title="Select Featured Image"
      />
    </>
  );
}
