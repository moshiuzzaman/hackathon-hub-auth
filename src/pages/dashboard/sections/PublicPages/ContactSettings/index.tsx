import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const ContactSettings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: settings, refetch } = useQuery({
    queryKey: ["contact-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const updates = {
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      additional_info: formData.get("additional_info"),
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from("contact_settings")
        .upsert(updates);

      if (error) throw error;

      toast.success("Contact settings updated successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={settings?.email}
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                defaultValue={settings?.phone}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <label htmlFor="address" className="text-sm font-medium">
                Address
              </label>
              <Textarea
                id="address"
                name="address"
                defaultValue={settings?.address}
                placeholder="Enter address"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="additional_info" className="text-sm font-medium">
                Additional Information
              </label>
              <Textarea
                id="additional_info"
                name="additional_info"
                defaultValue={settings?.additional_info}
                placeholder="Enter any additional information"
                rows={4}
              />
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactSettings;