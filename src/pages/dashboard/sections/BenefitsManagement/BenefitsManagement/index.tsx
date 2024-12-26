import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { BenefitForm } from "./BenefitForm";

const BenefitsManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<any>(null);

  const { data: benefits, isLoading, refetch } = useQuery({
    queryKey: ["benefits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("benefits")
        .select(`
          *,
          vendor:vendors(name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteBenefit = async (id: string) => {
    try {
      const { error } = await supabase
        .from("benefits")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Benefit deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Benefits Management</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Benefit
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>User Type</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {benefits?.map((benefit) => (
            <TableRow key={benefit.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{benefit.provider_name}</div>
                  <div className="text-sm text-muted-foreground">
                    <a href={benefit.provider_website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Website
                    </a>
                  </div>
                </div>
              </TableCell>
              <TableCell>{benefit.vendor?.name}</TableCell>
              <TableCell>
                <code className="bg-muted px-2 py-1 rounded">{benefit.coupon_code}</code>
              </TableCell>
              <TableCell>{benefit.user_type || "All"}</TableCell>
              <TableCell>
                {benefit.expiry_date ? new Date(benefit.expiry_date).toLocaleDateString() : "No expiry"}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${benefit.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {benefit.is_active ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingBenefit(benefit)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteBenefit(benefit.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <BenefitForm
        open={isAddModalOpen || !!editingBenefit}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setEditingBenefit(null);
          }
        }}
        initialData={editingBenefit}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
};

export default BenefitsManagement;