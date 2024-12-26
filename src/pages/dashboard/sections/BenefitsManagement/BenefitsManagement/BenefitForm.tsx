import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define the form schema with required fields matching the database schema
const formSchema = z.object({
  provider_name: z.string().min(1, "Provider name is required"),
  provider_website: z.string().url("Must be a valid URL"),
  coupon_code: z.string().min(1, "Coupon code is required"),
  redemption_instructions: z.string().min(1, "Redemption instructions are required"),
  expiry_date: z.string().optional(),
  user_type: z.string().optional(),
  vendor_id: z.string().min(1, "Vendor is required"),
});

// Define the type for the form data
type BenefitFormData = z.infer<typeof formSchema>;

interface BenefitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  benefit?: {
    id: string;
    provider_name: string;
    provider_website: string;
    coupon_code: string;
    redemption_instructions: string;
    expiry_date?: string;
    user_type?: string;
    vendor_id: string;
  };
  onSuccess: () => void;
}

const BenefitForm = ({ open, onOpenChange, benefit, onSuccess }: BenefitFormProps) => {
  const [vendors, setVendors] = useState<any[]>([]);
  
  const form = useForm<BenefitFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: benefit || {
      provider_name: "",
      provider_website: "",
      coupon_code: "",
      redemption_instructions: "",
      expiry_date: "",
      user_type: "",
      vendor_id: "",
    },
  });

  const onSubmit = async (values: BenefitFormData) => {
    try {
      if (benefit) {
        // Update existing benefit
        const { error } = await supabase
          .from("benefits")
          .update({
            provider_name: values.provider_name,
            provider_website: values.provider_website,
            coupon_code: values.coupon_code,
            redemption_instructions: values.redemption_instructions,
            expiry_date: values.expiry_date || null,
            user_type: values.user_type || null,
            vendor_id: values.vendor_id,
          })
          .eq("id", benefit.id);
        
        if (error) throw error;
        toast.success("Benefit updated successfully");
      } else {
        // Insert new benefit
        const { error } = await supabase
          .from("benefits")
          .insert([{
            provider_name: values.provider_name,
            provider_website: values.provider_website,
            coupon_code: values.coupon_code,
            redemption_instructions: values.redemption_instructions,
            expiry_date: values.expiry_date || null,
            user_type: values.user_type || null,
            vendor_id: values.vendor_id,
            is_active: true,
          }]);
        
        if (error) throw error;
        toast.success("Benefit added successfully");
      }
      
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{benefit ? "Edit Benefit" : "Add New Benefit"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vendor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
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
              name="provider_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="provider_website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider Website</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coupon_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coupon Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="redemption_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Redemption Instructions</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiry_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="user_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mentor">Mentor</SelectItem>
                      <SelectItem value="participant">Participant</SelectItem>
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
                {benefit ? "Update" : "Add"} Benefit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BenefitForm;