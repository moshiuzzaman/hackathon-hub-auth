import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import type { TechnologyStack } from "./types";

interface CreateTeamFormProps {
  stacks: TechnologyStack[];
  onSubmit: (name: string, stackId: string, description: string, lookingForMembers: boolean) => void;
  isLoading: boolean;
}

const CreateTeamForm = ({ stacks, onSubmit, isLoading }: CreateTeamFormProps) => {
  const [name, setName] = useState("");
  const [stackId, setStackId] = useState("");
  const [description, setDescription] = useState("");
  const [lookingForMembers, setLookingForMembers] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, stackId, description, lookingForMembers);
    setName("");
    setStackId("");
    setDescription("");
    setLookingForMembers(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Team</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter team name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stack">Technology Stack</Label>
            <select
              id="stack"
              value={stackId}
              onChange={(e) => setStackId(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select a stack</option>
              {stacks.map((stack) => (
                <option key={stack.id} value={stack.id}>
                  {stack.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what kind of team members you're looking for..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="looking-for-members"
              checked={lookingForMembers}
              onCheckedChange={setLookingForMembers}
            />
            <Label htmlFor="looking-for-members">Looking for team members</Label>
          </div>
          <Button type="submit" disabled={isLoading || !name || !stackId}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Team
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateTeamForm;