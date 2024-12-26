import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Users, Settings, Calendar, Newspaper, Image } from "lucide-react";
import { toast } from "sonner";
import UserManagement from "./sections/UserManagement";
import PlatformManagement from "./sections/PlatformManagement";
import EventManagement from "./sections/EventManagement";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { session } = useSessionContext();
  const [activeSection, setActiveSection] = useState("users");

  useEffect(() => {
    const checkAccess = async () => {
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        toast.error("Access denied. Admin privileges required.");
        navigate("/login");
      }
    };

    checkAccess();
  }, [session, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const navigationItems = [
    { id: "users", icon: Users, label: "User Management", active: activeSection === "users" },
    { id: "platform", icon: Settings, label: "Platform Management", active: activeSection === "platform" },
    { id: "events", icon: Calendar, label: "Event Management", active: activeSection === "events" },
    { id: "news", icon: Newspaper, label: "News Management", active: activeSection === "news" },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "users":
        return <UserManagement />;
      case "platform":
        return <PlatformManagement />;
      case "events":
        return <EventManagement />;
      default:
        return (
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <p className="text-muted-foreground">
              This section is under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-sidebar-foreground">Admin Dashboard</h1>
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

export default AdminDashboard;