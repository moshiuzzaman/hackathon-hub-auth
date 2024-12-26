import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Plus } from "lucide-react";
import ThemeForm from "./ThemeForm";
import ThemeList from "./ThemeList";
import type { Theme } from "./types/theme";
import { parseTheme } from "./types/theme";

const ThemeManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  const { data: themes, isLoading } = useQuery({
    queryKey: ["themes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return data
        .map(parseTheme)
        .filter((theme): theme is Theme => theme !== null);
    },
  });

  const handleEdit = (theme: Theme) => {
    setSelectedTheme(theme);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setSelectedTheme(null);
    setIsFormOpen(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Management
        </CardTitle>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Theme
        </Button>
      </CardHeader>
      <CardContent>
        <ThemeList themes={themes || []} onEdit={handleEdit} />
        <ThemeForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          selectedTheme={selectedTheme}
          onClose={handleClose}
        />
      </CardContent>
    </Card>
  );
};

export default ThemeManagement;