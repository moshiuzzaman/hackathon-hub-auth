import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const githubConfigSchema = z.object({
  org_name: z.string().min(1, "Organization name is required"),
  participant_team_slug: z.string().min(1, "Participant team slug is required"),
  mentor_team_slug: z.string().min(1, "Mentor team slug is required"),
  personal_access_token: z.string().min(1, "Personal access token is required"),
});

type GithubConfig = z.infer<typeof githubConfigSchema>;

const GithubSettings = () => {
  const queryClient = useQueryClient();

  const form = useForm<GithubConfig>({
    resolver: zodResolver(githubConfigSchema),
    defaultValues: {
      org_name: "",
      participant_team_slug: "",
      mentor_team_slug: "",
      personal_access_token: "",
    },
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["github-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "github_config")
        .single();

      if (error) throw error;
      return data?.value as GithubConfig;
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: GithubConfig) => {
      const { error } = await supabase
        .from("platform_settings")
        .update({ value: values })
        .eq("key", "github_config");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["github-settings"] });
      toast.success("GitHub settings updated successfully");
    },
    onError: (error) => {
      console.error("Error updating GitHub settings:", error);
      toast.error("Failed to update GitHub settings");
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const onSubmit = (values: GithubConfig) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>GitHub Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="org_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., my-github-org" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participant_team_slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participant Team Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., participants" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mentor_team_slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mentor Team Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., mentors" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personal_access_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Access Token</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="GitHub Personal Access Token"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={mutation.isPending}>
              Save Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GithubSettings;