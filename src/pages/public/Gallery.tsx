import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Gallery = () => {
  const [searchTag, setSearchTag] = useState("");

  const { data: images } = useQuery({
    queryKey: ["event-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_gallery")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredImages = images?.filter((image) =>
    searchTag
      ? image.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTag.toLowerCase())
        )
      : true
  );

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-4xl font-bold">Event Gallery</h1>
        
        <Input
          placeholder="Search by tag..."
          value={searchTag}
          onChange={(e) => setSearchTag(e.target.value)}
          className="max-w-md"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages?.map((image) => (
            <div
              key={image.id}
              className="group relative rounded-lg overflow-hidden border bg-card"
            >
              <img
                src={image.image_url}
                alt={image.description || "Gallery image"}
                className="w-full aspect-video object-cover"
              />
              <div className="p-4">
                {image.description && (
                  <p className="text-sm text-muted-foreground">
                    {image.description}
                  </p>
                )}
                {image.tags && image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {image.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setSearchTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;