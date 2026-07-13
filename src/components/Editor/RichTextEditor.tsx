"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
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
import { Image as TiptapImage } from '@tiptap/extension-image';
import { Youtube } from '@tiptap/extension-youtube';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';

import Toolbar from '@/components/Editor/Toolbar';
import React, { useCallback, useEffect } from 'react';
import { saveImage, getImage } from '@/lib/indexedDB';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const CustomImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width') || element.style.width,
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return {
            width: attributes.width,
            style: `width: ${attributes.width}${typeof attributes.width === 'number' ? 'px' : ''}`
          };
        }
      },
    };
  }
});

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
});

const FontFamily = Extension.create({
  name: 'fontFamily',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: element => element.style.fontFamily?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontFamily) return {};
              return { style: `font-family: ${attributes.fontFamily}` };
            },
          },
        },
      },
    ];
  },
});



export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const extensions = React.useMemo(() => [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
    }),
    Underline,
    Highlight.configure({ multicolor: true }),
    Subscript,
    Superscript,
    TextStyle,
    FontSize,
    FontFamily,
    Color,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    Link.configure({ openOnClick: false, autolink: true }),
    CustomImage.configure({ inline: true, allowBase64: true }),
    Youtube.configure({ inline: false }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Placeholder.configure({ placeholder: 'Start writing your story...' }),
  ], []);

  const restoreImages = async (editorInstance: any) => {
    let stateModified = false;
    const { tr } = editorInstance.state;
    
    const promises: Promise<void>[] = [];
    
    editorInstance.state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === 'image' && node.attrs.title) {
        const id = node.attrs.title;
        promises.push(
          getImage(id).then(blob => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              // Check if the current src is already the loaded blob to avoid infinite loops
              if (node.attrs.src !== url && (!node.attrs.src || !node.attrs.src.startsWith('blob:'))) {
                tr.setNodeMarkup(pos, null, { ...node.attrs, src: url });
                stateModified = true;
              }
            }
          })
        );
      }
    });
    
    await Promise.all(promises);
    if (stateModified) {
      editorInstance.view.dispatch(tr);
    }
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: content,
    onCreate: ({ editor }) => {
      restoreImages(editor);
    },
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
      restoreImages(editor);
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
