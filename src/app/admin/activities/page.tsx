"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users, 
  Heart, 
  ChevronLeft, 
  Save,
  Clock,
  X,
  MapPin
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { compressToWebP } from '@/lib/image';
import { cn, purgeSystemCache } from '@/lib/utils';
import { organizationData as staticOrg, volunteerData as staticVolunteer } from '@/data/experience';
import DeleteModal from '@/components/Admin/DeleteModal';
import UnifiedEditorLayout from '@/components/UnifiedEditorLayout';

export default function AdminActivities() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-[#707070]">Loading Activities...</div>}>
      <AdminActivitiesContent />
    </Suspense>
  );
}

function AdminActivitiesContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'organizations' | 'volunteering'>('organizations');
  
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'organizations' || type === 'volunteering') {
      setActiveTab(type);
    }
  }, [searchParams]);

  const [view, setView] = useState<'list' | 'edit'>('list');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '', company: '', timeline: '', description: '', location: ''
  });
  const [hasFetched, setHasFetched] = useState(false);

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: orgData } = await supabase.from('organizations').select('*').order('created_at', { ascending: false });
      const { data: volData } = await supabase.from('volunteers').select('*').order('created_at', { ascending: false });
      
      setOrgs(orgData || []);
      setVolunteers(volData || []);
      setHasFetched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || item.role || '',
      company: item.company || '',
      timeline: item.timeline || item.year || '',
      description: item.description || item.desc || '',
      location: item.location || ''
    });
    setView('edit');
  };

  const confirmDelete = (item: any) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const table = activeTab === 'volunteering' ? 'volunteers' : 'organizations';
    try {
      const { error } = await supabase.from(table).delete().eq('id', itemToDelete.id);
      if (error) throw error;
      await purgeSystemCache();
      if (activeTab === 'organizations') setOrgs(prev => prev.filter(o => o.id !== itemToDelete.id));
      else setVolunteers(prev => prev.filter(v => v.id !== itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      alert('Title is required');
      return;
    }
    
    setIsSaving(true);
    const table = activeTab === 'volunteering' ? 'volunteers' : 'organizations';
    const payload = {
      title: formData.title,
      company: formData.company,
      timeline: formData.timeline,
      description: formData.description,
      location: formData.location
    };

    try {
      let result;
      if (editingId) {
        result = await supabase.from(table).update(payload).eq('id', editingId).select();
      } else {
        result = await supabase.from(table).insert([payload]).select();
      }
      
      if (result.error) throw result.error;
      
      await purgeSystemCache();
      await fetchData(); // Refresh data
      setView('list');
      setEditingId(null);
    } catch (err: any) {
      console.error('Save error:', err);
      alert('Error saving data: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const currentData = activeTab === 'organizations' ? orgs : volunteers;
  const isUsingStatic = hasFetched && currentData.length === 0; 
  // Standardized: If DB is empty, we show empty (no more auto-fallback to static to avoid confusion)
  const displayData = currentData;

  if (view === 'edit') {
    return (
      <UnifiedEditorLayout 
        title={`${editingId ? 'Edit' : 'Create'} ${activeTab === 'organizations' ? 'Organization' : 'Volunteer'} Role`}
        subtitle={formData.company}
        content={formData.description}
        onContentChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
        onSave={handleSave}
        onBack={() => setView('list')}
        isSaving={isSaving}
        modeLabel="ACTIVITY EDITOR"
        onImageUpload={() => {
           // Standard image upload if needed
           const input = document.createElement('input');
           input.type = 'file';
           input.accept = 'image/*';
           input.onchange = async (e: any) => {
             const file = e.target.files?.[0];
             if (!file) return;
             try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const { data, error } = await supabase.storage.from('portfolio-assets').upload(fileName, file);
                if (error) throw error;
                const cleanProxyUrl = `/api/assets/${fileName}`;
                setFormData(prev => ({ ...prev, description: prev.description + `<img src="${cleanProxyUrl}" alt="Activity Image" />` }));
             } catch (err: any) { alert(err.message); }
           };
           input.click();
        }}
        topContent={
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">Role Title</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
                placeholder="e.g. Public Relations Member"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">Organization / Project</label>
              <input 
                type="text" 
                value={formData.company} 
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
                placeholder="e.g. GDGOC Unhas"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">Timeline</label>
              <input 
                type="text" 
                value={formData.timeline} 
                onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
                placeholder="e.g. 2025 — Present"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#707070]">Location (Optional)</label>
              <input 
                type="text" 
                value={formData.location} 
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md px-3 py-2 text-[13px] text-[#ededed] focus:outline-none focus:border-[#3ecf8e] transition-all"
                placeholder="e.g. Remote / Campus"
              />
            </div>
          </div>
        }
      />
    );
  }

  return (
    <div data-lenis-prevent className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="text-xl font-medium text-[#ededed]">Activities & Volunteering</h1>
          <p className="text-[13px] text-[#707070]">Manage your organizational and community involvement.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', company: '', timeline: '', description: '', location: '' });
            setView('edit');
          }}
          className="bg-[#3ecf8e] text-[#171717] px-3 py-1.5 rounded-md text-[13px] font-medium hover:bg-[#24b47e] transition-all flex items-center gap-2"
        >
          <Plus size={14} /> New Activity
        </button>
      </header>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayData.map((item: any, i: number) => (
          <div key={item.id || i} className="group relative bg-[#1c1c1c] border border-[#2e2e2e] rounded-md p-5 hover:border-[#3e3e3e] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-[#252525] rounded-md flex items-center justify-center text-[#3ecf8e] border border-[#2e2e2e]">
                {activeTab === 'organizations' ? <Users size={18} /> : <Heart size={18} />}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(item)} className="p-1.5 bg-[#252525] text-[#9a9a9a] rounded hover:text-white border border-[#2e2e2e] transition-all"><Edit2 size={12} /></button>
                <button onClick={() => confirmDelete(item)} className="p-1.5 bg-[#252525] text-[#9a9a9a] rounded hover:text-[#ff2201] border border-[#2e2e2e] transition-all"><Trash2 size={12} /></button>
              </div>
            </div>
            
            <div className="space-y-1 mb-4">
              <h3 className="text-[15px] font-medium text-[#ededed]">{item.role || item.title}</h3>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#3ecf8e]">{item.company}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-[11px] text-[#707070] mb-4">
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                <span>{item.year || item.timeline}</span>
              </div>
              {item.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} />
                  <span>{item.location}</span>
                </div>
              )}
            </div>

            <div 
              className="text-[13px] text-[#9a9a9a] line-clamp-3 leading-relaxed prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: item.desc || item.description }}
            />
          </div>
        ))}
      </div>

      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${activeTab === 'organizations' ? 'Organization' : 'Volunteering'}`}
        itemName={itemToDelete?.role || itemToDelete?.title || 'this item'}
      />
    </div>
  );
}
