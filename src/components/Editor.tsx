'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Markdown } from 'tiptap-markdown';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Undo,
  Redo,
  Type,
  Check,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: () => void;
}

const MenuBar = ({ editor, onImageUpload }: { editor: any, onImageUpload?: () => void }) => {
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  if (!editor) {
    return null;
  }

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setIsLinkInputOpen(false);
    setLinkUrl('');
  };

  const openLinkInput = () => {
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setIsLinkInputOpen(true);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-[#202020] border-b border-[#2e2e2e]">
      <div className="flex items-center gap-1 mr-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-[#2e2e2e] transition-colors ${editor.isActive('bold') ? 'text-[#3ecf8e] bg-[#2e2e2e]' : 'text-[#707070]'}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-[#2e2e2e] transition-colors ${editor.isActive('italic') ? 'text-[#3ecf8e] bg-[#2e2e2e]' : 'text-[#707070]'}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-[#2e2e2e] transition-colors ${editor.isActive('underline') ? 'text-[#3ecf8e] bg-[#2e2e2e]' : 'text-[#707070]'}`}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </button>
      </div>

      <div className="w-[1px] h-6 bg-[#2e2e2e] mx-1" />

      <div className="flex items-center gap-1 mx-2">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-[#2e2e2e] transition-colors ${editor.isActive('heading', { level: 1 }) ? 'text-[#3ecf8e] bg-[#2e2e2e]' : 'text-[#707070]'}`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-[#2e2e2e] transition-colors ${editor.isActive('heading', { level: 2 }) ? 'text-[#3ecf8e] bg-[#2e2e2e]' : 'text-[#707070]'}`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-[#2e2e2e] transition-colors ${editor.isActive('heading', { level: 3 }) ? 'text-[#3ecf8e] bg-[#2e2e2e]' : 'text-[#707070]'}`}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>
      </div>

      <div className="w-[1px] h-6 bg-[#2e2e2e] mx-1" />

      <div className="flex items-center gap-1 mx-2">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-[#2e2e2e] transition-colors ${editor.isActive('bulletList') ? 'text-[#3ecf8e] bg-[#2e2e2e]' : 'text-[#707070]'}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-[#2e2e2e] transition-colors ${editor.isActive('orderedList') ? 'text-[#3ecf8e] bg-[#2e2e2e]' : 'text-[#707070]'}`}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-[#2e2e2e] transition-colors ${editor.isActive('blockquote') ? 'text-[#3ecf8e] bg-[#2e2e2e]' : 'text-[#707070]'}`}
          title="Quote"
        >
          <Quote size={16} />
        </button>
      </div>

      <div className="w-[1px] h-6 bg-[#2e2e2e] mx-1" />

      <div className="flex items-center gap-1 mx-2">
        <button
          onClick={openLinkInput}
          className={`p-2 rounded hover:bg-[#2e2e2e] transition-colors ${editor.isActive('link') ? 'text-[#3ecf8e] bg-[#2e2e2e]' : 'text-[#707070]'}`}
          title="Link"
        >
          <LinkIcon size={16} />
        </button>
        <button
          onClick={onImageUpload}
          className="p-2 rounded hover:bg-[#2e2e2e] transition-colors text-[#707070]"
          title="Image"
        >
          <ImageIcon size={16} />
        </button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-[#2e2e2e] transition-colors text-[#707070] disabled:opacity-30"
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-[#2e2e2e] transition-colors text-[#707070] disabled:opacity-30"
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>
    </div>
  );
};

export default function Editor({ content, onChange, onImageUpload }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#3ecf8e] underline underline-offset-4',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg border border-[#2e2e2e] max-w-full my-6',
        },
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        tightListClass: 'tight',
        bulletListMarker: '-',
        linkify: true,
        breaks: true,
      }),
      Placeholder.configure({
        placeholder: 'Mulai menulis artikel Anda di sini...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      // If we are using markdown extension, we can decide what to emit.
      // But let's stay with HTML for consistency in rendering elsewhere.
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'content-prose max-w-none focus:outline-none min-h-[500px] p-6 lg:p-10 text-[16px] leading-relaxed custom-scrollbar',
      },
    },
  });

  // Update content when it changes from outside (e.g., initial load)
  useEffect(() => {
    if (!editor || content === undefined) return;

    const currentHTML = editor.getHTML();
    const currentMarkdown = editor.storage.markdown?.getMarkdown();
    
    // Check if the incoming content is different from both HTML and Markdown versions
    // This handles cases where the parent might be storing either format
    if (content !== currentHTML && content !== currentMarkdown) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  return (
    <div className="flex flex-col w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-md overflow-hidden shadow-inner group">
      <MenuBar editor={editor} onImageUpload={onImageUpload} />
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#1c1c1c] to-[#171717]">
        <EditorContent editor={editor} />
      </div>
      
      <style jsx global>{`
        .ProseMirror {
          min-height: 500px;
          color: #ededed;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #505050;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        /* Fix for list markers in editor */
        .ProseMirror ul { 
          list-style-type: disc !important; 
          padding-left: 2rem !important; 
          margin-bottom: 1.5rem !important;
          margin-top: 1rem !important;
        }
        .ProseMirror ol { 
          list-style-type: decimal !important; 
          padding-left: 2rem !important; 
          margin-bottom: 1.5rem !important;
          margin-top: 1rem !important;
        }
        .ProseMirror li { 
          display: list-item !important;
          margin-bottom: 0.75rem !important;
          padding-left: 0.5rem !important;
          color: #d1d1d1;
        }
        .ProseMirror li::before {
          content: none !important;
        }
        .ProseMirror blockquote { 
          border-left: 4px solid #3ecf8e; 
          padding: 1rem 1.5rem; 
          font-style: italic; 
          color: #9a9a9a; 
          margin: 2.5rem 0;
          background: rgba(62, 207, 142, 0.05);
          border-radius: 0 8px 8px 0;
          font-size: 1.1em;
          line-height: 1.6;
        }
        .ProseMirror h1 { font-size: 2.8rem; font-weight: 700; margin-top: 3rem; margin-bottom: 2rem; color: #fff; letter-spacing: -0.02em; }
        .ProseMirror h2 { font-size: 2rem; font-weight: 600; margin-top: 3rem; margin-bottom: 1.5rem; color: #fff; border-bottom: 1px solid #2e2e2e; padding-bottom: 0.75rem; letter-spacing: -0.01em; }
        .ProseMirror h3 { font-size: 1.5rem; font-weight: 600; margin-top: 2.5rem; margin-bottom: 1.25rem; color: #fff; }
        .ProseMirror p { margin-bottom: 1.5rem; line-height: 1.8; color: #b1b1b1; }
        .ProseMirror img { 
          display: block; 
          height: auto; 
          margin: 3rem auto; 
          border-radius: 12px;
          border: 1px solid #2e2e2e;
          max-width: 100%;
          box-shadow: 0 20px 40px -20px rgba(0,0,0,0.5);
        }
        .ProseMirror a { 
          color: #3ecf8e; 
          text-decoration: underline; 
          text-underline-offset: 4px; 
          font-weight: 500;
          cursor: pointer;
        }
        .ProseMirror hr {
          border: 0;
          border-top: 2px solid #2e2e2e;
          margin: 4rem 0;
        }
      `}</style>
    </div>
  );
}
