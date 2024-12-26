import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PlatformConfig = ({ profile }: { profile: any }) => {
  const [maxTeams, setMaxTeams] = useState(profile.max_teams || 1);
  const queryClient = useQueryClient();

  const { data: stacks, isLoading: isLoadingStacks } = useQuery({
    queryKey: ["technology-stacks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("technology_stacks")
        .select("*")
        .eq("is_enabled", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: selectedStacks, isLoading: isLoadingSelected } = useQuery({
    queryKey: ["mentor-stacks", profile.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_stacks")
        .select("stack_id")
        .eq("mentor_id", profile.id);
      if (error) throw error;
      return data.map(item => item.stack_id);
    },
  });

  const updateStack = useMutation({
    mutationFn: async ({ stackId, selected }: { stackId: string; selected: boolean }) => {
      if (selected) {
        const { error } = await supabase
          .from("mentor_stacks")
          .insert({ mentor_id: profile.id, stack_id: stackId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("mentor_stacks")
          .delete()
          .eq("mentor_id", profile.id)
          .eq("stack_id", stackId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-stacks", profile.id] });
      toast.success("Preferences updated");
    },
    onError: () => {
      toast.error("Failed to update preferences");
    },
  });

  const updateMaxTeams = useMutation({
    mutationFn: async (value: number) => {
      const { error } = await supabase
        .from("profiles")
        .update({ max_teams: value })
        .eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Maximum teams updated");
    },
    onError: () => {
      toast.error("Failed to update maximum teams");
    },
  });

  if (isLoadingStacks || isLoadingSelected) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Technology Stacks</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stacks?.map((stack) => (
            <Button
              key={stack.id}
              variant={selectedStacks?.includes(stack.id) ? "default" : "outline"}
              className="h-auto py-4 px-6"
              onClick={() => updateStack.mutate({
                stackId: stack.id,
                selected: !selectedStacks?.includes(stack.id),
              })}
            >
              <div className="flex flex-col items-center space-y-2">
                <img src={stack.icon} alt={stack.name} className="w-8 h-8" />
                <span>{stack.name}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Maximum Teams</h3>
        <div className="flex items-center space-x-4">
          <Input
            type="number"
            min="1"
            max="10"
            value={maxTeams}
            onChange={(e) => setMaxTeams(parseInt(e.target.value))}
            className="w-24"
          />
          <Button
            onClick={() => updateMaxTeams.mutate(maxTeams)}
            disabled={maxTeams === profile.max_teams}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlatformConfig;