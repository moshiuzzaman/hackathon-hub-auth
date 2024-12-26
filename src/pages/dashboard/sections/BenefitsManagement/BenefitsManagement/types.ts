import { z } from "zod";

export const benefitFormSchema = z.object({
  vendor_id: z.string().min(1, "Vendor is required"),
  coupon_codes: z.string().min(1, "At least one coupon code is required"),
  expiry_date: z.string().optional(),
  user_type: z.string().optional(),
});

export type BenefitFormData = z.infer<typeof benefitFormSchema>;

export interface Vendor {
  id: string;
  name: string;
}

export interface BenefitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  benefit?: {
    id: string;
    vendor_id: string;
    coupon_code: string;
    expiry_date?: string;
    user_type?: string;
  };
  onSuccess: () => void;
}