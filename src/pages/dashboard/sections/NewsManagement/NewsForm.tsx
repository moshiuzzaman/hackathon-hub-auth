import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/RichTextEditor";
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
    } else {
      form.reset();
    }
  }, [selectedNews, form]);

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

            <FormField
              control={form.control}
              name="published_at"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Published</FormLabel>
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked ? new Date().toISOString() : null);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <div className="h-[500px] overflow-hidden">
                      <RichTextEditor
                        content={field.value}
                        onChange={field.onChange}
                        maxHeight="450px"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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