import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserCircle2 } from "lucide-react";
import { TeamWithDetails } from "./types";

interface TeamDetailsProps {
  team: TeamWithDetails;
  onToggleReadiness: () => void;
  onDeleteTeam: () => void;
  isLoading: boolean;
}

const TeamDetails = ({ team, onToggleReadiness, onDeleteTeam, isLoading }: TeamDetailsProps) => {
  const canMarkReady = team.members && team.members.length >= 3;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Team</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-lg font-semibold">{team.name}</p>
          <p className="text-sm text-muted-foreground">Team Code: {team.join_code}</p>
          {team.stack && (
            <p className="text-sm text-muted-foreground">
              Stack: {team.stack.name}
            </p>
          )}
          {team.mentor && (
            <p className="text-sm text-muted-foreground">
              Mentor: {team.mentor.full_name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Team Members:</h4>
          {team.members?.map((member) => (
            <div key={member.id} className="flex items-center space-x-2">
              <UserCircle2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{member.profile.full_name}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={`h-2 w-2 rounded-full ${
              team.is_ready ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          <span className="text-sm">
            Status: {team.is_ready ? "Ready" : "Not Ready"}
          </span>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={onToggleReadiness} 
            disabled={isLoading || !canMarkReady}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {team.is_ready ? "Mark as Not Ready" : "Mark as Ready"}
          </Button>
          {!canMarkReady && (
            <p className="text-sm text-destructive">
              Team needs at least 3 members to be marked as ready
            </p>
          )}
          <Button 
            variant="destructive" 
            onClick={onDeleteTeam}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Team
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamDetails;