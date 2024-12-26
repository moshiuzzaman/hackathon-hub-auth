import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  user_id: z.string().min(1, "User is required"),
  benefit_id: z.string().min(1, "Benefit is required"),
});

interface AssignmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AssignmentForm = ({ open, onOpenChange, onSuccess }: AssignmentFormProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: "",
      benefit_id: "",
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("role", "mentor");
      if (!error && data) {
        setUsers(data);
      }
    };

    const fetchBenefits = async () => {
      const { data, error } = await supabase
        .from("benefits")
        .select("*")
        .eq("is_active", true)
        .eq("is_assigned", false);
      if (!error && data) {
        setBenefits(data);
      }
    };

    if (open) {
      fetchUsers();
      fetchBenefits();
    }
  }, [open]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error: assignmentError } = await supabase
        .from("benefit_assignments")
        .insert([{
          user_id: values.user_id,
          benefit_id: values.benefit_id,
        }]);
      
      if (assignmentError) throw assignmentError;

      const { error: benefitError } = await supabase
        .from("benefits")
        .update({ is_assigned: true })
        .eq("id", values.benefit_id);

      if (benefitError) throw benefitError;

      toast.success("Benefit assigned successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Benefit</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="benefit_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benefit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a benefit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {benefits.map((benefit) => (
                        <SelectItem key={benefit.id} value={benefit.id}>
                          {benefit.provider_name} - {benefit.coupon_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Assign Benefit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentForm;