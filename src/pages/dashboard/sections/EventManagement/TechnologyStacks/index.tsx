import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import TechnologyStackForm from "./TechnologyStackForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TechnologyStacks = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStack, setEditingStack] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: stacks, isLoading } = useQuery({
    queryKey: ["technology-stacks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("technology_stacks")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const { error } = await supabase
        .from("technology_stacks")
        .update({ is_enabled: isEnabled })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technology-stacks"] });
      toast.success("Status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update status");
      console.error(error);
    },
  });

  const deleteStack = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("technology_stacks")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technology-stacks"] });
      toast.success("Technology stack deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete technology stack");
      console.error(error);
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Technology Stacks</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2" />
          Add Stack
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Icon</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stacks?.map((stack) => (
            <TableRow key={stack.id}>
              <TableCell>
                <img
                  src={stack.icon}
                  alt={stack.name}
                  className="w-8 h-8"
                />
              </TableCell>
              <TableCell>{stack.name}</TableCell>
              <TableCell>
                <Button
                  variant={stack.is_enabled ? "default" : "secondary"}
                  size="sm"
                  onClick={() =>
                    toggleStatus.mutate({
                      id: stack.id,
                      isEnabled: !stack.is_enabled,
                    })
                  }
                >
                  {stack.is_enabled ? (
                    <Check className="mr-2" />
                  ) : (
                    <X className="mr-2" />
                  )}
                  {stack.is_enabled ? "Enabled" : "Disabled"}
                </Button>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingStack(stack)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteStack.mutate(stack.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TechnologyStackForm
        open={isAddModalOpen || !!editingStack}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setEditingStack(null);
          }
        }}
        stack={editingStack}
      />
    </div>
  );
};

export default TechnologyStacks;