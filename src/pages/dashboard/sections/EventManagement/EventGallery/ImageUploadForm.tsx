import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  file: z.any().refine((file) => file instanceof File, "Image is required"),
  event_id: z.string().optional(),
  description: z.string().optional(),
  tags: z.string()
    .optional()
    .transform((str) => (str ? str.split(",").map((s) => s.trim()) : [])),
});

type FormData = {
  file: File;
  event_id?: string;
  description?: string;
  tags: string[];
};

interface ImageUploadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImageUploadForm = ({ open, onOpenChange }: ImageUploadFormProps) => {
  const queryClient = useQueryClient();

  const { data: events } = useQuery({
    queryKey: ["events-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title")
        .order("start_time", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      tags: [],
    },
  });

  const uploadImage = useMutation({
    mutationFn: async (values: FormData) => {
      const file = values.file;
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from("event-gallery")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from("event-gallery")
        .getPublicUrl(filePath);

      // Save image metadata to database
      const { error: dbError } = await supabase.from("event_gallery").insert([
        {
          image_url: publicUrl.publicUrl,
          event_id: values.event_id,
          description: values.description,
          tags: values.tags,
        },
      ]);
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-gallery"] });
      toast.success("Image uploaded successfully");
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to upload image");
      console.error(error);
    },
  });

  const onSubmit = (values: FormData) => {
    uploadImage.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange }, ...field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        onChange(e.target.files ? e.target.files[0] : null)
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {events?.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Image description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter tags separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Upload</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadForm;