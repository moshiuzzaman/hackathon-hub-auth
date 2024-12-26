import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface JoinTeamFormProps {
  onSubmit: (code: string) => void;
  isLoading: boolean;
}

const JoinTeamForm = ({ onSubmit, isLoading }: JoinTeamFormProps) => {
  const [joinCode, setJoinCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(joinCode);
    setJoinCode("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join a Team</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" disabled={isLoading || !joinCode}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Join Team
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default JoinTeamForm;