import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NewsDetail = () => {
  const { id } = useParams();

  const { data: news } = useQuery({
    queryKey: ["news-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (!news) return null;

  return (
    <div className="container py-8">
      <Link to="/news">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to News
        </Button>
      </Link>
      
      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{news.title}</h1>
        {news.published_at && (
          <p className="text-muted-foreground mb-8">
            {format(new Date(news.published_at), "MMMM dd, yyyy")}
          </p>
        )}
        <div 
          className="prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
      </article>
    </div>
  );
};

export default NewsDetail;