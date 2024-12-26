import { z } from "zod";

export const benefitFormSchema = z.object({
  vendor_id: z.string().min(1, "Please select a vendor"),
  coupon_codes: z.string().min(1, "Please enter at least one coupon code"),
  expiry_date: z.string().optional(),
  user_type: z.enum(["all", "mentor", "participant"]),
  is_active: z.boolean().default(true),
});

export type BenefitFormValues = z.infer<typeof benefitFormSchema>;

export interface BenefitFormProps {
  initialData?: {
    id: string;
    vendor_id: string;
    coupon_code: string;
    expiry_date: string | null;
    user_type: string;
    is_active: boolean;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}