import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useState } from "react";
import type { Theme } from "./types";

interface ThemeListProps {
  themes: Theme[];
  onEdit: (theme: Theme) => void;
}

const ThemeList = ({ themes, onEdit }: ThemeListProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Check if theme is default before attempting deletion
      const themeToDelete = themes.find(theme => theme.id === id);
      if (themeToDelete?.type === "default") {
        throw new Error("Cannot delete default theme");
      }

      const { error } = await supabase
        .from("themes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      toast.success("Theme deleted successfully");
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete theme");
      setDeleteId(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      // First, deactivate all other themes
      if (isActive) {
        const { error: deactivateError } = await supabase
          .from("themes")
          .update({ is_active: false })
          .neq("id", id);

        if (deactivateError) throw deactivateError;
      }

      // Then update the selected theme
      const { error } = await supabase
        .from("themes")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      toast.success("Theme status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update theme status");
      console.error(error);
    },
  });

  const handleDelete = (id: string) => {
    const theme = themes.find(t => t.id === id);
    if (theme?.type === "default") {
      toast.error("Cannot delete default theme");
      return;
    }
    setDeleteId(id);
  };

  const handleEdit = (theme: Theme) => {
    onEdit(theme);
  };

  const handleToggleActive = (id: string, currentState: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !currentState });
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {themes.map((theme) => (
            <TableRow key={theme.id}>
              <TableCell>{theme.name}</TableCell>
              <TableCell>
                <Badge variant={theme.type === "default" ? "secondary" : "outline"}>
                  {theme.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Switch
                  checked={theme.is_active}
                  onCheckedChange={() => handleToggleActive(theme.id, theme.is_active)}
                />
              </TableCell>
              <TableCell>
                {format(new Date(theme.created_at), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(theme)}
                    disabled={theme.type === "default"}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(theme.id)}
                    disabled={theme.type === "default"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the theme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ThemeList;