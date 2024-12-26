import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";

const formSchema = z.object({
  type: z.enum(["terms", "privacy"]),
  content: z.string().min(1, "Content is required"),
});

type FormData = z.infer<typeof formSchema>;

interface DocumentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    id: string;
    type: "terms" | "privacy";
    content: string;
  };
}

export const DocumentForm = ({ isOpen, onClose, onSuccess, initialData }: DocumentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialData?.type || "terms",
      content: initialData?.content || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing) {
        const { error } = await supabase
          .from("legal_documents")
          .update({
            content: data.content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);

        if (error) throw error;
        toast.success("Document updated successfully");
      } else {
        const { error } = await supabase.from("legal_documents").insert({
          type: data.type,
          content: data.content,
          version: "1.0.0",
        });

        if (error) throw error;
        toast.success("Document created successfully");
      }
      
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save document");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Legal Document" : "Create Legal Document"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="terms">Terms of Service</SelectItem>
                      <SelectItem value="privacy">Privacy Policy</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <RichTextEditor
                      content={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isEditing ? "Update" : "Create"} Document
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};