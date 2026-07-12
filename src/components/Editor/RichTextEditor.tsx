"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Youtube } from '@tiptap/extension-youtube';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';

import Toolbar from '@/components/Editor/Toolbar';
import React, { useCallback, useEffect } from 'react';
import { saveImage } from '@/lib/indexedDB';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}



export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const extensions = React.useMemo(() => [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
    }),
    Underline,
    Highlight,
    Subscript,
    Superscript,
    TextStyle,
    Color,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    Link.configure({ openOnClick: false, autolink: true }),
    Image.configure({ inline: true, allowBase64: true }),
    Youtube.configure({ inline: false }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Placeholder.configure({ placeholder: 'Start writing your story...' }),
  ], []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose editor-prose max-w-none outline-none min-h-[500px]',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            handleImageUpload(file, view, event);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith('image/')) {
            handleImageUpload(file, view, event);
            return true;
          }
        }
        return false;
      },
    },
  });

  const handleImageUpload = async (file: File, view: any, event: any) => {
    event.preventDefault();
    try {
      const id = crypto.randomUUID();
      await saveImage(id, file);

      // Create a blob URL to show immediately
      const url = URL.createObjectURL(file);
      
      const { schema } = view.state;
      const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
      const node = schema.nodes.image.create({ src: url, alt: file.name, title: id }); // Storing ID in title as a hack to retrieve it later if needed

      const transaction = view.state.tr.insert(coordinates?.pos || view.state.selection.to, node);
      view.dispatch(transaction);
    } catch (e) {
      console.error("Failed to upload image to IndexedDB", e);
      alert("Failed to upload image. Please try again.");
    }
  };

  // Sync external content changes (if selecting a different entry)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Scrollable Toolbar */}
      <div 
        className="flex-shrink-0 border-b-2 overflow-x-auto scrollbar-thin"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
      >
        <Toolbar editor={editor} />
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-12 tiptap-editor">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
