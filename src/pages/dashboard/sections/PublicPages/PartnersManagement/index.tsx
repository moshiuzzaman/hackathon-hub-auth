import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash } from "lucide-react";
import { toast } from "sonner";

const PartnersManagement = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: partners, refetch } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const partner = {
      name: String(formData.get("name")),
      logo_url: String(formData.get("logo_url")),
      website_url: String(formData.get("website_url")),
      display_order: parseInt(String(formData.get("display_order"))) || null,
    };

    try {
      const { error } = await supabase.from("partners").insert(partner);

      if (error) throw error;

      toast.success("Partner added successfully");
      refetch();
      e.currentTarget.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to add partner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("partners").delete().eq("id", id);

      if (error) throw error;

      toast.success("Partner deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete partner");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Partner</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input name="name" placeholder="Partner Name" required />
              <Input name="logo_url" placeholder="Logo URL" required />
              <Input name="website_url" placeholder="Website URL" />
              <Input
                name="display_order"
                type="number"
                placeholder="Display Order"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {partners?.map((partner) => (
              <div
                key={partner.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <h3 className="font-medium">{partner.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Order: {partner.display_order || "N/A"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(partner.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnersManagement;