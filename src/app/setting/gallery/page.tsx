'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { purgeSystemCache } from '@/lib/utils';
import { encodeGalleryMeta, parseGalleryMeta } from '@/lib/galleryMeta';
import {
  Trash2,
  Plus,
  Image as ImageIcon,
  Loader2,
  Pencil,
  X,
  Save,
  Upload,
  ArrowUp,
  ArrowDown,
  Layers,
} from 'lucide-react';
import MediaLibraryModal from '@/components/Admin/MediaLibraryModal';

interface EditingPhotoState {
  id: string;
  image_url: string;
  hasTitleColumn: boolean;
  title: string;
  tagsText: string;
  narrative: string;
  extraImages: string[];
}

export default function AdminGallery() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingExtra, setIsUploadingExtra] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'new-theme' | 'extra-image'>(
    'new-theme'
  );
  const [editing, setEditing] = useState<EditingPhotoState | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPhotos(data);
  };

  const uploadSingleOriginalFile = async (file: File): Promise<string> => {
    // Preserve 100% original photography quality — never compress gallery photos to WebP
    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    return `/api/assets/${filePath}`;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const cleanProxyUrl = await uploadSingleOriginalFile(file);
        return supabase.from('gallery').insert([{ image_url: cleanProxyUrl }]);
      });

      await Promise.all(uploadPromises);
      await purgeSystemCache();
      fetchPhotos();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleUploadExtraImages = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editing) return;

    setIsUploadingExtra(true);
    try {
      const uploadedUrls = await Promise.all(
        Array.from(files).map((file) => uploadSingleOriginalFile(file))
      );
      setEditing((prev) =>
        prev
          ? {
              ...prev,
              extraImages: [...prev.extraImages, ...uploadedUrls],
            }
          : null
      );
    } catch (err: any) {
      alert('Gagal upload foto tambahan: ' + err.message);
    } finally {
      setIsUploadingExtra(false);
      e.target.value = '';
    }
  };

  const handleSelectFromLibrary = async (url: string) => {
    if (mediaTarget === 'extra-image' && editing) {
      setEditing((prev) =>
        prev
          ? {
              ...prev,
              extraImages: prev.extraImages.includes(url)
                ? prev.extraImages
                : [...prev.extraImages, url],
            }
          : null
      );
      setIsMediaModalOpen(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('gallery')
        .insert([{ image_url: url }]);
      if (error) throw error;
      await purgeSystemCache();
      fetchPhotos();
      setIsMediaModalOpen(false);
    } catch (err: any) {
      alert('Error adding from library: ' + err.message);
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Hapus tema foto ini dari galeri?')) return;

    try {
      const path = url.split('/').pop();
      if (path && url.includes('portfolio-assets')) {
        await supabase.storage
          .from('portfolio-assets')
          .remove([`gallery/${path}`]);
      }
      await supabase.from('gallery').delete().eq('id', id);
      await purgeSystemCache();
      fetchPhotos();
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    }
  };

  const openEditor = (photo: any, index: number) => {
    const meta = parseGalleryMeta(photo.title, photo.caption, index);
    setEditing({
      id: photo.id,
      image_url: photo.image_url,
      hasTitleColumn: Object.prototype.hasOwnProperty.call(photo, 'title'),
      title: meta.title,
      tagsText: meta.tags.join(', '),
      narrative: meta.narrative,
      extraImages: meta.images,
    });
  };

  const moveExtraImage = (idx: number, dir: -1 | 1) => {
    if (!editing) return;
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= editing.extraImages.length) return;
    const copy = [...editing.extraImages];
    [copy[idx], copy[nextIdx]] = [copy[nextIdx], copy[idx]];
    setEditing({ ...editing, extraImages: copy });
  };

  const removeExtraImage = (idx: number) => {
    if (!editing) return;
    setEditing({
      ...editing,
      extraImages: editing.extraImages.filter((_, i) => i !== idx),
    });
  };

  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    setIsSaving(true);
    try {
      const tags = editing.tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const encodedCaption = encodeGalleryMeta({
        title: editing.title,
        tags: tags.length > 0 ? tags : ['PHOTOGRAPHY'],
        narrative: editing.narrative,
        images: editing.extraImages,
      });

      const payload: Record<string, string> = {
        caption: encodedCaption,
      };
      if (editing.hasTitleColumn) {
        payload.title = editing.title.trim();
      }

      const { error } = await supabase
        .from('gallery')
        .update(payload)
        .eq('id', editing.id);

      if (error) throw error;

      await purgeSystemCache();
      await fetchPhotos();
      setEditing(null);
    } catch (err: any) {
      alert('Gagal menyimpan narasi & seri foto: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 text-[#ededed]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2e2e2e] py-4">
        <div className="space-y-1">
          <h1 className="text-xl font-medium text-[#ededed]">
            Photography (HQ)
          </h1>
          <p className="text-[13px] text-[#707070]">
            Kelola tema foto, judul, tag, narasi, dan multi-foto scrollable per
            tema untuk Creative Mode (/art).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-white/5 bg-[#2e2e2e] px-4 py-2 text-[13px] font-semibold text-[#ededed] transition-all hover:bg-[#3e3e3e]">
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {isUploading ? 'Uploading...' : 'Tambah Tema Foto'}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
              disabled={isUploading}
              multiple
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setMediaTarget('new-theme');
              setIsMediaModalOpen(true);
            }}
            className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md bg-[#3ecf8e] px-4 py-2 text-[13px] font-semibold text-[#171717] transition-all hover:bg-[#24b47e]"
          >
            Library
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo: any, index: number) => {
          const meta = parseGalleryMeta(photo.title, photo.caption, index);
          const totalFrames = 1 + meta.images.length;
          return (
            <div
              key={photo.id}
              className="group flex flex-col overflow-hidden rounded-md border border-[#2e2e2e] bg-[#1c1c1c]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#141414]">
                <img
                  src={photo.image_url}
                  alt={meta.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[10px] text-[#ededed]">
                  <Layers size={10} />
                  <span>{totalFrames} Foto</span>
                </div>
                <div className="absolute right-2 top-2">
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                      meta.isMock
                        ? 'border border-amber-500/30 bg-amber-500/20 text-amber-300'
                        : 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {meta.isMock ? 'Mock' : 'Saved'}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between gap-3 p-3">
                <div className="space-y-1">
                  <p className="truncate text-[13px] font-medium text-[#ededed]">
                    {meta.title}
                  </p>
                  <p className="line-clamp-2 text-[11.5px] leading-relaxed text-[#8b8b8b]">
                    {meta.narrative}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-[#2a2a2a] pt-2.5">
                  <button
                    type="button"
                    onClick={() => openEditor(photo, index)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-[#2a2a2a] px-2.5 py-1.5 text-[11.5px] font-medium text-[#ededed] transition-colors hover:bg-[#3a3a3a]"
                  >
                    <Pencil size={12} />
                    <span>Edit Tema &amp; Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id, photo.image_url)}
                    aria-label={`Hapus ${meta.title}`}
                    className="cursor-pointer rounded p-1.5 text-[#8b8b8b] transition-colors hover:bg-red-500/20 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {photos.length === 0 && !isUploading && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-md border border-dashed border-[#2e2e2e] py-20 text-[#707070]">
            <ImageIcon size={32} className="mb-4 opacity-20" />
            <p className="text-[13px] font-medium uppercase tracking-widest opacity-40">
              Gallery is empty
            </p>
          </div>
        )}
      </div>

      {/* Edit Judul, Tag, Narasi & Multi-Foto per Tema Modal */}
      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit tema, narasi, dan seri foto"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-[#2e2e2e] bg-[#161616] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2e2e2e] px-5 py-3.5">
              <h2 className="text-[14px] font-medium text-[#ededed]">
                Edit Tema, Narasi &amp; Seri Foto ({1 + editing.extraImages.length}{' '}
                Foto)
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Tutup modal"
                className="cursor-pointer rounded p-1 text-[#8b8b8b] hover:bg-[#2a2a2a] hover:text-[#ededed]"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleSaveMeta}
              className="flex-1 space-y-5 overflow-y-auto p-5"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[190px_1fr]">
                <div className="space-y-1.5">
                  <div className="aspect-[16/10] w-full overflow-hidden rounded border border-[#2e2e2e] bg-[#101010]">
                    <img
                      src={editing.image_url}
                      alt={editing.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#707070]">
                    Cover Utama (Frame 01)
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[11.5px] font-medium uppercase tracking-wider text-[#9a9a9a]">
                      Judul Tema / Karya
                    </label>
                    <input
                      type="text"
                      value={editing.title}
                      onChange={(e) =>
                        setEditing({ ...editing, title: e.target.value })
                      }
                      placeholder="Contoh: Makassar Golden Hour Study"
                      required
                      className="w-full rounded border border-[#2e2e2e] bg-[#101010] px-3 py-2 text-[13px] text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11.5px] font-medium uppercase tracking-wider text-[#9a9a9a]">
                      Tag (pisahkan dengan koma)
                    </label>
                    <input
                      type="text"
                      value={editing.tagsText}
                      onChange={(e) =>
                        setEditing({ ...editing, tagsText: e.target.value })
                      }
                      placeholder="PHOTOGRAPHY, DOCUMENTARY"
                      className="w-full rounded border border-[#2e2e2e] bg-[#101010] px-3 py-2 text-[12.5px] uppercase text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-medium uppercase tracking-wider text-[#9a9a9a]">
                  Narasi / Cerita Tema
                </label>
                <textarea
                  rows={5}
                  value={editing.narrative}
                  onChange={(e) =>
                    setEditing({ ...editing, narrative: e.target.value })
                  }
                  placeholder="Tulis konteks, cerita di balik seri foto ini..."
                  className="w-full rounded border border-[#2e2e2e] bg-[#101010] px-3 py-2 text-[13px] leading-relaxed text-[#ededed] focus:border-[#f59e0b] focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-[#707070]">
                  Gunakan baris kosong (Enter 2x) untuk memisahkan paragraf di
                  panel kiri `/art`.
                </p>
              </div>

              {/* Multi-Photo Upload per Theme (Scrollable Series) */}
              <div className="space-y-3 rounded-md border border-[#2a2a2a] bg-[#121212] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-[12px] font-medium uppercase tracking-wider text-[#ededed]">
                      Foto Tambahan dalam Tema Ini (Scroll ke Bawah)
                    </h3>
                    <p className="text-[11px] text-[#707070]">
                      Tambahkan beberapa foto agar pengunjung bisa scroll
                      rangkaian gambar full-width di sisi kanan.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-[#2a2a2a] px-3 py-1.5 text-[11.5px] font-medium text-[#ededed] transition-colors hover:bg-[#3a3a3a]">
                      {isUploadingExtra ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Upload size={13} />
                      )}
                      <span>
                        {isUploadingExtra ? 'Uploading...' : 'Upload Multi-Foto'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        disabled={isUploadingExtra}
                        onChange={handleUploadExtraImages}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaTarget('extra-image');
                        setIsMediaModalOpen(true);
                      }}
                      className="cursor-pointer rounded border border-[#2e2e2e] px-3 py-1.5 text-[11.5px] text-[#c0c0c0] transition-colors hover:bg-[#242424] hover:text-[#ededed]"
                    >
                      + Dari Library
                    </button>
                  </div>
                </div>

                {editing.extraImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {editing.extraImages.map((imgUrl, idx) => (
                      <div
                        key={`${imgUrl}-${idx}`}
                        className="group relative overflow-hidden rounded border border-[#2e2e2e] bg-[#181818]"
                      >
                        <div className="aspect-[16/10] w-full overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={`Extra frame ${idx + 2}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between px-2 py-1.5 font-mono text-[10px] text-[#8b8b8b]">
                          <span>Frame {String(idx + 2).padStart(2, '0')}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveExtraImage(idx, -1)}
                              disabled={idx === 0}
                              aria-label="Geser naik"
                              className="cursor-pointer rounded p-0.5 hover:bg-[#2a2a2a] hover:text-[#ededed] disabled:opacity-30"
                            >
                              <ArrowUp size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveExtraImage(idx, 1)}
                              disabled={idx === editing.extraImages.length - 1}
                              aria-label="Geser turun"
                              className="cursor-pointer rounded p-0.5 hover:bg-[#2a2a2a] hover:text-[#ededed] disabled:opacity-30"
                            >
                              <ArrowDown size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeExtraImage(idx)}
                              aria-label="Hapus frame"
                              className="cursor-pointer rounded p-0.5 text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-3 text-center font-mono text-[11px] text-[#666666]">
                    Belum ada foto tambahan. Upload 2-5 foto untuk membuat seri
                    scrollable.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#2e2e2e] pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="cursor-pointer rounded border border-[#2e2e2e] px-4 py-2 text-[12.5px] text-[#a0a0a0] hover:bg-[#242424] hover:text-[#ededed]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploadingExtra}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-[#f59e0b] px-4 py-2 text-[12.5px] font-semibold text-[#111111] transition-colors hover:bg-[#fbbf24] disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Tema'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleSelectFromLibrary}
        title={
          mediaTarget === 'extra-image'
            ? 'Pilih Foto Tambahan untuk Tema Ini'
            : 'Select Gallery Images'
        }
      />
    </div>
  );
}
