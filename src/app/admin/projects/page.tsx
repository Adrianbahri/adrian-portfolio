'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, FolderKanban, Link2, Globe, FileEdit, X, Image as ImageIcon, Type, Save, ChevronLeft, LayoutGrid, ScrollText, PlusCircle } from 'lucide-react';
import { projects as staticProjects } from '@/data/projects';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function AdminProjects() {
  const [view, setView] = useState<'list' | 'metadata' | 'case-study'>('list');
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  
  const [csContent, setCsContent] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [activeProject, setActiveProject] = useState<any>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState({
    title: '', slug: '', category: '', status: '', mode: 'developer',
    role: '', timeline: '', published: '', githubUrl: '', demoUrl: '', companyUrl: '',
    stack: '', highlights: '', description: ''
  });

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (data) setDbProjects(data);
  };

  useEffect(() => { fetchProjects(); setLoading(false); }, []);

  const handleEditMetadata = (project: any) => {
    setEditingId(project.id);
    setActiveProject(project);
    setFormData({
      title: project.title || '', slug: project.slug || '', category: project.category || '', status: project.status || '', mode: project.mode || 'developer',
      role: project.content?.role || '', timeline: project.year_range || project.content?.timeline || '', published: project.content?.published || '',
      githubUrl: project.github_url || '', demoUrl: project.demo_url || '', companyUrl: project.company_url || '',
      stack: Array.isArray(project.tags) ? project.tags.join(', ') : '',
      highlights: Array.isArray(project.content?.highlights) ? project.content.highlights.join('\n') : '',
      description: project.description || ''
    });
    setView('metadata');
  };

  const handleOpenCaseStudy = (project: any) => {
    setActiveProject(project);
    setCsContent(project.content?.markdown || '');
    setGallery(project.content?.gallery || []);
    setView('case-study');
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const projectData = {
      title: formData.title, slug: formData.slug, category: formData.category, status: formData.status, mode: formData.mode,
      year_range: formData.timeline, description: formData.description, github_url: formData.githubUrl, demo_url: formData.demoUrl, company_url: formData.companyUrl,
      seo_title: activeProject?.seo_title || '',
      seo_description: activeProject?.seo_description || '',
      tags: formData.stack.split(',').map(s => s.trim()).filter(Boolean),
      content: {
        ...(editingId ? activeProject?.content : {}),
        role: formData.role, timeline: formData.timeline, published: formData.published,
        highlights: formData.highlights.split('\n').map(h => h.trim()).filter(Boolean)
      }
    };
    try {
      if (editingId) { await supabase.from('projects').update(projectData).eq('id', editingId); }
      else { await supabase.from('projects').insert([projectData]); }
      setView('list');
      setEditingId(null);
      fetchProjects();
    } catch (err: any) { alert('Error: ' + err.message); }
    finally { setIsSaving(false); }
  };

  const handleSaveCaseStudy = async () => {
    setIsSaving(true);
    try {
      const currentContent = activeProject?.content || {};
      const updateData = activeProject.mode === 'creative' 
        ? { content: { ...currentContent, gallery, markdown: csContent } }
        : { content: { ...currentContent, markdown: csContent } };
        
      const { error } = await supabase.from('projects').update(updateData).eq('id', activeProject.id);
      if (error) throw error;
      setView('list');
      fetchProjects();
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
    setCsContent(newText);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + 3, start + 3); }, 10);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('portfolio-assets').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('portfolio-assets').getPublicUrl(fileName);
      
      if (isGallery) {
        setGallery(prev => [...prev, publicUrl]);
      } else {
        setCsContent((prev) => prev + `\n\n![Image](${publicUrl})\n\n`);
      }
    } catch (err: any) { alert('Upload failed: ' + err.message); }
    finally { setIsUploading(false); }
  };

  const removeGalleryImage = (idx: number) => {
    setGallery(prev => prev.filter((_, i) => i !== idx));
  };

  const allProjects = dbProjects.length > 0 ? dbProjects : staticProjects;

  if (view === 'list') {
    return (
      <div className="space-y-12 pb-20 animate-in fade-in duration-500">
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-heading font-medium tracking-tight">Manage <span className="text-primary italic">Projects</span></h1>
            <p className="text-white/40">Portfolio command center.</p>
          </div>
          <button onClick={() => { setEditingId(null); setFormData({ title: '', slug: '', category: '', status: '', mode: 'developer', role: '', timeline: '', published: '', githubUrl: '', demoUrl: '', companyUrl: '', stack: '', highlights: '', description: '' }); setView('metadata'); }} className="flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
            <Plus size={16} /> New Project
          </button>
        </header>
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/40">Mode</th>
                <th className="px-8 py-5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/40">Project</th>
                <th className="px-8 py-5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allProjects.map((project, i) => (
                <tr key={project.id || i} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[0.5rem] font-bold uppercase tracking-widest border",
                      project.mode === 'creative' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    )}>
                      {project.mode || 'Dev'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-primary/40"><FolderKanban size={20} /></div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-white group-hover:text-primary transition-colors">{project.title}</p>
                        <p className="text-[0.65rem] text-white/30 font-mono">/{project.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenCaseStudy(project)} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-black transition-all shadow-sm" title="Edit Case Study"><FileEdit size={16} /></button>
                      <button onClick={() => handleEditMetadata(project)} className="p-2 text-white/20 hover:text-white transition-colors" title="Edit Metadata"><Edit2 size={16} /></button>
                      <button className="p-2 text-white/20 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
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
            <button onClick={() => setView('list')} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all"><ChevronLeft size={24} /></button>
            <h2 className="text-3xl font-heading font-medium italic">Project <span className="text-primary">Metadata</span></h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white">Cancel</button>
            <button onClick={handleSaveMetadata} disabled={isSaving} className="bg-primary text-black px-12 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">{isSaving ? 'Saving...' : 'Save Metadata'}</button>
          </div>
        </header>
        <form onSubmit={handleSaveMetadata} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[0.6rem] font-bold uppercase tracking-widest text-white/20 ml-2">Core Info</p>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Title" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} placeholder="Slug" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 outline-none transition-all" />
                <select value={formData.mode} onChange={(e) => setFormData({...formData, mode: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 outline-none transition-all">
                  <option value="developer">Developer Mode</option>
                  <option value="creative">Creative Mode</option>
                </select>
              </div>
              <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Short Description" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 outline-none transition-all" />
           </div>
           <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[0.6rem] font-bold uppercase tracking-widest text-white/20 ml-2">Timeline & Stack</p>
                <input type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} placeholder="Role" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={formData.timeline} onChange={(e) => setFormData({...formData, timeline: e.target.value})} placeholder="Timeline (e.g. 2025)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm" />
                <input type="text" value={formData.published} onChange={(e) => setFormData({...formData, published: e.target.value})} placeholder="Published Date" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm" />
              </div>
              <textarea rows={2} value={formData.stack} onChange={(e) => setFormData({...formData, stack: e.target.value})} placeholder="Tech Stack (comma separated)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm uppercase font-bold tracking-widest focus:border-primary/50 outline-none" />
              
              <div className="pt-6 border-t border-white/5 space-y-4">
                <p className="text-[0.6rem] font-bold uppercase tracking-widest text-primary/40 ml-2">Search Engine Optimization (SEO)</p>
                <input 
                  type="text" 
                  value={activeProject?.seo_title || ''} 
                  onChange={(e) => setActiveProject({...activeProject, seo_title: e.target.value})}
                  placeholder="Meta Title" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 outline-none" 
                />
                <textarea 
                  rows={2} 
                  value={activeProject?.seo_description || ''} 
                  onChange={(e) => setActiveProject({...activeProject, seo_description: e.target.value})}
                  placeholder="Meta Description" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-primary/50 outline-none" 
                />
              </div>
           </div>
        </form>
      </div>
    );
  }

  // --- DIFFERENTIATED EDITORS ---
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex items-center justify-between border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <button onClick={() => setView('list')} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all"><ChevronLeft size={24} /></button>
          <div>
            <h2 className="text-3xl font-heading font-medium italic">
              {activeProject?.mode === 'creative' ? 'Creative' : 'Developer'} <span className="text-primary">Studio</span>
            </h2>
            <p className="text-[0.65rem] text-white/30 font-bold uppercase tracking-[0.2em] mt-1">{activeProject?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <button onClick={handleSaveCaseStudy} disabled={isSaving} className="bg-primary text-black px-12 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
             {isSaving ? 'Syncing...' : 'Save Changes'}
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12">
        {activeProject?.mode === 'creative' ? (
          /* --- CREATIVE EDITOR: Visual & Gallery Focused --- */
          <div className="space-y-12 animate-in fade-in duration-700">
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LayoutGrid className="text-primary" size={20} />
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Visual Gallery</h3>
                </div>
                <label className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl cursor-pointer hover:bg-primary hover:text-black transition-all">
                  <PlusCircle size={16} />
                  <span className="text-[0.6rem] font-bold uppercase tracking-widest">Add Media</span>
                  <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, true)} accept="image/*" />
                </label>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((img, idx) => (
                  <div key={idx} className="group relative aspect-square bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Gallery item" />
                    <button onClick={() => removeGalleryImage(idx)} className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {gallery.length === 0 && (
                  <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
                    <p className="text-white/10 font-bold uppercase tracking-widest text-[0.6rem]">No visual assets added yet.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <ScrollText className="text-primary" size={20} />
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Project Narrative</h3>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <textarea 
                  value={csContent}
                  onChange={(e) => setCsContent(e.target.value)}
                  className="w-full bg-transparent p-12 lg:p-16 text-xl font-sans font-light leading-relaxed text-white focus:outline-none resize-none min-h-[40vh]"
                  placeholder="Tell the story behind this creation..."
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
              </div>
            </section>
          </div>
        ) : (
          /* --- DEVELOPER EDITOR: Technical & Documentation Focused --- */
          <div className="animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ScrollText className="text-primary" size={20} />
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Documentation (Markdown)</h3>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                <button onClick={insertHeading} className="p-2 hover:bg-white/10 rounded-lg text-white/60" title="Add Sub-heading"><Type size={18} /></button>
                <label className="p-2 hover:bg-white/10 rounded-lg text-white/60 cursor-pointer" title="Add Image to Content">
                  <ImageIcon size={18} />
                  <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, false)} accept="image/*" />
                </label>
              </div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
              <textarea 
                ref={editorRef}
                value={csContent}
                onChange={(e) => setCsContent(e.target.value)}
                className="w-full bg-transparent p-12 lg:p-20 text-xl font-mono leading-relaxed text-white focus:outline-none resize-none min-h-[60vh]"
                placeholder="Write technical documentation, architecture, and problem solving..."
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
