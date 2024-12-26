import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import EventForm from "./EventForm";
import EventList from "./EventList";

const EventScheduler = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: events, isLoading } = useQuery({
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
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Calendar</h2>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2" />
            Add Event
          </Button>
        </div>

        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          Events for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
        </h2>
        <EventList events={events || []} />
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