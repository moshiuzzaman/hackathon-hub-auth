import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const MentorApplications = () => {
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const queryClient = useQueryClient();

  const { data: pendingMentors, isLoading } = useQuery({
    queryKey: ["pendingMentors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "mentor")
        .eq("mentor_status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (mentorId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          mentor_status: "approved",
          mentor_approval_date: new Date().toISOString(),
        })
        .eq("id", mentorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingMentors"] });
      toast.success("Mentor application approved");
      setSelectedMentor(null);
    },
    onError: (error) => {
      toast.error("Failed to approve mentor application");
      console.error("Error approving mentor:", error);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ mentorId, reason }: { mentorId: string; reason: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          mentor_status: "rejected",
          rejection_reason: reason,
        })
        .eq("id", mentorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingMentors"] });
      toast.success("Mentor application rejected");
      setSelectedMentor(null);
      setRejectionReason("");
    },
    onError: (error) => {
      toast.error("Failed to reject mentor application");
      console.error("Error rejecting mentor:", error);
    },
  });

  const handleApprove = (mentor: any) => {
    approveMutation.mutate(mentor.id);
  };

  const handleReject = () => {
    if (!selectedMentor || !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    rejectMutation.mutate({
      mentorId: selectedMentor.id,
      reason: rejectionReason.trim(),
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Mentor Applications</CardTitle>
        <CardDescription>
          Review and manage mentor applications
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                      onClick={() => handleApprove(mentor)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setSelectedMentor(mentor)}
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
      </CardContent>

      <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Mentor Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this mentor application.
              This will be shown to the applicant.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedMentor(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MentorApplications;