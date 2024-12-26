import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type Profile } from "../types";

interface RejectionDialogProps {
  selectedMentor: Profile | null;
  rejectionReason: string;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

const RejectionDialog = ({
  selectedMentor,
  rejectionReason,
  onReasonChange,
  onClose,
  onConfirm,
}: RejectionDialogProps) => {
  return (
    <Dialog open={!!selectedMentor} onOpenChange={() => onClose()}>
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
          onChange={(e) => onReasonChange(e.target.value)}
          className="min-h-[100px]"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!rejectionReason.trim()}
          >
            Reject Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectionDialog;