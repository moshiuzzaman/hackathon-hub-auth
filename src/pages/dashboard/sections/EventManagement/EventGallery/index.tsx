import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import GalleryGrid from "./GalleryGrid";
import ImageUploadForm from "./ImageUploadForm";

const EventGallery = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: images, isLoading } = useQuery({
    queryKey: ["event-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_gallery")
        .select("*, events(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Gallery</h2>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Plus className="mr-2" />
          Add Image
        </Button>
      </div>

      <GalleryGrid images={images || []} />

      <ImageUploadForm
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
      />
    </div>
  );
};

export default EventGallery;