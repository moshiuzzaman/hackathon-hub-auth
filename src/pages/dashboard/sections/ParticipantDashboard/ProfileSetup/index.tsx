import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileForm } from "./ProfileForm";
import { Progress } from "@/components/ui/progress";

const ProfileSetup = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const checkProfileStatus = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      setIsCompleted(!!profile?.onboarding_completed);
      setProgress(profile?.onboarding_completed ? 100 : 0);
    };

    checkProfileStatus();
  }, []);

  const handleComplete = () => {
    setIsCompleted(true);
    setProgress(100);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Profile Setup</h2>
        <p className="text-muted-foreground">
          Complete your profile to get started with the platform
        </p>
      </div>

      <div className="space-y-2">
        <Progress value={progress} />
        <p className="text-sm text-muted-foreground">
          Profile completion: {progress}%
        </p>
      </div>

      {!isCompleted && <ProfileForm onComplete={handleComplete} />}

      {isCompleted && (
        <div className="bg-green-50 p-4 rounded-md">
          <p className="text-green-800">
            Profile setup completed! You can now start exploring the platform.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileSetup;