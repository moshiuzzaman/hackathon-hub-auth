import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import CreateTeamForm from "./CreateTeamForm";
import JoinTeamForm from "./JoinTeamForm";
import TeamDetails from "./TeamDetails";
import type { TeamWithDetails, TechnologyStack } from "./types";

const TeamManagement = () => {
  const { session } = useSessionContext();
  const queryClient = useQueryClient();

  // Fetch technology stacks
  const { data: stacks = [] } = useQuery<TechnologyStack[]>({
    queryKey: ["technology-stacks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("technology_stacks")
        .select("*")
        .eq("is_enabled", true);
      if (error) throw error;
      return data;
    },
  });

  // Fetch user's team information
  const { data: teamMember, isLoading } = useQuery({
    queryKey: ["team-member", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          team_id,
          teams (
            id,
            name,
            is_ready,
            join_code,
            stack:stack_id (
              id,
              name
            ),
            mentor:mentor_id (
              full_name
            ),
            members:team_members (
              id,
              profile:user_id (
                id,
                full_name
              )
            )
          )
        `)
        .eq("user_id", session?.user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Create team mutation
  const createTeam = useMutation({
    mutationFn: async ({ name, stackId }: { name: string; stackId: string }) => {
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
          name,
          stack_id: stackId,
          leader_id: session?.user.id,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: team.id,
          user_id: session?.user.id,
        });

      if (memberError) throw memberError;
      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-member"] });
      toast.success("Team created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create team");
      console.error(error);
    },
  });

  // Join team mutation
  const joinTeam = useMutation({
    mutationFn: async (joinCode: string) => {
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("id")
        .eq("join_code", joinCode)
        .single();

      if (teamError) throw teamError;

      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: team.id,
          user_id: session?.user.id,
        });

      if (memberError) throw memberError;
      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-member"] });
      toast.success("Joined team successfully!");
    },
    onError: (error) => {
      toast.error("Failed to join team. Please check the code and try again.");
      console.error(error);
    },
  });

  // Toggle team readiness mutation
  const toggleReadiness = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("teams")
        .update({ is_ready: !teamMember?.teams?.is_ready })
        .eq("id", teamMember?.teams?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-member"] });
      toast.success("Team status updated!");
    },
    onError: (error) => {
      toast.error("Failed to update team status");
      console.error(error);
    },
  });

  // Delete team mutation
  const deleteTeam = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamMember?.teams?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-member"] });
      toast.success("Team deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete team");
      console.error(error);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (teamMember?.teams) {
    return (
      <TeamDetails
        team={teamMember.teams as TeamWithDetails}
        onToggleReadiness={() => toggleReadiness.mutate()}
        onDeleteTeam={() => deleteTeam.mutate()}
        isLoading={toggleReadiness.isPending || deleteTeam.isPending}
      />
    );
  }

  return (
    <div className="space-y-6">
      <CreateTeamForm
        stacks={stacks}
        onSubmit={(name, stackId) => createTeam.mutate({ name, stackId })}
        isLoading={createTeam.isPending}
      />
      <JoinTeamForm
        onSubmit={(code) => joinTeam.mutate(code)}
        isLoading={joinTeam.isPending}
      />
    </div>
  );
};

export default TeamManagement;