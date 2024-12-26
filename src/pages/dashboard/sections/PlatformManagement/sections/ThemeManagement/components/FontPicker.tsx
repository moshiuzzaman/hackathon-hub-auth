import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface FontPickerProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export const FontPicker = ({ value, onChange }: FontPickerProps) => {
  const handleAdd = () => {
    onChange([...value, ""]);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, newValue: string) => {
    onChange(value.map((v, i) => (i === index ? newValue : v)));
  };

  return (
    <div className="space-y-2">
      {value.map((font, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={font}
            onChange={(e) => handleChange(index, e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleRemove(index)}
            disabled={value.length <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Font
      </Button>
    </div>
  );
};