import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, UserMinus } from "lucide-react";
import { useState } from "react";
import type { TeamWithDetails } from "./types";

interface TeamDetailsProps {
  team: TeamWithDetails;
  onToggleReadiness: () => void;
  onDeleteTeam: () => void;
  isLoading: boolean;
}

const TeamDetails = ({
  team,
  onToggleReadiness,
  onDeleteTeam,
  isLoading,
}: TeamDetailsProps) => {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState(team.description || "");
  const [lookingForMembers, setLookingForMembers] = useState(
    team.looking_for_members || false
  );

  const updateTeam = useMutation({
    mutationFn: async (data: {
      description?: string;
      looking_for_members?: boolean;
    }) => {
      const { error } = await supabase
        .from("teams")
        .update(data)
        .eq("id", team.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-member"] });
      toast.success("Team updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update team");
      console.error(error);
    },
  });

  const kickMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-member"] });
      toast.success("Member removed from team");
    },
    onError: (error) => {
      toast.error("Failed to remove member");
      console.error(error);
    },
  });

  const handleDescriptionUpdate = () => {
    updateTeam.mutate({ description });
  };

  const handleLookingForMembersToggle = (checked: boolean) => {
    setLookingForMembers(checked);
    updateTeam.mutate({ looking_for_members: checked });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{team.name}</span>
            <Badge variant="secondary">
              {team.members?.length || 0}/{team.max_members} members
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Description</Label>
            <div className="flex space-x-2">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your team..."
              />
              <Button onClick={handleDescriptionUpdate}>Update</Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={lookingForMembers}
              onCheckedChange={handleLookingForMembersToggle}
            />
            <Label>Looking for team members</Label>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Team Members</h3>
            <div className="space-y-2">
              {team.members?.map((member) => (
                <div
                  key={member.id}
                  className="flex justify-between items-center p-2 bg-secondary rounded-lg"
                >
                  <span>{member.profile.full_name}</span>
                  {member.profile.id !== team.leader_id && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => kickMember.mutate(member.id)}
                      disabled={kickMember.isPending}
                    >
                      {kickMember.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserMinus className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={onToggleReadiness}
                disabled={isLoading}
              >
                {team.is_ready ? "Mark as Not Ready" : "Mark as Ready"}
              </Button>
              <Button
                variant="destructive"
                onClick={onDeleteTeam}
                disabled={isLoading}
              >
                Delete Team
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamDetails;