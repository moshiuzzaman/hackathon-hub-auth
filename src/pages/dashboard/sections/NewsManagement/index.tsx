import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import NewsForm from "./NewsForm";
import NewsTable from "./NewsTable";
import type { News } from "./types";

const NewsManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  const { data: news, isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch news");
        throw error;
      }

      // Ensure meta_info is properly typed
      return (data || []).map(item => ({
        ...item,
        meta_info: item.meta_info || { tags: [], category: "" }
      })) as News[];
    },
  });

  const handleEdit = (news: News) => {
    setSelectedNews(news);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setSelectedNews(null);
    setIsFormOpen(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create News
        </Button>
      </div>

      <NewsTable news={news || []} onEdit={handleEdit} />

      <NewsForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        selectedNews={selectedNews}
        onClose={handleClose}
      />
    </div>
  );
};

export default NewsManagement;