import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { VendorSelect } from "./VendorSelect";
import { UserSelect } from "./UserSelect";
import { User, Vendor } from "../types";

interface ManualAssignmentTabProps {
  form: UseFormReturn<any>;
  users: User[];
  vendors: Vendor[];
  selectedUsers: string[];
  selectedVendor: string;
  onUserSelect: (userId: string) => void;
  onVendorSelect: (vendorId: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoadingBenefits: boolean;
  unassignedBenefitsCount: number;
}

export const ManualAssignmentTab = ({
  form,
  users,
  vendors,
  selectedUsers,
  selectedVendor,
  onUserSelect,
  onVendorSelect,
  onSubmit,
  onCancel,
  isLoadingBenefits,
  unassignedBenefitsCount,
}: ManualAssignmentTabProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <VendorSelect
          form={form}
          vendors={vendors}
          onVendorSelect={onVendorSelect}
        />

        <UserSelect
          form={form}
          users={users}
          selectedUsers={selectedUsers}
          onUserSelect={onUserSelect}
        />

        {selectedVendor && !isLoadingBenefits && (
          <div className="text-sm text-muted-foreground">
            Available benefits: {unassignedBenefitsCount}
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!selectedVendor || selectedUsers.length === 0}
          >
            Assign Benefits
          </Button>
        </div>
      </form>
    </Form>
  );
};