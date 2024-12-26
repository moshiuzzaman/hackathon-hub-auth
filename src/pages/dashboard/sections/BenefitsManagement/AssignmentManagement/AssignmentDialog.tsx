import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAssignmentHandlers } from "./hooks/useAssignmentHandlers";
import { ManualAssignmentTab } from "./components/ManualAssignmentTab";
import { AutoAssignmentTab } from "./components/AutoAssignmentTab";

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AssignmentDialog = ({ open, onOpenChange, onSuccess }: AssignmentDialogProps) => {
  const {
    form,
    selectedUsers,
    selectedVendor,
    handleUserSelect,
    handleVendorSelect,
    handleAutoAssign,
    handleManualAssign,
  } = useAssignmentHandlers(onSuccess, onOpenChange);

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
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

  const { data: vendors = [], isLoading: isLoadingVendors } = useQuery({
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

  const { data: unassignedBenefits = [], isLoading: isLoadingBenefits } = useQuery({
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

  if (isLoadingUsers || isLoadingVendors) {
    return <div>Loading...</div>;
  }

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
            <ManualAssignmentTab
              form={form}
              users={users}
              vendors={vendors}
              selectedUsers={selectedUsers}
              selectedVendor={selectedVendor}
              onUserSelect={handleUserSelect}
              onVendorSelect={handleVendorSelect}
              onSubmit={handleManualAssign}
              onCancel={() => onOpenChange(false)}
              isLoadingBenefits={isLoadingBenefits}
              unassignedBenefitsCount={unassignedBenefits.length}
            />
          </TabsContent>
          <TabsContent value="auto">
            <AutoAssignmentTab
              form={form}
              vendors={vendors}
              selectedVendor={selectedVendor}
              onVendorSelect={handleVendorSelect}
              onCancel={() => onOpenChange(false)}
              onAutoAssignParticipants={() => handleAutoAssign("participant")}
              onAutoAssignMentors={() => handleAutoAssign("mentor")}
              isLoadingBenefits={isLoadingBenefits}
              unassignedBenefitsCount={unassignedBenefits.length}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentDialog;