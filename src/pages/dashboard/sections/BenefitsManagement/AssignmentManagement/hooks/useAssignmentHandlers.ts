import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  userIds: z.array(z.string()).min(1, "Select at least one user"),
  vendorId: z.string().min(1, "Select a vendor"),
});

export const useAssignmentHandlers = (onSuccess: () => void, onOpenChange: (open: boolean) => void) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userIds: [],
      vendorId: "",
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

      const { data: unassignedBenefits } = await supabase
        .from("benefits")
        .select("*")
        .eq("vendor_id", selectedVendor)
        .eq("is_assigned", false)
        .eq("is_active", true);

      if (!unassignedBenefits?.length || usersWithoutBenefits.length > unassignedBenefits.length) {
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

  const handleManualAssign = async () => {
    try {
      const { data: unassignedBenefits } = await supabase
        .from("benefits")
        .select("*")
        .eq("vendor_id", selectedVendor)
        .eq("is_assigned", false)
        .eq("is_active", true);

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

  return {
    form,
    selectedUsers,
    selectedVendor,
    handleUserSelect,
    handleVendorSelect,
    handleAutoAssign,
    handleManualAssign,
  };
};