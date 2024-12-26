import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { SmtpConfig } from "./types";

export const SmtpSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: smtpSetting, refetch } = useQuery({
    queryKey: ["smtp-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .eq("key", "smtp_config")
        .single();

      if (error) throw error;
      return data;
    },
  });

  const [config, setConfig] = useState<SmtpConfig>(
    (smtpSetting?.value as SmtpConfig) || {
      host: "",
      port: 587,
      secure: true,
      auth: { user: "", pass: "" },
    }
  );

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("platform_settings")
        .update({ value: config })
        .eq("key", "smtp_config");

      if (error) throw error;

      toast.success("SMTP settings updated successfully");
      refetch();
    } catch (error: any) {
      toast.error("Failed to update SMTP settings");
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("test-smtp", {
        body: config,
      });

      if (error) throw error;

      if (data.success) {
        toast.success("SMTP connection test successful");
      } else {
        toast.error(`SMTP connection test failed: ${data.error}`);
      }
    } catch (error: any) {
      toast.error(`Failed to test SMTP connection: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMTP Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="host">SMTP Host</Label>
            <Input
              id="host"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              placeholder="smtp.example.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="port">SMTP Port</Label>
            <Input
              id="port"
              type="number"
              value={config.port}
              onChange={(e) =>
                setConfig({ ...config, port: parseInt(e.target.value) })
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="secure"
              checked={config.secure}
              onCheckedChange={(checked) =>
                setConfig({ ...config, secure: checked })
              }
            />
            <Label htmlFor="secure">Use SSL/TLS</Label>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={config.auth.user}
              onChange={(e) =>
                setConfig({
                  ...config,
                  auth: { ...config.auth, user: e.target.value },
                })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={config.auth.pass}
              onChange={(e) =>
                setConfig({
                  ...config,
                  auth: { ...config.auth, pass: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave}>Save Settings</Button>
          <Button 
            variant="outline" 
            onClick={handleTestConnection}
            disabled={isLoading}
          >
            {isLoading ? "Testing..." : "Test Connection"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};