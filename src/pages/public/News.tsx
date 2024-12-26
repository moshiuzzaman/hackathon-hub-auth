import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const News = () => {
  const { data: news } = useQuery({
    queryKey: ["public-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Latest News</h1>
      <div className="grid gap-8">
        {news?.map((item) => (
          <article key={item.id} className="space-y-4 p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold">{item.title}</h2>
            {item.published_at && (
              <p className="text-sm text-muted-foreground">
                {format(new Date(item.published_at), "MMMM dd, yyyy")}
              </p>
            )}
            <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: item.content }} />
          </article>
        ))}
      </div>
    </div>
  );
};

export default News;