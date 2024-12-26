import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Users, Settings, Calendar, Newspaper, UserCheck, FileText, 
  Gift, Home, Image, Phone, Building 
} from "lucide-react";
import { toast } from "sonner";
import UserManagement from "./sections/UserManagement";
import PlatformManagement from "./sections/PlatformManagement";
import EventManagement from "./sections/EventManagement";
import NewsManagement from "./sections/NewsManagement";
import MentorApplications from "./sections/UserManagement/MentorApplications";
import LegalDocuments from "./sections/LegalDocuments";
import BenefitsManagement from "./sections/BenefitsManagement";
import HomePageSettings from "./sections/PublicPages/HomePageSettings";
import PartnersManagement from "./sections/PublicPages/PartnersManagement";
import ContactSettings from "./sections/PublicPages/ContactSettings";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { session } = useSessionContext();
  const [activeSection, setActiveSection] = useState("users");
  const [pendingMentorsCount, setPendingMentorsCount] = useState(0);

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

  useEffect(() => {
    const fetchPendingMentors = async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true })
        .eq("role", "mentor")
        .eq("mentor_status", "pending");
      
      setPendingMentorsCount(count || 0);
    };

    fetchPendingMentors();

    // Subscribe to changes
    const channel = supabase
      .channel('mentor-applications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'mentor_status=eq.pending',
        },
        () => {
          fetchPendingMentors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const navigationItems = [
    { id: "users", icon: Users, label: "User Management", active: activeSection === "users" },
    { 
      id: "mentors", 
      icon: UserCheck, 
      label: "Mentor Applications", 
      active: activeSection === "mentors",
      badge: pendingMentorsCount > 0 ? pendingMentorsCount : undefined
    },
    { id: "platform", icon: Settings, label: "Platform Management", active: activeSection === "platform" },
    { id: "events", icon: Calendar, label: "Event Management", active: activeSection === "events" },
    { id: "news", icon: Newspaper, label: "News Management", active: activeSection === "news" },
    { id: "legal", icon: FileText, label: "Legal Documents", active: activeSection === "legal" },
    { id: "benefits", icon: Gift, label: "Benefits", active: activeSection === "benefits" },
    // New sections for public pages
    { id: "homepage", icon: Home, label: "Home Page Settings", active: activeSection === "homepage" },
    { id: "partners", icon: Building, label: "Partners", active: activeSection === "partners" },
    { id: "contact", icon: Phone, label: "Contact Settings", active: activeSection === "contact" },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "users":
        return <UserManagement />;
      case "mentors":
        return <MentorApplications />;
      case "platform":
        return <PlatformManagement />;
      case "events":
        return <EventManagement />;
      case "news":
        return <NewsManagement />;
      case "legal":
        return <LegalDocuments />;
      case "benefits":
        return <BenefitsManagement />;
      case "homepage":
        return <HomePageSettings />;
      case "partners":
        return <PartnersManagement />;
      case "contact":
        return <ContactSettings />;
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
                className={`flex items-center justify-between w-full px-4 py-2 text-sm rounded-md transition-colors
                  ${item.active 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
              >
                <div className="flex items-center">
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
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