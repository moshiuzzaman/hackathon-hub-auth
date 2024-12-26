import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { TechnologyStack } from "./types";

interface CreateTeamFormProps {
  onSubmit: (name: string, stackId: string) => void;
  isLoading: boolean;
  stacks: TechnologyStack[];
}

const CreateTeamForm = ({ onSubmit, isLoading, stacks }: CreateTeamFormProps) => {
  const [teamName, setTeamName] = useState("");
  const [stackId, setStackId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(teamName, stackId);
    setTeamName("");
    setStackId("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Team</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="space-y-2">
            <Label htmlFor="stack">Technology Stack</Label>
            <Select
              value={stackId}
              onValueChange={setStackId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a technology stack" />
              </SelectTrigger>
              <SelectContent>
                {stacks.map((stack) => (
                  <SelectItem key={stack.id} value={stack.id}>
                    {stack.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isLoading || !teamName || !stackId}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Team
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateTeamForm;