import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import EventForm from "./EventForm";

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

interface EventListProps {
  events: Event[];
}

const EventList = ({ events }: EventListProps) => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const queryClient = useQueryClient();

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete event");
      console.error(error);
    },
  });

  if (events.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No events scheduled for this day
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="p-4 rounded-lg border bg-card text-card-foreground"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{event.title}</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(event.start_time), "h:mm a")} -{" "}
                {format(new Date(event.end_time), "h:mm a")}
              </p>
              {event.description && (
                <p className="mt-2 text-sm">{event.description}</p>
              )}
              {event.meta_info?.location && (
                <p className="mt-1 text-sm">
                  📍 {event.meta_info.location}
                </p>
              )}
              {event.meta_info?.maxParticipants && (
                <p className="mt-1 text-sm">
                  👥 Max participants: {event.meta_info.maxParticipants}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingEvent(event)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteEvent.mutate(event.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      <EventForm
        open={!!editingEvent}
        onOpenChange={(open) => !open && setEditingEvent(null)}
        event={editingEvent}
      />
    </div>
  );
};

export default EventList;