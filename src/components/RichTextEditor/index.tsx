import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextStyle from '@tiptap/extension-text-style';
import { FontSize } from './extensions/FontSize';
import { Toolbar } from './components/Toolbar';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  maxHeight?: string;
}

export const RichTextEditor = ({ 
  content, 
  onChange,
  maxHeight = "400px" 
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:underline',
        },
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TextStyle,
      FontSize,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg flex flex-col">
      <Toolbar editor={editor} />
      <div 
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
        />
      </div>
    </div>
  );
};