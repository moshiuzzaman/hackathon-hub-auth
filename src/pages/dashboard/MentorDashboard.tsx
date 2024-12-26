import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, Settings, Gift } from "lucide-react";
import { toast } from "sonner";
import ProfileSetup from "./sections/MentorDashboard/ProfileSetup";
import PlatformConfig from "./sections/MentorDashboard/PlatformConfig";
import Benefits from "./sections/MentorDashboard/Benefits";

const MentorDashboard = () => {
  const navigate = useNavigate();
  const { session } = useSessionContext();
  const [activeSection, setActiveSection] = useState("profile");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        toast.error("Error loading profile");
        return;
      }

      if (!profile || profile.role !== "mentor") {
        toast.error("Access denied. Mentor privileges required.");
        navigate("/login");
        return;
      }

      setProfile(profile);
    };

    checkAccess();
  }, [session, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const navigationItems = [
    { id: "profile", icon: User, label: "Profile Setup", active: activeSection === "profile" },
    { id: "config", icon: Settings, label: "Platform Configuration", active: activeSection === "config" },
    { id: "benefits", icon: Gift, label: "Benefits", active: activeSection === "benefits" },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSetup profile={profile} />;
      case "config":
        return <PlatformConfig profile={profile} />;
      case "benefits":
        return <Benefits profile={profile} />;
      default:
        return null;
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-sidebar-foreground">Mentor Dashboard</h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center w-full px-4 py-2 text-sm rounded-md transition-colors
                  ${item.active 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="container p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">
                {navigationItems.find(item => item.id === activeSection)?.label}
              </h2>
            </div>
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MentorDashboard;