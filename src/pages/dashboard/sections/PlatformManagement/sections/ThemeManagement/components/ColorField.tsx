import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Control } from "react-hook-form";
import type { ThemeFormData } from "../types/theme";

interface ColorFieldProps {
  control: Control<ThemeFormData>;
  colorKey: keyof ThemeFormData["colors"];
  label: string;
}

export const ColorField = ({ control, colorKey, label }: ColorFieldProps) => {
  return (
    <FormField
      control={control}
      name={`colors.${colorKey}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="capitalize">{label}</FormLabel>
          <div className="flex gap-2">
            <FormControl>
              <Input {...field} />
            </FormControl>
            <div
              className="w-10 h-10 rounded border"
              style={{
                backgroundColor: `hsl(${field.value})`,
              }}
            />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};