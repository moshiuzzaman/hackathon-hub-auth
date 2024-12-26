import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { toast } from "sonner";
import type { News, NewsFormData } from "./types";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  meta_info: z.object({
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
  }).optional(),
  published_at: z.string().nullable().optional(),
});

interface NewsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNews: News | null;
  onClose: () => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex gap-2 p-2 border-b">
      <Button
        variant="outline"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-accent' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-accent' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-accent' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-accent' : ''}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );
};

const NewsForm = ({ open, onOpenChange, selectedNews, onClose }: NewsFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<NewsFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      meta_info: {
        tags: [],
        category: "",
      },
      published_at: null,
    },
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      form.setValue("content", editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (selectedNews) {
      let parsedMetaInfo = {
        tags: [] as string[],
        category: ""
      };

      if (selectedNews.meta_info && typeof selectedNews.meta_info === 'object' && !Array.isArray(selectedNews.meta_info)) {
        const metaInfo = selectedNews.meta_info as Record<string, unknown>;
        
        if (Array.isArray(metaInfo.tags)) {
          parsedMetaInfo.tags = metaInfo.tags.filter(tag => typeof tag === 'string');
        }
        
        if (typeof metaInfo.category === 'string') {
          parsedMetaInfo.category = metaInfo.category;
        }
      }

      form.reset({
        title: selectedNews.title,
        content: selectedNews.content,
        meta_info: parsedMetaInfo,
        published_at: selectedNews.published_at,
      });
      editor?.commands.setContent(selectedNews.content);
    } else {
      form.reset();
      editor?.commands.setContent("");
    }
  }, [selectedNews, form, editor]);

  const mutation = useMutation({
    mutationFn: async (values: NewsFormData) => {
      if (selectedNews) {
        const { error } = await supabase
          .from("news")
          .update(values)
          .eq("id", selectedNews.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("news")
          .insert([values]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
      toast.success(selectedNews ? "News updated successfully" : "News created successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(selectedNews ? "Failed to update news" : "Failed to create news");
      console.error(error);
    },
  });

  const onSubmit = (values: NewsFormData) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{selectedNews ? "Edit News" : "Create News"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <div className="border rounded-md overflow-hidden">
                  <MenuBar editor={editor} />
                  <div className="min-h-[200px] p-4">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {selectedNews ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewsForm;