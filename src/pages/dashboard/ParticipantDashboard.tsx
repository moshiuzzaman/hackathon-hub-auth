import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import ProfileSetup from "./sections/ParticipantDashboard/ProfileSetup";

const ParticipantDashboard = () => {
  const navigate = useNavigate();
  const { session } = useSessionContext();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_completed")
        .eq("id", session.user.id)
        .single();

      if (!profile || profile.role !== "participant") {
        navigate("/login");
        return;
      }

      setIsOnboarded(!!profile.onboarding_completed);
    };

    checkAccess();
  }, [session, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (isOnboarded === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Participant Dashboard
          </h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {!isOnboarded ? (
          <ProfileSetup />
        ) : (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <p className="text-gray-600">Welcome to your dashboard!</p>
            {/* Add more dashboard content here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantDashboard;