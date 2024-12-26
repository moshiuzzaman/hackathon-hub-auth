import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AssignmentDialog from "./AssignmentDialog";

const AssignmentManagement = () => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const { data: assignments = [], isLoading, refetch } = useQuery({
    queryKey: ["benefit-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("benefit_assignments")
        .select(`
          *,
          user:profiles(full_name),
          benefit:benefits(
            provider_name,
            coupon_code,
            expiry_date
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Assignment Management</h2>
        <Button onClick={() => setIsAssignModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Assign Benefits
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Benefit</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned Date</TableHead>
            <TableHead>Redeemed Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell>{assignment.user?.full_name}</TableCell>
              <TableCell>{assignment.benefit?.provider_name}</TableCell>
              <TableCell>
                <code className="bg-muted px-2 py-1 rounded">
                  {assignment.benefit?.coupon_code}
                </code>
              </TableCell>
              <TableCell>
                {assignment.is_redeemed ? (
                  <span className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-1" /> Redeemed
                  </span>
                ) : (
                  <span className="flex items-center text-yellow-600">
                    <X className="w-4 h-4 mr-1" /> Pending
                  </span>
                )}
              </TableCell>
              <TableCell>
                {new Date(assignment.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {assignment.redeemed_at
                  ? new Date(assignment.redeemed_at).toLocaleDateString()
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AssignmentDialog
        open={isAssignModalOpen}
        onOpenChange={setIsAssignModalOpen}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
};

export default AssignmentManagement;