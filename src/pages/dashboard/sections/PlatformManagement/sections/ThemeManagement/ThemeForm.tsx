import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ColorField } from "./components/ColorPicker";
import { FontField } from "./components/FontPicker";
import type { Theme, ThemeFormData } from "./types/theme";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["default", "custom"]).default("custom"),
  is_active: z.boolean().default(false),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
  }),
  fonts: z.object({
    primary: z.array(z.string()),
  }),
});

interface ThemeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTheme: Theme | null;
  onClose: () => void;
}

const ThemeForm = ({ open, onOpenChange, selectedTheme, onClose }: ThemeFormProps) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ThemeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: selectedTheme?.name ?? "",
      type: "custom",
      colors: selectedTheme?.colors ?? {
        primary: "#8B5CF6",
        secondary: "#E5DEFF",
      },
      fonts: selectedTheme?.fonts ?? {
        primary: ["Inter", "sans-serif"],
      },
      is_active: selectedTheme?.is_active ?? false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ThemeFormData) => {
      setIsLoading(true);
      try {
        if (selectedTheme) {
          const { error } = await supabase
            .from("themes")
            .update({
              name: values.name,
              type: values.type,
              is_active: values.is_active,
              colors: values.colors,
              fonts: values.fonts,
              updated_at: new Date().toISOString(),
            })
            .eq("id", selectedTheme.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("themes").insert([{
            name: values.name,
            type: values.type,
            is_active: values.is_active,
            colors: values.colors,
            fonts: values.fonts,
          }]);
          if (error) throw error;
        }
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      toast.success(selectedTheme ? "Theme updated successfully" : "Theme created successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(selectedTheme ? "Failed to update theme" : "Failed to create theme");
      console.error(error);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedTheme ? "Edit Theme" : "Create Theme"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Active</FormLabel>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Colors</h3>
              <div className="grid grid-cols-2 gap-4">
                <ColorField
                  control={form.control}
                  colorKey="primary"
                  label="Primary Color"
                />
                <ColorField
                  control={form.control}
                  colorKey="secondary"
                  label="Secondary Color"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Fonts</h3>
              <FontField
                control={form.control}
                fontKey="primary"
                label="Primary Font"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {selectedTheme ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeForm;