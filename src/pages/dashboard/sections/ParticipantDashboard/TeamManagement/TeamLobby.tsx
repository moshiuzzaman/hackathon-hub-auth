import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { TeamWithDetails } from "./types";

const TeamLobby = () => {
  const { session } = useSessionContext();
  const queryClient = useQueryClient();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Fetch teams that are looking for members
  const { data: teams, isLoading } = useQuery({
    queryKey: ["teams-lobby"],
    queryFn: async () => {
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select(`
          id,
          name,
          description,
          looking_for_members,
          max_members,
          members:team_members(id),
          leader:profiles!teams_leader_id_fkey(
            id,
            full_name
          ),
          stack:technology_stacks(
            id,
            name
          )
        `)
        .eq("looking_for_members", true);

      if (teamsError) throw teamsError;

      // Transform the data to include member count
      return teamsData.map(team => ({
        ...team,
        members: {
          count: team.members?.length || 0
        }
      }));
    },
  });

  // Join team mutation
  const joinTeam = useMutation({
    mutationFn: async (teamId: string) => {
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: teamId,
          user_id: session?.user.id,
        });

      if (memberError) throw memberError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams-lobby"] });
      queryClient.invalidateQueries({ queryKey: ["team-member"] });
      toast.success("Successfully joined team!");
    },
    onError: (error) => {
      toast.error("Failed to join team. You might already be in another team.");
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Teams Looking for Members</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams?.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{team.name}</span>
                <Badge variant="secondary">
                  {team.members?.count || 0}/{team.max_members} members
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {team.description && (
                <p className="text-sm text-muted-foreground">{team.description}</p>
              )}
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Leader:</span>{" "}
                  {team.leader?.full_name || "Unknown"}
                </p>
                {team.stack && (
                  <p className="text-sm">
                    <span className="font-medium">Stack:</span> {team.stack.name}
                  </p>
                )}
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setSelectedTeamId(team.id);
                  joinTeam.mutate(team.id);
                }}
                disabled={joinTeam.isPending && selectedTeamId === team.id}
              >
                {joinTeam.isPending && selectedTeamId === team.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Join Team
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeamLobby;