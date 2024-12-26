import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, X, ExternalLink } from "lucide-react";
import { type Profile } from "../types";

interface MentorTableProps {
  pendingMentors: Profile[] | null;
  onApprove: (mentor: Profile) => void;
  onReject: (mentor: Profile) => void;
}

const MentorTable = ({ pendingMentors, onApprove, onReject }: MentorTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Profile</TableHead>
          <TableHead>GitHub</TableHead>
          <TableHead>LinkedIn</TableHead>
          <TableHead>Applied On</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pendingMentors?.map((mentor) => (
          <TableRow key={mentor.id}>
            <TableCell className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={mentor.photo_url} />
                <AvatarFallback>
                  {mentor.full_name?.charAt(0) || "M"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{mentor.full_name}</div>
                <Badge variant="outline">Pending</Badge>
              </div>
            </TableCell>
            <TableCell>
              {mentor.github_username && (
                <a
                  href={`https://github.com/${mentor.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-500 hover:underline"
                >
                  {mentor.github_username}
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </TableCell>
            <TableCell>
              {mentor.linkedin_username && (
                <a
                  href={`https://linkedin.com/in/${mentor.linkedin_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-500 hover:underline"
                >
                  {mentor.linkedin_username}
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </TableCell>
            <TableCell>
              {new Date(mentor.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => onApprove(mentor)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onReject(mentor)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {(!pendingMentors || pendingMentors.length === 0) && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8">
              No pending mentor applications
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default MentorTable;