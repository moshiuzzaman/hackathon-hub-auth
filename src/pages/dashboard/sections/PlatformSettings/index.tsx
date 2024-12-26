import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type PlatformSetting = {
  id: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
};

const PlatformSettings = () => {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const { data: settings, refetch } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as PlatformSetting[];
    },
  });

  const handleAddSetting = async () => {
    try {
      const { error } = await supabase.from("platform_settings").insert({
        key: newKey,
        value: JSON.parse(newValue),
      });

      if (error) throw error;

      toast.success("Setting added successfully");
      setNewKey("");
      setNewValue("");
      refetch();
    } catch (error) {
      toast.error("Failed to add setting. Make sure the value is valid JSON.");
    }
  };

  const handleUpdateSetting = async (id: string, value: string) => {
    try {
      const { error } = await supabase
        .from("platform_settings")
        .update({ value: JSON.parse(value) })
        .eq("id", id);

      if (error) throw error;

      toast.success("Setting updated successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to update setting. Make sure the value is valid JSON.");
    }
  };

  const handleDeleteSetting = async (id: string) => {
    try {
      const { error } = await supabase
        .from("platform_settings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Setting deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete setting");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Setting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Setting Key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
              <Input
                placeholder="Setting Value (JSON)"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
            <Button onClick={handleAddSetting} disabled={!newKey || !newValue}>
              Add Setting
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {settings?.map((setting) => (
          <Card key={setting.id}>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{setting.key}</h3>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSetting(setting.id)}
                  >
                    Delete
                  </Button>
                </div>
                <Input
                  defaultValue={JSON.stringify(setting.value)}
                  onBlur={(e) => handleUpdateSetting(setting.id, e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlatformSettings;