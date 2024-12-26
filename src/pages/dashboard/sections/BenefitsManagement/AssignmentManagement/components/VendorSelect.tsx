import { Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Vendor } from "../types";

interface VendorSelectProps {
  form: UseFormReturn<any>;
  vendors: Vendor[];
  onVendorSelect: (vendorId: string) => void;
}

export const VendorSelect = ({ form, vendors = [], onVendorSelect }: VendorSelectProps) => {
  return (
    <FormField
      control={form.control}
      name="vendorId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Select Vendor</FormLabel>
          <FormControl>
            <Command className="border rounded-md">
              <CommandInput placeholder="Search vendors..." />
              <CommandEmpty>No vendors found.</CommandEmpty>
              <CommandGroup className="max-h-40 overflow-y-auto">
                {vendors.map((vendor) => (
                  <CommandItem
                    key={vendor.id}
                    value={vendor.id}
                    onSelect={() => {
                      field.onChange(vendor.id);
                      onVendorSelect(vendor.id);
                    }}
                  >
                    {vendor.name}
                    {field.value === vendor.id && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </FormControl>
        </FormItem>
      )}
    />
  );
};