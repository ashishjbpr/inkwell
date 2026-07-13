"use client";

import { Editor } from '@tiptap/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Highlighter,
  Subscript as SubIcon,
  Superscript as SuperIcon,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  Video as YoutubeIcon,
  Table as TableIcon,
  Trash2,
  Rows,
  Columns,
  Type
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
        ? 'bg-[var(--accent-bg)] text-[var(--accent)]'
        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-[var(--border)] shrink-0 mx-1" />;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

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

  // 1) Highlight color picker
  const [highlightColor, setHighlightColor] = useState('#fff59d');
  const HIGHLIGHT_COLORS = ['#fff59d', '#f48fb1', '#81d4fa', '#a5d6a7', '#ce93d8'];

  // 3) Font options
  const fontFamilies = useMemo(
    () => [
      { label: 'System', value: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' },
      { label: 'Serif', value: 'Georgia, Cambria, "Times New Roman", Times, serif' },
      { label: 'Sans', value: 'Arial, Helvetica, sans-serif' },
      { label: 'Mono', value: '"Courier New", Courier, monospace' },
      { label: 'Roboto', value: 'Roboto, system-ui, -apple-system, Segoe UI, Helvetica, Arial' }
    ],
    []
  );

  const fontSizes = useMemo(() => [12, 14, 16, 18, 20, 24, 32], []);

  // 2) Image resize using cursor drag
  const resizeStateRef = useRef<{
    active: boolean;
    startX: number;
    startWidth: number;
    imagePos: { from: number; to: number } | null;
  }>({ active: false, startX: 0, startWidth: 0, imagePos: null });

  useEffect(() => {
    const root = editor.view?.dom as HTMLElement | undefined;
    if (!root) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const imgEl = target.closest('img') as HTMLImageElement | null;
      if (!imgEl) return;

      // Best-effort: only start if image is inside editor content.
      if (!root.contains(imgEl)) return;

      const rect = imgEl.getBoundingClientRect();
      const startWidth = rect.width;
      if (!startWidth) return;

      // Find the nearest image position in the document.
      const view = editor.view;
      const pos = view.posAtCoords({ left: e.clientX, top: e.clientY });
      if (pos == null) return;

      // Start resize session
      resizeStateRef.current = {
        active: true,
        startX: e.clientX,
        startWidth,
        imagePos: { from: pos.pos, to: pos.pos }
      };

      // Prevent editor selection flicker while dragging.
      e.preventDefault();
      document.body.style.cursor = 'ew-resize';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStateRef.current.active) return;
      const dx = e.clientX - resizeStateRef.current.startX;
      const startWidth = resizeStateRef.current.startWidth;
      const nextWidth = clamp(Math.round(startWidth + dx), 80, 1200);

      // Apply width via image attrs; TipTap updateAttributes is best-effort depending on configured attrs support.
      // Fallback: also set inline style to make it visible immediately.
      const view = editor.view;
      const { imagePos } = resizeStateRef.current;
      if (!imagePos) return;

      // Inline style immediate feedback
      const domTarget = (e.target as HTMLElement | null)?.closest('img') as HTMLImageElement | null;
      if (domTarget) domTarget.style.width = `${nextWidth}px`;

      try {
        editor
          .chain()
          .focus()
          .updateAttributes('image', { width: nextWidth })
          .run();
      } catch {
        // Ignore if extension schema doesn't support width attrs.
      }
      // Keep the drag smooth.
      (view as any)?.updateState?.(view.state);
    };

    const handleMouseUp = () => {
      if (!resizeStateRef.current.active) return;
      resizeStateRef.current.active = false;
      document.body.style.cursor = '';
    };

    root.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      root.removeEventListener('mousedown', handleMouseDown, true);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editor]);

  const applyFontFamily = (fontFamily: string) => {
    editor.chain().focus().setMark('textStyle', { fontFamily }).run();
  };

  const applyFontSize = (fontSizePx: number) => {
    editor.chain().focus().setMark('textStyle', { fontSize: `${fontSizePx}px` }).run();
  };

  const handleHighlight = () => {
    editor.chain().focus().toggleHighlight({ color: highlightColor }).run();
  };

  return (
    <div className="flex items-center gap-1 p-2 w-max min-w-full">
      {/* Text Formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
        <UnderlineIcon size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
        <Strikethrough size={16} />
      </ToolbarButton>

      {/* Highlight preset colors */}
      <div className="flex items-center gap-1 shrink-0 px-1 border border-[var(--border)] rounded-lg p-1 bg-[var(--bg-card)]">
        {HIGHLIGHT_COLORS.map(c => (
          <button
            key={c}
            onClick={() => {
              setHighlightColor(c);
              editor.chain().focus().setHighlight({ color: c }).run();
            }}
            className={`w-5 h-5 rounded-full border-2 transition-transform ${highlightColor === c ? 'scale-110 border-gray-400' : 'border-transparent hover:scale-110'}`}
            style={{ backgroundColor: c }}
            title="Highlight color"
          />
        ))}
        <div className="w-px h-4 bg-[var(--border)] mx-1" />
        <ToolbarButton onClick={() => {
          if (editor.isActive('highlight')) {
            editor.chain().focus().unsetHighlight().run();
          } else {
            editor.chain().focus().setHighlight({ color: highlightColor }).run();
          }
        }} isActive={editor.isActive('highlight')} title="Toggle Highlight">
          <Highlighter size={16} />
        </ToolbarButton>
      </div>

      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code">
        <Code size={16} />
      </ToolbarButton>

      <Divider />

      {/* Sub/Superscript */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')} title="Subscript">
        <SubIcon size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')} title="Superscript">
        <SuperIcon size={16} />
      </ToolbarButton>

      <Divider />

      {/* Typography */}
      <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive('paragraph')} title="Paragraph">
        <Pilcrow size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
        <Heading1 size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
        <Heading3 size={16} />
      </ToolbarButton>

      {/* Font family + size */}
      <Divider />
      <div className="flex items-center gap-1 shrink-0">
        <div className="flex items-center gap-1 p-1 rounded-lg" title="Font">
          <Type size={16} className="text-[var(--text-secondary)]" />
          <select
            aria-label="Font family"
            onChange={(e) => applyFontFamily(e.target.value)}
            className="bg-[var(--bg-card)] text-[var(--text)] text-sm border border-[var(--border)] rounded px-2 py-1"
            defaultValue={fontFamilies[0]?.value}
          >
            {fontFamilies.map((f) => (
              <option key={f.label} value={f.value} style={{ fontFamily: f.value }}>
                {f.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Font size"
            onChange={(e) => applyFontSize(Number(e.target.value))}
            className="bg-[var(--bg-card)] text-[var(--text)] text-sm border border-[var(--border)] rounded px-2 py-1"
            defaultValue={fontSizes[2]}
          >
            {fontSizes.map((s) => (
              <option key={s} value={s}>
                {s}px
              </option>
            ))}
          </select>
        </div>
      </div>

      <Divider />

      {/* Lists */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Task List">
        <CheckSquare size={16} />
      </ToolbarButton>

      <Divider />

      {/* Alignment */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
        <AlignRight size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify">
        <AlignJustify size={16} />
      </ToolbarButton>

      <Divider />

      {/* Blocks & Embeds */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
        <Quote size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
        <Minus size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={addImage} title="Add Image (URL)">
        <ImageIcon size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={addYoutube} title="Add YouTube Video">
        <YoutubeIcon size={16} />
      </ToolbarButton>

      <Divider />

      {/* Tables */}
      <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table">
        <TableIcon size={16} />
      </ToolbarButton>
      {editor.isActive('table') && (
        <>
          <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column">
            <Columns size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row">
            <Rows size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table">
            <Trash2 size={16} className="text-red-500" />
          </ToolbarButton>
        </>
      )}

    </div>
  );
}
