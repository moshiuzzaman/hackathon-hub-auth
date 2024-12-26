import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Control } from "react-hook-form";
import type { ThemeFormData } from "../types";

interface FontFieldProps {
  control: Control<ThemeFormData>;
  fontKey: keyof ThemeFormData["fonts"];
  label: string;
}

const GOOGLE_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Source Sans Pro",
  "Raleway",
  "Ubuntu",
  "Playfair Display"
];

export const FontField = ({ control, fontKey, label }: FontFieldProps) => {
  return (
    <FormField
      control={control}
      name={`fonts.${String(fontKey)}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="capitalize">{label}</FormLabel>
          <div className="space-y-2">
            {field.value.map((font: string, index: number) => (
              <div key={index} className="flex gap-2">
                <FormControl>
                  <select
                    className="w-full h-10 px-3 py-2 border rounded-md"
                    value={font}
                    onChange={(e) => {
                      const newValue = [...field.value];
                      newValue[index] = e.target.value;
                      field.onChange(newValue);
                    }}
                  >
                    {GOOGLE_FONTS.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newValue = field.value.filter((_, i) => i !== index);
                    field.onChange(newValue);
                  }}
                  disabled={field.value.length <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                field.onChange([...field.value, GOOGLE_FONTS[0]]);
              }}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Font Fallback
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};