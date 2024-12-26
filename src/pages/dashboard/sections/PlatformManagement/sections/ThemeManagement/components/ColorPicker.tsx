import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1"
      />
      <div
        className="w-10 h-10 rounded border"
        style={{
          backgroundColor: `hsl(${value})`,
        }}
      />
    </div>
  );
};