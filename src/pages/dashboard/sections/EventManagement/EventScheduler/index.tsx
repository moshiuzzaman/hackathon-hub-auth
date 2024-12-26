import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import EventForm from "./EventForm";
import EventList from "./EventList";
import EventTimeline from "./EventTimeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  meta_info: {
    location?: string;
    maxParticipants?: number;
  };
}

const EventScheduler = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch all events for calendar markers
  const { data: allEvents } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_time");

      if (error) throw error;
      return data as Event[];
    },
  });

  // Fetch events for selected date
  const { data: selectedDateEvents, isLoading } = useQuery({
    queryKey: ["events", selectedDate ? format(selectedDate, "yyyy-MM-dd") : null],
    queryFn: async () => {
      if (!selectedDate) return [];
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("start_time", startOfDay.toISOString())
        .lte("start_time", endOfDay.toISOString())
        .order("start_time");

      if (error) throw error;
      return data as Event[];
    },
  });

  // Create a set of dates that have events
  const eventDates = new Set(
    allEvents?.map((event) => format(new Date(event.start_time), "yyyy-MM-dd"))
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Scheduler</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasEvent: (date) => 
                eventDates.has(format(date, "yyyy-MM-dd")),
            }}
            modifiersStyles={{
              hasEvent: {
                fontWeight: "bold",
                backgroundColor: "hsl(var(--primary) / 0.1)",
                color: "hsl(var(--primary))",
              },
            }}
          />

          <Tabs defaultValue="list">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="mt-4">
              <EventList events={selectedDateEvents || []} />
            </TabsContent>
            <TabsContent value="timeline" className="mt-4">
              <EventTimeline events={allEvents || []} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            Events for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
          </h2>
          <EventList events={selectedDateEvents || []} />
        </div>
      </div>

      <EventForm
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default EventScheduler;