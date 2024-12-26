import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Users } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

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
        .select("id, full_name")
        .eq("role", "mentor");
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

      const benefitIds = assignments.map(a => a.benefit_id);
      const { error: updateError } = await supabase
        .from("benefits")
        .update({ is_assigned: true })
        .in("id", benefitIds);

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="vendorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Vendor</FormLabel>
                  <FormControl>
                    <Command className="border rounded-md">
                      <CommandInput placeholder="Search vendors..." />
                      <CommandEmpty>No vendors found.</CommandEmpty>
                      <CommandGroup className="max-h-40 overflow-y-auto">
                        {vendors.map((vendor) => (
                          <CommandItem
                            key={vendor.id}
                            value={vendor.id}
                            onSelect={() => {
                              field.onChange(vendor.id);
                              setSelectedVendor(vendor.id);
                            }}
                          >
                            {vendor.name}
                            {field.value === vendor.id && (
                              <Check className="ml-auto h-4 w-4" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Users</FormLabel>
                  <FormControl>
                    <Command className="border rounded-md">
                      <CommandInput placeholder="Search users..." />
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup className="max-h-40 overflow-y-auto">
                        {users.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={user.id}
                            onSelect={() => {
                              const newSelection = selectedUsers.includes(user.id)
                                ? selectedUsers.filter(id => id !== user.id)
                                : [...selectedUsers, user.id];
                              setSelectedUsers(newSelection);
                              field.onChange(newSelection);
                            }}
                          >
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4" />
                              {user.full_name || user.id}
                            </div>
                            {selectedUsers.includes(user.id) && (
                              <Check className="ml-auto h-4 w-4" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </FormControl>
                </FormItem>
              )}
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
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentDialog;