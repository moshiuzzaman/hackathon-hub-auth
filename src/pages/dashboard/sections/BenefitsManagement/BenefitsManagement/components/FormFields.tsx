import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { BenefitFormData } from "../types";

interface FormFieldsProps {
  form: UseFormReturn<BenefitFormData>;
  vendors: Array<{ id: string; name: string }>;
}

export const FormFields = ({ form, vendors }: FormFieldsProps) => {
  return (
    <div className="space-y-4">
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
        name="coupon_codes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Coupon Codes (one per line)</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                className="min-h-[120px]"
                placeholder="Enter coupon codes, one per line"
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
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="mentor">Mentors Only</SelectItem>
                <SelectItem value="participant">Participants Only</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};