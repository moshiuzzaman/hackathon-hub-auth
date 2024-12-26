import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Control } from "react-hook-form";
import type { ThemeFormData } from "../types";

interface ColorFieldProps {
  control: Control<ThemeFormData>;
  colorKey: keyof ThemeFormData["colors"];
  label: string;
}

export const ColorField = ({ control, colorKey, label }: ColorFieldProps) => {
  return (
    <FormField
      control={control}
      name={`colors.${String(colorKey)}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="flex gap-2">
            <FormControl>
              <Input {...field} type="color" className="h-10 w-20 p-1" />
            </FormControl>
            <Input 
              value={field.value}
              onChange={field.onChange}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};