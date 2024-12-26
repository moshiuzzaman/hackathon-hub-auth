import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon URL is required").url("Must be a valid URL"),
});

type FormData = z.infer<typeof formSchema>;

interface TechnologyStackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stack?: any;
}

const TechnologyStackForm = ({ open, onOpenChange, stack }: TechnologyStackFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: stack?.name || "",
      icon: stack?.icon || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormData) => {
      if (stack) {
        const { error } = await supabase
          .from("technology_stacks")
          .update(values)
          .eq("id", stack.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("technology_stacks")
          .insert([values]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technology-stacks"] });
      toast.success(
        stack ? "Technology stack updated successfully" : "Technology stack added successfully"
      );
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(
        stack ? "Failed to update technology stack" : "Failed to add technology stack"
      );
      console.error(error);
    },
  });

  const onSubmit = (values: FormData) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {stack ? "Edit Technology Stack" : "Add Technology Stack"}
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
                    <Input placeholder="React" {...field} />
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
                    <Input
                      placeholder="https://example.com/react-icon.svg"
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
                {stack ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TechnologyStackForm;