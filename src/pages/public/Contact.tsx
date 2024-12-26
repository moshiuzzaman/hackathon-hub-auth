import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const { data: settings } = useQuery({
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

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
        
        <div className="grid gap-8">
          {settings?.email && (
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <a href={`mailto:${settings.email}`} className="text-blue-600 hover:underline">
                  {settings.email}
                </a>
              </div>
            </div>
          )}
          
          {settings?.phone && (
            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Phone</h3>
                <a href={`tel:${settings.phone}`} className="text-blue-600 hover:underline">
                  {settings.phone}
                </a>
              </div>
            </div>
          )}
          
          {settings?.address && (
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Address</h3>
                <p>{settings.address}</p>
              </div>
            </div>
          )}
          
          {settings?.additional_info && (
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Additional Information</h3>
              <p className="text-muted-foreground">{settings.additional_info}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;