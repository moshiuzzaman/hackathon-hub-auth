import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const HomePageSettings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: settings, refetch } = useQuery({
    queryKey: ["home-page-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_page_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const updates = {
      hero_title: String(formData.get("hero_title")),
      hero_subtitle: String(formData.get("hero_subtitle")),
      hero_image_url: String(formData.get("hero_image_url")),
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from("home_page_settings")
        .upsert(updates);

      if (error) throw error;

      toast.success("Home page settings updated successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Home Page Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="hero_title" className="text-sm font-medium">
                Hero Title
              </label>
              <Input
                id="hero_title"
                name="hero_title"
                defaultValue={settings?.hero_title}
                placeholder="Enter hero title"
              />
            </div>
            <div>
              <label htmlFor="hero_subtitle" className="text-sm font-medium">
                Hero Subtitle
              </label>
              <Textarea
                id="hero_subtitle"
                name="hero_subtitle"
                defaultValue={settings?.hero_subtitle}
                placeholder="Enter hero subtitle"
                rows={4}
              />
            </div>
            <div>
              <label htmlFor="hero_image_url" className="text-sm font-medium">
                Hero Image URL
              </label>
              <Input
                id="hero_image_url"
                name="hero_image_url"
                defaultValue={settings?.hero_image_url}
                placeholder="Enter hero image URL"
              />
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default HomePageSettings;