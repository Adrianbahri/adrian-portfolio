'use client';

import { Save, ChevronLeft } from 'lucide-react';
import Editor from './Editor';

interface UnifiedEditorLayoutProps {
  title: string;
  subtitle?: string;
  content: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onBack: () => void;
  isSaving: boolean;
  onImageUpload: () => void;
  saveLabel?: string;
  modeLabel?: string;
  topContent?: React.ReactNode;
}

export default function UnifiedEditorLayout({
  title,
  subtitle,
  content,
  onContentChange,
  onSave,
  onBack,
  isSaving,
  onImageUpload,
  saveLabel = 'Save Changes',
  modeLabel = 'Professional Editor',
  topContent
}: UnifiedEditorLayoutProps) {
  return (
    <div className="flex-1 flex flex-col space-y-4 min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex items-center justify-between border-b border-[#2e2e2e] pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="w-8 h-8 bg-[#252525] rounded-md border border-[#2e2e2e] flex items-center justify-center text-[#707070] hover:text-[#ededed] transition-all hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-xl font-medium text-[#ededed] leading-tight">{title}</h2>
            {subtitle && <p className="text-[11px] text-[#707070] font-medium">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
            onClick={onSave} 
            disabled={isSaving} 
            className="bg-[#3ecf8e] text-[#171717] px-5 py-1.5 rounded-md text-[13px] font-medium hover:bg-[#24b47e] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(62,207,142,0.15)] hover:shadow-[0_0_25px_rgba(62,207,142,0.25)] disabled:opacity-50 active:scale-95"
           >
             {isSaving ? 'Processing...' : <><Save size={14} /> {saveLabel}</>}
           </button>
        </div>
      </header>

      <div data-lenis-prevent className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2 min-h-0">
        {topContent}
        
        <div className="flex-1 flex flex-col min-h-0">
          <Editor 
            content={content} 
            onChange={onContentChange}
            onImageUpload={onImageUpload}
          />
          <div className="mt-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-[#707070] flex items-center gap-1.5 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e] animate-pulse" />
                Real-time sync active
              </span>
              <span className="text-[10px] text-[#707070] font-medium">
                Words: {content.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(Boolean).length}
              </span>
            </div>
            <span className="text-[10px] text-[#3ecf8e]/60 uppercase tracking-[0.2em] font-bold">
              {modeLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
