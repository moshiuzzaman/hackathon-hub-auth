import { Button } from "@/components/ui/button";
import { VendorSelect } from "./VendorSelect";
import { UseFormReturn } from "react-hook-form";
import { Vendor } from "../types";

interface AutoAssignmentTabProps {
  form: UseFormReturn<any>;
  vendors: Vendor[];
  selectedVendor: string;
  onVendorSelect: (vendorId: string) => void;
  onCancel: () => void;
  onAutoAssignParticipants: () => void;
  onAutoAssignMentors: () => void;
  isLoadingBenefits: boolean;
  unassignedBenefitsCount: number;
}

export const AutoAssignmentTab = ({
  form,
  vendors,
  selectedVendor,
  onVendorSelect,
  onCancel,
  onAutoAssignParticipants,
  onAutoAssignMentors,
  isLoadingBenefits,
  unassignedBenefitsCount,
}: AutoAssignmentTabProps) => {
  return (
    <div className="space-y-6">
      <VendorSelect
        form={form}
        vendors={vendors}
        onVendorSelect={onVendorSelect}
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
          onClick={onAutoAssignParticipants}
          disabled={!selectedVendor}
        >
          Auto-assign to Participants
        </Button>
        <Button
          onClick={onAutoAssignMentors}
          disabled={!selectedVendor}
        >
          Auto-assign to Mentors
        </Button>
      </div>
    </div>
  );
};