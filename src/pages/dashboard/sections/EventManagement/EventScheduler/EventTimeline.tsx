import { format } from "date-fns";
import { CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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

interface EventTimelineProps {
  events: Event[];
}

const EventTimeline = ({ events }: EventTimelineProps) => {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Event Timeline</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="relative pl-10">
                {/* Timeline dot */}
                <div className="absolute left-[14px] -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
                
                <Card className={cn(
                  "transition-all hover:shadow-md",
                  index === 0 && "border-primary"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{event.title}</h4>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <CalendarClock className="w-4 h-4 mr-1" />
                          <span>
                            {format(new Date(event.start_time), "MMM d, h:mm a")} -{" "}
                            {format(new Date(event.end_time), "h:mm a")}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {event.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {event.description}
                      </p>
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
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default EventTimeline;