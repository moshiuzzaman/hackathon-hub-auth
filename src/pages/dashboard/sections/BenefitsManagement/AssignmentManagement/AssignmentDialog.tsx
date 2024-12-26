import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { VendorSelect } from "./components/VendorSelect";
import { UserSelect } from "./components/UserSelect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  userIds: z.array(z.string()).min(1, "Select at least one user"),
  vendorId: z.string().min(1, "Select a vendor"),
});

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AssignmentDialog = ({ open, onOpenChange, onSuccess }: AssignmentDialogProps) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userIds: [],
      vendorId: "",
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ["mentors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .in("role", ["mentor", "participant"]);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: unassignedBenefits = [] } = useQuery({
    queryKey: ["unassigned-benefits", selectedVendor],
    enabled: !!selectedVendor,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("benefits")
        .select("*")
        .eq("vendor_id", selectedVendor)
        .eq("is_assigned", false)
        .eq("is_active", true);
      if (error) throw error;
      return data || [];
    },
  });

  const handleUserSelect = (userId: string) => {
    const newSelection = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];
    setSelectedUsers(newSelection);
    form.setValue("userIds", newSelection);
  };

  const handleVendorSelect = (vendorId: string) => {
    setSelectedVendor(vendorId);
    form.setValue("vendorId", vendorId);
  };

  const handleAutoAssign = async (userRole: "mentor" | "participant") => {
    try {
      if (!selectedVendor) {
        toast.error("Please select a vendor first");
        return;
      }

      // Get users without benefits from this vendor
      const { data: usersWithoutBenefits, error: usersError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", userRole)
        .not("id", "in", (
          await supabase
            .from("benefit_assignments")
            .select("user_id")
            .eq("benefit:benefits(vendor_id)", selectedVendor)
        ).data?.map(a => a.user_id) || []);

      if (usersError) throw usersError;

      if (!usersWithoutBenefits?.length) {
        toast.info("All users already have benefits from this vendor");
        return;
      }

      if (usersWithoutBenefits.length > unassignedBenefits.length) {
        toast.error("Not enough benefits available for all users");
        return;
      }

      const assignments = usersWithoutBenefits.map((user, index) => ({
        user_id: user.id,
        benefit_id: unassignedBenefits[index].id,
      }));

      const { error: assignmentError } = await supabase
        .from("benefit_assignments")
        .insert(assignments);

      if (assignmentError) throw assignmentError;

      const { error: updateError } = await supabase
        .from("benefits")
        .update({ is_assigned: true })
        .in("id", assignments.map(a => a.benefit_id));

      if (updateError) throw updateError;

      toast.success(`Benefits auto-assigned to ${assignments.length} ${userRole}s`);
      onSuccess();
      onOpenChange(false);
      setSelectedUsers([]);
      setSelectedVendor("");
      form.reset();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const onSubmit = async () => {
    try {
      if (!unassignedBenefits || unassignedBenefits.length === 0) {
        toast.error("No available benefits for this vendor");
        return;
      }

      if (unassignedBenefits.length < selectedUsers.length) {
        toast.error("Not enough benefits available for all selected users");
        return;
      }

      const assignments = selectedUsers.map((userId, index) => ({
        user_id: userId,
        benefit_id: unassignedBenefits[index].id,
      }));

      const { error: assignmentError } = await supabase
        .from("benefit_assignments")
        .insert(assignments);

      if (assignmentError) throw assignmentError;

      const { error: updateError } = await supabase
        .from("benefits")
        .update({ is_assigned: true })
        .in("id", assignments.map(a => a.benefit_id));

      if (updateError) throw updateError;

      toast.success("Benefits assigned successfully");
      onSuccess();
      onOpenChange(false);
      setSelectedUsers([]);
      setSelectedVendor("");
      form.reset();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Benefits</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="manual">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Assignment</TabsTrigger>
            <TabsTrigger value="auto">Auto Assignment</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <VendorSelect
                  form={form}
                  vendors={vendors}
                  onVendorSelect={handleVendorSelect}
                />

                <UserSelect
                  form={form}
                  users={users}
                  selectedUsers={selectedUsers}
                  onUserSelect={handleUserSelect}
                />

                {selectedVendor && (
                  <div className="text-sm text-muted-foreground">
                    Available benefits: {unassignedBenefits.length}
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!selectedVendor || selectedUsers.length === 0}
                  >
                    Assign Benefits
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="auto">
            <div className="space-y-6">
              <VendorSelect
                form={form}
                vendors={vendors}
                onVendorSelect={handleVendorSelect}
              />

              {selectedVendor && (
                <div className="text-sm text-muted-foreground">
                  Available benefits: {unassignedBenefits.length}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleAutoAssign("participant")}
                  disabled={!selectedVendor}
                >
                  Auto-assign to Participants
                </Button>
                <Button
                  onClick={() => handleAutoAssign("mentor")}
                  disabled={!selectedVendor}
                >
                  Auto-assign to Mentors
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentDialog;