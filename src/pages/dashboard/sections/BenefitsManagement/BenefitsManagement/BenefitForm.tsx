import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormFields } from "./components/FormFields";
import { BenefitFormProps, benefitFormSchema, type BenefitFormData, type Vendor } from "./types";

const BenefitForm = ({ open, onOpenChange, benefit, onSuccess }: BenefitFormProps) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  const form = useForm<BenefitFormData>({
    resolver: zodResolver(benefitFormSchema),
    defaultValues: benefit ? {
      vendor_id: benefit.vendor_id,
      coupon_codes: benefit.coupon_code,
      expiry_date: benefit.expiry_date,
      user_type: benefit.user_type,
    } : {
      vendor_id: "",
      coupon_codes: "",
      expiry_date: "",
      user_type: "all",
    },
  });

  useEffect(() => {
    const fetchVendors = async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("id, name");
      
      if (error) {
        toast.error("Failed to load vendors");
        return;
      }
      
      setVendors(data);
    };

    fetchVendors();
  }, []);

  const onSubmit = async (values: BenefitFormData) => {
    try {
      const couponCodes = values.coupon_codes
        .split("\n")
        .map(code => code.trim())
        .filter(code => code.length > 0);

      if (benefit) {
        // Update existing benefit
        const { error } = await supabase
          .from("benefits")
          .update({
            vendor_id: values.vendor_id,
            coupon_code: couponCodes[0], // Only update first code for existing benefit
            expiry_date: values.expiry_date || null,
            user_type: values.user_type || null,
          })
          .eq("id", benefit.id);
        
        if (error) throw error;
        toast.success("Benefit updated successfully");
      } else {
        // Insert new benefits (one per coupon code)
        const { error } = await supabase
          .from("benefits")
          .insert(couponCodes.map(code => ({
            vendor_id: values.vendor_id,
            coupon_code: code,
            expiry_date: values.expiry_date || null,
            user_type: values.user_type || null,
            is_active: true,
          })));
        
        if (error) throw error;
        toast.success(`${couponCodes.length} benefit(s) added successfully`);
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
          <DialogTitle>{benefit ? "Edit Benefit" : "Add New Benefits"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormFields form={form} vendors={vendors} />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {benefit ? "Update" : "Add"} Benefit{!benefit && "s"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BenefitForm;