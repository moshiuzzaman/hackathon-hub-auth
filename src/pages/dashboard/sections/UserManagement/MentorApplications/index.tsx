import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MentorTable from "./MentorTable";
import RejectionDialog from "./RejectionDialog";
import { useMentorApplications } from "./useMentorApplications";

const MentorApplications = () => {
  const {
    pendingMentors,
    isLoading,
    selectedMentor,
    rejectionReason,
    setSelectedMentor,
    setRejectionReason,
    handleApprove,
    handleReject,
  } = useMentorApplications();

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
        <MentorTable
          pendingMentors={pendingMentors}
          onApprove={handleApprove}
          onReject={setSelectedMentor}
        />
        
        <RejectionDialog
          selectedMentor={selectedMentor}
          rejectionReason={rejectionReason}
          onReasonChange={setRejectionReason}
          onClose={() => {
            setSelectedMentor(null);
            setRejectionReason("");
          }}
          onConfirm={handleReject}
        />
      </CardContent>
    </Card>
  );
};

export default MentorApplications;