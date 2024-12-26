import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BenefitFormProps, BenefitFormValues, benefitFormSchema } from "./types";

export const BenefitForm = ({ initialData, onSuccess, onCancel }: BenefitFormProps) => {
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

      // Split coupon codes into an array and create a benefit for each code
      const couponCodes = values.coupon_codes
        .split("\n")
        .map(code => code.trim())
        .filter(code => code.length > 0);

      if (initialData) {
        // Update existing benefit
        const { error } = await supabase
          .from("benefits")
          .update({
            vendor_id: values.vendor_id,
            coupon_code: couponCodes[0], // Only use first code when updating
            expiry_date: values.expiry_date || null,
            user_type: values.user_type,
            is_active: values.is_active,
          })
          .eq("id", initialData.id);

        if (error) throw error;
      } else {
        // Create new benefits for each coupon code
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
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="vendor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vendor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vendors?.map((vendor) => (
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
          name="coupon_codes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coupon Code{!initialData && "s"}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={initialData ? "Enter coupon code" : "Enter coupon codes (one per line)"}
                  disabled={isSubmitting}
                  {...field}
                />
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
                <Input
                  type="datetime-local"
                  disabled={isSubmitting}
                  {...field}
                />
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
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="mentor">Mentors Only</SelectItem>
                  <SelectItem value="participant">Participants Only</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormLabel className="!mt-0">Active</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
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
  );
};