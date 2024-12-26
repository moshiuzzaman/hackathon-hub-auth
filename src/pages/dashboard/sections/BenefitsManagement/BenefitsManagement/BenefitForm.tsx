import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FormFields } from "./components/FormFields";
import { BenefitFormProps, BenefitFormValues, benefitFormSchema } from "./types";

export const BenefitForm = ({ initialData, open, onOpenChange, onSuccess }: BenefitFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BenefitFormValues>({
    resolver: zodResolver(benefitFormSchema),
    defaultValues: {
      vendor_id: initialData?.vendor_id || "",
      coupon_codes: initialData?.coupon_code || "",
      expiry_date: initialData?.expiry_date || "",
      user_type: (initialData?.user_type as "all" | "mentor" | "participant") || "all",
      is_active: initialData?.is_active ?? true,
    },
  });

  const { data: vendors } = useQuery({
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

  const onSubmit = async (values: BenefitFormValues) => {
    try {
      setIsSubmitting(true);

      const couponCodes = values.coupon_codes
        .split("\n")
        .map(code => code.trim())
        .filter(code => code.length > 0);

      if (initialData) {
        const { error } = await supabase
          .from("benefits")
          .update({
            vendor_id: values.vendor_id,
            coupon_code: couponCodes[0],
            expiry_date: values.expiry_date || null,
            user_type: values.user_type,
            is_active: values.is_active,
            provider_name: "",
            provider_website: "",
            redemption_instructions: "",
          })
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        const benefitsToInsert = couponCodes.map(code => ({
          vendor_id: values.vendor_id,
          coupon_code: code,
          expiry_date: values.expiry_date || null,
          user_type: values.user_type,
          is_active: values.is_active,
          provider_name: "",
          provider_website: "",
          redemption_instructions: "",
        }));

        const { error } = await supabase
          .from("benefits")
          .insert(benefitsToInsert);

        if (error) throw error;
      }

      toast.success(initialData ? "Benefit updated" : "Benefits created");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add"} Benefit</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormFields 
              form={form} 
              vendors={vendors || []}
              isSubmitting={isSubmitting}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {initialData ? "Update" : "Create"} Benefit{!initialData && "s"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BenefitForm;