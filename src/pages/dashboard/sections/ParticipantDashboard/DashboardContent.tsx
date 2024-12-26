import { useEffect, useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Trophy } from "lucide-react";

interface DashboardContentProps {
  userId: string;
}

const DashboardContent = ({ userId }: DashboardContentProps) => {
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [teamInfo, setTeamInfo] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch upcoming events
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .gte("start_time", new Date().toISOString())
        .order("start_time")
        .limit(3);

      if (events) setUpcomingEvents(events);

      // Fetch team information
      const { data: teamMember } = await supabase
        .from("team_members")
        .select(`
          team_id,
          teams (
            name,
            is_ready,
            mentor:mentor_id (
              full_name
            )
          )
        `)
        .eq("user_id", userId)
        .single();

      if (teamMember) setTeamInfo(teamMember.teams);
    };

    fetchDashboardData();
  }, [userId]);

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Your Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Track your progress, view upcoming events, and manage your team participation.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Team Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Status</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {teamInfo ? (
              <div className="space-y-2">
                <p className="text-2xl font-bold">{teamInfo.name}</p>
                <p className="text-xs text-muted-foreground">
                  Mentor: {teamInfo.mentor?.full_name || "Not assigned"}
                </p>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${teamInfo.is_ready ? "bg-green-500" : "bg-yellow-500"}`} />
                  <span className="text-sm text-muted-foreground">
                    {teamInfo.is_ready ? "Ready" : "Setup in Progress"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not part of a team yet</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="space-y-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.start_time).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress Overview</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Profile Setup</span>
                <span className="text-sm font-medium">Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Team Formation</span>
                <span className="text-sm font-medium">
                  {teamInfo ? "Complete" : "Pending"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;