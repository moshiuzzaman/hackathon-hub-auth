import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import VendorForm from "./VendorForm";

const VendorManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: vendors, isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const deleteVendor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("vendors")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vendor Management</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2" />
          Add Vendor
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Icon</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Redemption Instructions</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors?.map((vendor) => (
            <TableRow key={vendor.id}>
              <TableCell>
                <img
                  src={vendor.icon}
                  alt={vendor.name}
                  className="w-8 h-8 object-contain"
                />
              </TableCell>
              <TableCell>{vendor.name}</TableCell>
              <TableCell>
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {vendor.website}
                </a>
              </TableCell>
              <TableCell>{vendor.redemption_instructions}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingVendor(vendor)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteVendor.mutate(vendor.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <VendorForm
        open={isAddModalOpen || !!editingVendor}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setEditingVendor(null);
          }
        }}
        vendor={editingVendor}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["vendors"] });
        }}
      />
    </div>
  );
};

export default VendorManagement;