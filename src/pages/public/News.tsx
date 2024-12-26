import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Calendar } from "lucide-react";

const News = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"desc" | "asc">("desc");

  const { data: news } = useQuery({
    queryKey: ["public-news", sort],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: sort === "asc" });
      if (error) throw error;
      return data;
    },
  });

  const filteredNews = news?.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const truncateContent = (content: string) => {
    const stripHtml = content.replace(/<[^>]+>/g, '');
    return stripHtml.length > 200 
      ? stripHtml.substring(0, 200) + "..."
      : stripHtml;
  };

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Latest News</h1>
      
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sort} onValueChange={(value: "desc" | "asc") => setSort(value)}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest first</SelectItem>
            <SelectItem value="asc">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews?.map((item) => (
          <article key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold line-clamp-2">{item.title}</h2>
              {item.published_at && (
                <p className="text-sm text-muted-foreground">
                  {format(new Date(item.published_at), "MMMM dd, yyyy")}
                </p>
              )}
              <div className="prose prose-sm dark:prose-invert line-clamp-3">
                {truncateContent(item.content)}
              </div>
              <Link to={`/news/${item.id}`}>
                <Button variant="secondary" className="w-full">
                  Read More
                </Button>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default News;