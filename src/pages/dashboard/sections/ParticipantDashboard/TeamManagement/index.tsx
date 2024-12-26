import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Loader2 } from "lucide-react";

const TeamManagement = () => {
  const { session } = useSessionContext();
  const queryClient = useQueryClient();
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");

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
            mentor:mentor_id (
              full_name
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
    mutationFn: async () => {
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert([
          {
            name: teamName,
            leader_id: session?.user.id,
          },
        ])
        .select()
        .single();

      if (teamError) throw teamError;

      const { error: memberError } = await supabase
        .from("team_members")
        .insert([
          {
            team_id: team.id,
            user_id: session?.user.id,
          },
        ]);

      if (memberError) throw memberError;
      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-member"] });
      toast.success("Team created successfully!");
      setTeamName("");
    },
    onError: (error) => {
      toast.error("Failed to create team");
      console.error(error);
    },
  });

  // Join team mutation
  const joinTeam = useMutation({
    mutationFn: async () => {
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("id")
        .eq("join_code", joinCode)
        .single();

      if (teamError) throw teamError;

      const { error: memberError } = await supabase
        .from("team_members")
        .insert([
          {
            team_id: team.id,
            user_id: session?.user.id,
          },
        ]);

      if (memberError) throw memberError;
      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-member"] });
      toast.success("Joined team successfully!");
      setJoinCode("");
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (teamMember?.teams) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-lg font-semibold">{teamMember.teams.name}</p>
            <p className="text-sm text-muted-foreground">
              Team Code: {teamMember.teams.join_code}
            </p>
            {teamMember.teams.mentor && (
              <p className="text-sm text-muted-foreground">
                Mentor: {teamMember.teams.mentor.full_name}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`h-2 w-2 rounded-full ${
                teamMember.teams.is_ready ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
            <span className="text-sm">
              Status: {teamMember.teams.is_ready ? "Ready" : "Not Ready"}
            </span>
          </div>
          <Button onClick={() => toggleReadiness.mutate()}>
            {teamMember.teams.is_ready ? "Mark as Not Ready" : "Mark as Ready"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create a Team</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createTeam.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                required
              />
            </div>
            <Button type="submit" disabled={createTeam.isPending}>
              {createTeam.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Team
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Join a Team</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              joinTeam.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="joinCode">Team Code</Label>
              <Input
                id="joinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter team code"
                required
              />
            </div>
            <Button type="submit" disabled={joinTeam.isPending}>
              {joinTeam.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Join Team
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagement;