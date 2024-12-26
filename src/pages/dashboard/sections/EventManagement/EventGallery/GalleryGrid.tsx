import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ImageDetailsForm from "./ImageDetailsForm";

interface GalleryImage {
  id: string;
  image_url: string;
  description: string;
  tags: string[];
  event_id: string;
  events: {
    title: string;
  } | null;
}

interface GalleryGridProps {
  images: GalleryImage[];
}

const GalleryGrid = ({ images }: GalleryGridProps) => {
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const queryClient = useQueryClient();

  const deleteImage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("event_gallery")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-gallery"] });
      toast.success("Image deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete image");
      console.error(error);
    },
  });

  if (images.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No images in the gallery yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <div
          key={image.id}
          className="group relative rounded-lg overflow-hidden border bg-card"
        >
          <img
            src={image.image_url}
            alt={image.description || "Event image"}
            className="w-full aspect-video object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditingImage(image)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteImage.mutate(image.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-4">
            {image.events?.title && (
              <p className="text-sm font-medium">{image.events.title}</p>
            )}
            {image.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {image.description}
              </p>
            )}
            {image.tags && image.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {image.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      <ImageDetailsForm
        open={!!editingImage}
        onOpenChange={(open) => !open && setEditingImage(null)}
        image={editingImage}
      />
    </div>
  );
};

export default GalleryGrid;