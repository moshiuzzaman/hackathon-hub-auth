import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditUserForm } from "./EditUserForm";
import { UserProfile, EditUserFormValues } from "./types";

interface EditUserDialogProps {
  user: UserProfile | null;
  onClose: () => void;
  onSubmit: (data: EditUserFormValues) => Promise<void>;
}

export const EditUserDialog = ({ user, onClose, onSubmit }: EditUserDialogProps) => {
  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the user's information.
          </DialogDescription>
        </DialogHeader>
        <EditUserForm
          user={user}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};