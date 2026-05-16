'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  FolderKanban, 
  Link2, 
  Globe, 
  FileEdit, 
  X, 
  Save, 
  ChevronLeft, 
  LayoutGrid, 
  ScrollText, 
  PlusCircle, 
  FileText 
} from 'lucide-react';
import Editor from '@/components/Editor';
import UnifiedEditorLayout from '@/components/UnifiedEditorLayout';
import { projects as staticProjects } from '@/data/projects';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import DeleteModal from '@/components/Admin/DeleteModal';

export default function AdminProjects() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-[#707070]">Loading Studio...</div>}>
      <AdminProjectsContent />
    </Suspense>
  );
}

function AdminProjectsContent() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<'list' | 'metadata' | 'case-study'>('list');
  const [listFilter, setListFilter] = useState<string>('all');
  
  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type) {
      setListFilter(type);
    } else {
      setListFilter('all');
    }
  }, [searchParams]);
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  
  const [csContent, setCsContent] = useState('');
  const [gallery, setGallery] = useState<{url: string, type: 'image' | 'video', caption?: string}[]>([]);
  const [activeProject, setActiveProject] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '', slug: '', category: '', status: '', mode: 'developer',
    role: '', timeline: '', published: '', githubUrl: '', demoUrl: '', companyUrl: '',
    stack: '', highlights: '', description: '', imageUrl: '', isFavorite: false
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
      title: project.title || '', 
      slug: project.slug || '', 
      category: project.category || '', 
      status: project.status || '', 
      mode: project.mode || 'developer',
      role: project.content?.role || '', 
      timeline: project.year_range || project.content?.timeline || '', 
      published: project.content?.published || '',
      githubUrl: project.github_url || '', 
      demoUrl: project.demo_url || '', 
      companyUrl: project.company_url || '',
      stack: Array.isArray(project.tags) ? project.tags.join(', ') : '',
      highlights: Array.isArray(project.content?.highlights) ? project.content.highlights.join('\n') : '',
      description: project.description || '',
      imageUrl: project.image_url || project.img_url || '',
      isFavorite: project.is_favorite || false
    });
    setView('metadata');
  };

  const handleOpenCaseStudy = (project: any) => {
    setActiveProject(project);
    setCsContent(project.content?.markdown || '');
    // Ensure gallery items are objects
    const rawGallery = project.content?.gallery || [];
    const formattedGallery = rawGallery.map((item: any) => 
      typeof item === 'string' ? { url: item, type: 'image', caption: '' } : item
    );
    setGallery(formattedGallery);
    setView('case-study');
  };

  const confirmDelete = (project: any) => {
    setItemToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!itemToDelete) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', itemToDelete.id);
      if (error) throw error;
      setDbProjects(prev => prev.filter(p => p.id !== itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) { alert('Error: ' + err.message); }
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const projectData = {
      title: formData.title, 
      slug: formData.slug, 
      category: formData.category, 
      status: formData.status, 
      mode: formData.mode,
      year_range: formData.timeline, 
      description: formData.description, 
      github_url: formData.githubUrl, 
      demo_url: formData.demoUrl, 
      company_url: formData.companyUrl,
      image_url: formData.imageUrl || '', // New standard
      is_favorite: formData.isFavorite,
      seo_title: activeProject?.seo_title || '',
      seo_description: activeProject?.seo_description || '',
      seo_keywords: activeProject?.seo_keywords || '',
      tags: formData.stack.split(',').map(s => s.trim()).filter(Boolean),
      content: {
        ...(editingId ? activeProject?.content : {}),
        role: formData.role, 
        timeline: formData.timeline, 
        published: formData.published,
        highlights: formData.highlights.split('\n').map(h => h.trim()).filter(Boolean)
      }
    };
    try {
      let result;
      if (editingId) {
        result = await supabase.from('projects').update(projectData).eq('id', editingId).select();
      } else {
        result = await supabase.from('projects').insert([projectData]).select();
      }

      if (result.error) throw result.error;

      if (!result.data || result.data.length === 0) {
        alert('Warning: Update successful but no rows changed. Check RLS policies for "projects" table.');
      } else {
        await fetchProjects();
        alert('Project successfully saved!');
        setView('list');
        setEditingId(null);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
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
        setGallery(prev => [...prev, { url: publicUrl, type: 'image', caption: '' }]);
      } else {
        setCsContent((prev) => prev + `<img src="${publicUrl}" alt="Project image" />`);
      }
    } catch (err: any) { alert('Upload failed: ' + err.message); }
    finally { setIsUploading(false); }
  };

  const addVideoLink = () => {
    const url = prompt('Enter Video URL (YouTube or Direct link):');
    if (url) {
      setGallery(prev => [...prev, { url, type: 'video', caption: '' }]);
    }
  };

  const updateMediaCaption = (idx: number, caption: string) => {
    setGallery(prev => prev.map((item, i) => i === idx ? { ...item, caption } : item));
  };

  const removeGalleryImage = (idx: number) => {
    setGallery(prev => prev.filter((_, i) => i !== idx));
  };

  const rawProjects = dbProjects;
  const filteredProjects = rawProjects.filter((p: any) => {
    if (listFilter === 'all') return true;
    return p.mode === listFilter || p.category?.toLowerCase() === listFilter.toLowerCase();
  });

  if (view === 'list') {
    return (
      <div data-lenis-prevent className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
        <header className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-xl font-medium text-[#ededed]">Projects</h1>
            <p className="text-[13px] text-[#707070]">Manage and showcase your technical and creative work.</p>
          </div>
          <button 
            onClick={() => { setEditingId(null); setFormData({ title: '', slug: '', category: 'Technical', status: 'Completed', mode: 'developer', role: '', timeline: '', published: '', githubUrl: '', demoUrl: '', companyUrl: '', stack: '', highlights: '', description: '', imageUrl: '', isFavorite: false }); setView('metadata'); }} 
            className="bg-[#3ecf8e] text-[#171717] px-3 py-1.5 rounded-md text-[13px] font-medium hover:bg-[#24b47e] transition-all shadow-sm"
          >
            New Project
          </button>
        </header>


        <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-md overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2e2e2e] bg-[#202020]">
                <th className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#707070]">Project</th>
                <th className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#707070]">Category</th>
                <th className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#707070]">Status</th>
                <th className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#707070] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2e2e]">
              {filteredProjects.map((project, i) => (
                <tr key={project.id || i} className="group hover:bg-[#232323] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-[#2e2e2e] flex items-center justify-center text-[#3ecf8e] border border-[#3e3e3e]">
                        {project.mode === 'creative' ? <LayoutGrid size={12} /> : <ScrollText size={12} />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-[#ededed] group-hover:text-[#3ecf8e] transition-colors truncate max-w-[250px]">{project.title}</span>
                          {project.is_favorite && (
                            <span className="p-0.5 bg-[#3ecf8e]/10 text-[#3ecf8e] rounded border border-[#3ecf8e]/20" title="Featured">
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-[#707070]">/{project.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2e2e2e] text-[#9a9a9a] border border-[#3e3e3e]">
                      {project.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1 h-1 rounded-full",
                        project.status === 'Completed' || project.status === 'FINISHED' ? "bg-[#3ecf8e]" : "bg-[#ffdb13]"
                      )} />
                      <span className="text-[12px] text-[#9a9a9a] font-medium">{project.status}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenCaseStudy(project)} className="p-1.5 bg-[#252525] text-[#9a9a9a] rounded hover:text-[#3ecf8e] border border-[#2e2e2e] transition-all"><FileEdit size={12} /></button>
                      <button onClick={() => handleEditMetadata(project)} className="p-1.5 bg-[#252525] text-[#9a9a9a] rounded hover:text-white border border-[#2e2e2e] transition-all"><Edit2 size={12} /></button>
                      <button onClick={() => confirmDelete(project)} className="p-1.5 bg-[#252525] text-[#9a9a9a] rounded hover:text-[#ff2201] border border-[#2e2e2e] transition-all"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-[#707070] text-[13px]">
                    No projects found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <DeleteModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteProject}
          title="Delete Project"
          itemName={itemToDelete?.title || 'this project'}
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
            <h2 className="text-xl font-medium text-[#ededed]">Project Metadata</h2>
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
            <div className="space-y-6">
              {/* Thumbnail Upload Section */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Project Thumbnail</label>
                <div className="relative group/thumb aspect-video rounded-xl bg-[#1c1c1c] border border-[#2e2e2e] overflow-hidden flex flex-col items-center justify-center transition-all hover:border-[#3ecf8e]/30">
                  {formData.imageUrl ? (
                    <>
                      <img src={formData.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <label className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-[#3ecf8e] transition-all">
                          Change
                          <input type="file" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setIsUploading(true);
                            try {
                              const fileExt = file.name.split('.').pop();
                              const fileName = `${Math.random()}.${fileExt}`;
                              const { data, error } = await supabase.storage.from('portfolio-assets').upload(fileName, file);
                              if (error) throw error;
                              const { data: { publicUrl } } = supabase.storage.from('portfolio-assets').getPublicUrl(fileName);
                              setFormData({...formData, imageUrl: publicUrl});
                            } catch (err: any) { alert('Upload failed: ' + err.message); }
                            finally { setIsUploading(false); }
                          }} accept="image/*" />
                        </label>
                        <button onClick={() => setFormData({...formData, imageUrl: ''})} className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all">
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <PlusCircle size={32} className="text-[#3ecf8e] mb-2 opacity-40 group-hover/thumb:opacity-100 transition-all" />
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#707070] group-hover/thumb:text-[#3ecf8e] transition-all">Upload Thumbnail</p>
                      <input type="file" className="hidden" onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if (!file) return;
                         setIsUploading(true);
                         try {
                           const fileExt = file.name.split('.').pop();
                           const fileName = `${Math.random()}.${fileExt}`;
                           const { data, error } = await supabase.storage.from('portfolio-assets').upload(fileName, file);
                           if (error) throw error;
                           const { data: { publicUrl } } = supabase.storage.from('portfolio-assets').getPublicUrl(fileName);
                           setFormData({...formData, imageUrl: publicUrl});
                         } catch (err: any) { alert('Upload failed: ' + err.message); }
                         finally { setIsUploading(false); }
                      }} accept="image/*" />
                    </label>
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
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Mode</label>
                  <select value={formData.mode} onChange={(e) => setFormData({...formData, mode: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e]">
                    <option value="developer">Developer</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Description</label>
                <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] resize-none" />
              </div>
           </div>
           <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Role / Credits</label>
                  <input type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Timeline</label>
                  <input type="text" value={formData.timeline} onChange={(e) => setFormData({...formData, timeline: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e]" />
                </div>
              </div>
              
              {formData.mode === 'developer' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Tech Stack (Comma separated)</label>
                  <textarea rows={2} value={formData.stack} onChange={(e) => setFormData({...formData, stack: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] resize-none" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Live Demo URL</label>
                    <input type="text" value={formData.demoUrl} onChange={(e) => setFormData({...formData, demoUrl: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e]" />
                 </div>
                 {formData.mode === 'developer' && (
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">GitHub URL</label>
                      <input type="text" value={formData.githubUrl} onChange={(e) => setFormData({...formData, githubUrl: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e]" />
                   </div>
                 )}
              </div>

              {/* Favorite Toggle */}
              <div className="flex items-center gap-3 p-3 bg-[#1c1c1c] border border-[#2e2e2e] rounded-md">
                <input 
                  type="checkbox" 
                  id="isFavorite"
                  checked={formData.isFavorite}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                  className="w-4 h-4 rounded border-[#2e2e2e] bg-[#252525] text-[#3ecf8e] focus:ring-[#3ecf8e] transition-all"
                />
                <label htmlFor="isFavorite" className="text-[12px] font-medium text-[#ededed] cursor-pointer">
                  Pin to "Selected Works" (Featured on Landing Page)
                </label>
              </div>

              <div className="pt-4 border-t border-[#2e2e2e] space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#3ecf8e]/60">SEO Configuration</p>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Meta Title</label>
                  <input type="text" value={activeProject?.seo_title || ''} onChange={(e) => setActiveProject({...activeProject, seo_title: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Meta Description</label>
                  <textarea rows={2} value={activeProject?.seo_description || ''} onChange={(e) => setActiveProject({...activeProject, seo_description: e.target.value})} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[14px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] resize-none" />
                </div>
              </div>
           </div>
        </form>
      </div>
    );
  }

  return (
    <UnifiedEditorLayout
      title={activeProject?.mode === 'creative' ? 'Creative Studio' : 'Developer Studio'}
      subtitle={activeProject?.title}
      content={csContent}
      onContentChange={setCsContent}
      onSave={handleSaveCaseStudy}
      onBack={() => setView('list')}
      isSaving={isSaving}
      saveLabel="Sync Changes"
      modeLabel={activeProject?.mode === 'creative' ? 'STORYTELLING STUDIO' : 'TECHNICAL STUDIO'}
      onImageUpload={() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => handleImageUpload(e, false);
        input.click();
      }}
      topContent={activeProject?.mode === 'creative' ? (
        <section className="space-y-4 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid size={14} className="text-[#3ecf8e]" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">Media Assets Manager</h3>
            </div>
            <span className="text-[10px] text-[#707070]">{gallery.length} items</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1c1c1c] border-2 border-dashed border-[#2e2e2e] rounded-md p-8 flex flex-col items-center justify-center text-center hover:border-[#3ecf8e]/30 transition-all group">
              <div className="w-12 h-12 rounded-full bg-[#252525] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <PlusCircle size={24} className="text-[#3ecf8e]" />
              </div>
              <p className="text-[13px] font-medium text-[#ededed]">Upload Creative Assets</p>
              <div className="flex items-center gap-2 mt-4">
                <label className="bg-[#3ecf8e] text-[#171717] px-4 py-1.5 rounded-md text-[12px] font-medium hover:bg-[#24b47e] transition-all cursor-pointer">
                  Browse Files
                  <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, true)} accept="image/*" />
                </label>
                <button 
                  onClick={addVideoLink}
                  className="bg-[#2e2e2e] text-[#ededed] px-4 py-1.5 rounded-md text-[12px] font-medium hover:bg-[#3e3e3e] transition-all border border-[#3e3e3e]"
                >
                  Add Video Link
                </button>
              </div>
            </div>
            <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-md p-6 flex flex-col justify-center">
              <h4 className="text-[12px] font-medium text-[#ededed] mb-2">Creative Portfolio Tips</h4>
              <ul className="text-[11px] text-[#707070] space-y-2">
                <li className="flex gap-2"><span>•</span> Use high-resolution images for designs.</li>
                <li className="flex gap-2"><span>•</span> Add YouTube/Vimeo links for video edits.</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {gallery.map((item, idx) => (
              <div key={idx} className="group relative bg-[#1c1c1c] border border-[#2e2e2e] rounded-md overflow-hidden flex flex-col">
                <div className="relative aspect-video bg-black">
                  {item.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-[#252525]">
                       <Globe size={20} className="text-[#3ecf8e]" />
                    </div>
                  ) : (
                    <img src={item.url} className="w-full h-full object-cover" alt="Gallery" />
                  )}
                  <button onClick={() => removeGalleryImage(idx)} className="absolute top-1.5 right-1.5 p-1 bg-[#171717]/80 text-white rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-[#ff2201]"><X size={12} /></button>
                </div>
                <div className="p-2 bg-[#202020]">
                   <input 
                      type="text" 
                      placeholder="Add caption..." 
                      value={item.caption || ''} 
                      onChange={(e) => updateMediaCaption(idx, e.target.value)}
                      className="w-full bg-transparent border-none text-[11px] text-[#ededed] placeholder:text-[#555] focus:outline-none"
                   />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    />
  );
}
