import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from './ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  maxHeight?: string;
}

const ToolbarButton = ({ 
  isActive, 
  onClick, 
  icon: Icon 
}: { 
  isActive: boolean; 
  onClick: () => void; 
  icon: React.ElementType;
}) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onClick}
    className={cn(
      "hover:bg-secondary/50",
      isActive && "bg-secondary"
    )}
  >
    <Icon className="h-4 w-4" />
  </Button>
);

export const RichTextEditor = ({ 
  content, 
  onChange,
  maxHeight = "400px" 
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const toolbarItems = [
    { 
      icon: Bold, 
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold')
    },
    { 
      icon: Italic, 
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic')
    },
    { 
      icon: List, 
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList')
    },
    { 
      icon: ListOrdered, 
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList')
    },
    { 
      icon: Quote, 
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote')
    },
    { 
      icon: Heading1, 
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 })
    },
    { 
      icon: Heading2, 
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 })
    },
    { 
      icon: Heading3, 
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 })
    }
  ];

  return (
    <div className="border rounded-lg flex flex-col">
      <div className="border-b p-2 flex flex-wrap gap-1">
        {toolbarItems.map((item, index) => (
          <ToolbarButton
            key={index}
            icon={item.icon}
            onClick={item.action}
            isActive={item.isActive}
          />
        ))}
      </div>
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