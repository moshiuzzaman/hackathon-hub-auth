import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Benefits = ({ profile }: { profile: any }) => {
  const { data: benefits, isLoading } = useQuery({
    queryKey: ["mentor-benefits", profile.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("benefit_assignments")
        .select(`
          *,
          benefit:benefits(*)
        `)
        .eq("user_id", profile.id);
      if (error) throw error;
      return data;
    },
  });

  const handleRedeem = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from("benefit_assignments")
        .update({
          is_redeemed: true,
          redeemed_at: new Date().toISOString(),
        })
        .eq("id", assignmentId);

      if (error) throw error;
      toast.success("Benefit redeemed successfully");
    } catch (error) {
      toast.error("Failed to redeem benefit");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {benefits?.map((assignment) => (
          <div
            key={assignment.id}
            className="border rounded-lg p-6 space-y-4"
          >
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {assignment.benefit.provider_name}
              </h3>
              <a
                href={assignment.benefit.provider_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                Visit Provider
              </a>
            </div>

            {assignment.is_redeemed ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Redeemed on {new Date(assignment.redeemed_at).toLocaleDateString()}</span>
                </div>
                <div className="p-4 bg-muted rounded-md">
                  <p className="font-mono text-sm">{assignment.benefit.coupon_code}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {assignment.benefit.redemption_instructions}
                </div>
              </div>
            ) : (
              <Button
                onClick={() => handleRedeem(assignment.id)}
                className="w-full"
              >
                Redeem Benefit
              </Button>
            )}

            {assignment.benefit.expiry_date && (
              <p className="text-sm text-muted-foreground">
                Expires: {new Date(assignment.benefit.expiry_date).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {benefits?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No benefits available at the moment.
        </div>
      )}
    </div>
  );
};

export default Benefits;