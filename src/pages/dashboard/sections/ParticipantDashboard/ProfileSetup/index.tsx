import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileForm } from "./ProfileForm";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground">
            Profile completion: {progress}%
          </p>
        </div>

        {!isCompleted && <ProfileForm onComplete={handleComplete} />}

        {isCompleted && (
          <div className="bg-green-50 text-green-800 p-4 rounded-md">
            <p>
              Profile setup completed! You can now start exploring the platform.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileSetup;