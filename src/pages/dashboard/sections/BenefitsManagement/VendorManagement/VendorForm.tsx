import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  website: z.string().url("Must be a valid URL"),
  icon: z.string().url("Must be a valid URL"),
  redemption_instructions: z.string().min(1, "Redemption instructions are required"),
});

type FormData = z.infer<typeof formSchema>;

interface VendorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: {
    id: string;
    name: string;
    website: string;
    icon: string;
    redemption_instructions: string;
  };
  onSuccess: () => void;
}

const VendorForm = ({ open, onOpenChange, vendor, onSuccess }: VendorFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: vendor?.name || "",
      website: vendor?.website || "",
      icon: vendor?.icon || "",
      redemption_instructions: vendor?.redemption_instructions || "",
    },
  });

  const onSubmit = async (values: FormData) => {
    try {
      if (vendor) {
        const { error } = await supabase
          .from("vendors")
          .update({
            name: values.name,
            website: values.website,
            icon: values.icon,
            redemption_instructions: values.redemption_instructions,
          })
          .eq("id", vendor.id);
        if (error) throw error;
        toast.success("Vendor updated successfully");
      } else {
        const { error } = await supabase
          .from("vendors")
          .insert([{
            name: values.name,
            website: values.website,
            icon: values.icon,
            redemption_instructions: values.redemption_instructions,
          }]);
        if (error) throw error;
        toast.success("Vendor added successfully");
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
          <DialogTitle>
            {vendor ? "Edit Vendor" : "Add Vendor"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Vendor name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/icon.png" {...field} />
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
                    <Textarea 
                      placeholder="Enter instructions for redeeming benefits"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {vendor ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VendorForm;