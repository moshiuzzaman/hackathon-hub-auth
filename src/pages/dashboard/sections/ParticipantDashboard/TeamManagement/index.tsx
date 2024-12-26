import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateTeamForm from "./CreateTeamForm";
import JoinTeamForm from "./JoinTeamForm";
import TeamDetails from "./TeamDetails";
import TeamLobby from "./TeamLobby";
import type { TeamWithDetails } from "./types";

const TeamManagement = () => {
  const { session } = useSessionContext();
  const queryClient = useQueryClient();
  const [showLobby, setShowLobby] = useState(false);

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
            description,
            looking_for_members,
            max_members,
            leader_id,
            stack:technology_stacks (
              id,
              name
            ),
            mentor:profiles!teams_mentor_id_fkey (
              full_name
            ),
            members:team_members (
              id,
              profile:profiles!team_members_user_id_fkey (
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
    mutationFn: async ({
      name,
      stackId,
      description,
      lookingForMembers,
    }: {
      name: string;
      stackId: string;
      description: string;
      lookingForMembers: boolean;
    }) => {
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
          name,
          stack_id: stackId,
          leader_id: session?.user.id,
          description,
          looking_for_members: lookingForMembers,
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

  if (showLobby) {
    return (
      <div className="space-y-4">
        <Button onClick={() => setShowLobby(false)}>Back to Team Management</Button>
        <TeamLobby />
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
      <Button onClick={() => setShowLobby(true)}>Browse Teams</Button>
      <CreateTeamForm
        stacks={[]}
        onSubmit={(name, stackId, description, lookingForMembers) =>
          createTeam.mutate({ name, stackId, description, lookingForMembers })
        }
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