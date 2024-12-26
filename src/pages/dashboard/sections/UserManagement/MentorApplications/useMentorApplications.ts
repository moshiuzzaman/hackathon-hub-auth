import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type Profile } from "../types";

export const useMentorApplications = () => {
  const [selectedMentor, setSelectedMentor] = useState<Profile | null>(null);
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
      return data as Profile[];
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

  const handleApprove = (mentor: Profile) => {
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

  return {
    pendingMentors,
    isLoading,
    selectedMentor,
    rejectionReason,
    setSelectedMentor,
    setRejectionReason,
    handleApprove,
    handleReject,
  };
};