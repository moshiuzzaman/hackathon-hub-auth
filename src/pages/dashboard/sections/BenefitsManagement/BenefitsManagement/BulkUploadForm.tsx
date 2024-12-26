import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface BulkUploadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const BulkUploadForm = ({ open, onOpenChange, onSuccess }: BulkUploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') return;

        const rows = text.split('\n').filter(row => row.trim());
        const headers = rows[0].split(',');
        const benefits = rows.slice(1).map(row => {
          const values = row.split(',');
          const benefit: any = {};
          headers.forEach((header, index) => {
            benefit[header.trim()] = values[index]?.trim();
          });
          return benefit;
        });

        const { error } = await supabase
          .from('benefits')
          .insert(benefits);

        if (error) throw error;

        toast.success(`Successfully uploaded ${benefits.length} benefits`);
        onSuccess();
        onOpenChange(false);
      };
      reader.readAsText(file);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Upload Benefits</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Upload a CSV file with the following headers: provider_name, provider_website, coupon_code, redemption_instructions, expiry_date, user_type, vendor_id
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadForm;