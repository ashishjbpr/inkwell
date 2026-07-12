"use client";

import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Code, Highlighter, Subscript as SubIcon, Superscript as SuperIcon,
  Heading1, Heading2, Heading3, Pilcrow,
  List, ListOrdered, CheckSquare, Quote, Minus,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Video as YoutubeIcon,
  Table as TableIcon, Trash2, Rows, Columns
} from 'lucide-react';

interface ToolbarProps {
  editor: Editor;
}

const ToolbarButton = ({
  onClick,
  isActive,
  disabled,
  children,
  title
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg text-sm transition-colors flex items-center justify-center shrink-0 ${
      isActive 
        ? "bg-[var(--accent-bg)] text-[var(--accent)]" 
        : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-[var(--border)] shrink-0 mx-1" />;

export default function Toolbar({ editor }: ToolbarProps) {
  const addImage = () => {
    const url = window.prompt('URL of the image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutube = () => {
    const url = window.prompt('URL of the YouTube video:');
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  return (
    <div className="flex items-center gap-1 p-2 w-max min-w-full">
      {/* Text Formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><Bold size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><Italic size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline"><UnderlineIcon size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight"><Highlighter size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code"><Code size={16} /></ToolbarButton>
      
      <Divider />
      
      {/* Sub/Superscript */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')} title="Subscript"><SubIcon size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')} title="Superscript"><SuperIcon size={16} /></ToolbarButton>
      
      <Divider />
      
      {/* Typography */}
      <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive('paragraph')} title="Paragraph"><Pilcrow size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={16} /></ToolbarButton>
      
      <Divider />
      
      {/* Lists */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List"><List size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List"><ListOrdered size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Task List"><CheckSquare size={16} /></ToolbarButton>
      
      <Divider />
      
      {/* Alignment */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify"><AlignJustify size={16} /></ToolbarButton>
      
      <Divider />

      {/* Blocks & Embeds */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote"><Quote size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus size={16} /></ToolbarButton>
      <ToolbarButton onClick={addImage} title="Add Image (URL)"><ImageIcon size={16} /></ToolbarButton>
      <ToolbarButton onClick={addYoutube} title="Add YouTube Video"><YoutubeIcon size={16} /></ToolbarButton>

      <Divider />

      {/* Tables */}
      <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table"><TableIcon size={16} /></ToolbarButton>
      {editor.isActive('table') && (
        <>
          <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column"><Columns size={16} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row"><Rows size={16} /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table"><Trash2 size={16} className="text-red-500" /></ToolbarButton>
        </>
      )}
    </div>
  );
}
