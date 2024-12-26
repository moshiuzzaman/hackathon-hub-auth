import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { RegistrationConfig } from "./types";

export const RegistrationSettings = () => {
  const { data: registrationSetting, refetch } = useQuery({
    queryKey: ["registration-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .eq("key", "registration_config")
        .single();

      if (error) throw error;
      return data;
    },
  });

  const [config, setConfig] = useState<RegistrationConfig>(
    (registrationSetting?.value as RegistrationConfig) || {
      enabled: true,
      requireEmailVerification: true,
      allowedDomains: [],
      schedule: {
        enabled: false,
        startDate: null,
        endDate: null,
      },
    }
  );

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("platform_settings")
        .update({ value: config })
        .eq("key", "registration_config");

      if (error) throw error;

      toast.success("Registration settings updated successfully");
      refetch();
    } catch (error: any) {
      toast.error("Failed to update registration settings");
    }
  };

  const handleAddDomain = (domain: string) => {
    if (domain && !config.allowedDomains.includes(domain)) {
      setConfig({
        ...config,
        allowedDomains: [...config.allowedDomains, domain],
      });
    }
  };

  const handleRemoveDomain = (domain: string) => {
    setConfig({
      ...config,
      allowedDomains: config.allowedDomains.filter((d) => d !== domain),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, enabled: checked })
              }
            />
            <Label htmlFor="enabled">Enable Registration</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="emailVerification"
              checked={config.requireEmailVerification}
              onCheckedChange={(checked) =>
                setConfig({ ...config, requireEmailVerification: checked })
              }
            />
            <Label htmlFor="emailVerification">Require Email Verification</Label>
          </div>

          <div className="grid gap-2">
            <Label>Allowed Domains</Label>
            <div className="flex gap-2">
              <Input
                placeholder="example.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddDomain(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={(e) => {
                  const input = e.currentTarget
                    .previousElementSibling as HTMLInputElement;
                  handleAddDomain(input.value);
                  input.value = "";
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {config.allowedDomains.map((domain) => (
                <div
                  key={domain}
                  className="flex items-center gap-1 bg-secondary px-2 py-1 rounded"
                >
                  <span>{domain}</span>
                  <button
                    onClick={() => handleRemoveDomain(domain)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                id="scheduleEnabled"
                checked={config.schedule.enabled}
                onCheckedChange={(checked) =>
                  setConfig({
                    ...config,
                    schedule: { ...config.schedule, enabled: checked },
                  })
                }
              />
              <Label htmlFor="scheduleEnabled">Schedule Registration Period</Label>
            </div>

            {config.schedule.enabled && (
              <div className="grid gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={config.schedule.startDate || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        schedule: {
                          ...config.schedule,
                          startDate: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={config.schedule.endDate || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        schedule: {
                          ...config.schedule,
                          endDate: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <Button onClick={handleSave}>Save Settings</Button>
      </CardContent>
    </Card>
  );
};