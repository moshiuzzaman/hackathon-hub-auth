import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  meta_info: z.object({
    location: z.string().optional(),
    maxParticipants: z.number().optional(),
  }).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  event?: any;
}

const EventForm = ({ open, onOpenChange, selectedDate, event }: EventFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: event
      ? {
          ...event,
          start_time: format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm"),
          end_time: format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm"),
        }
      : {
          title: "",
          description: "",
          start_time: selectedDate
            ? format(selectedDate, "yyyy-MM-dd'T'HH:mm")
            : "",
          end_time: selectedDate
            ? format(selectedDate, "yyyy-MM-dd'T'HH:mm")
            : "",
          meta_info: {
            location: "",
            maxParticipants: undefined,
          },
        },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormData) => {
      if (!values.title) throw new Error("Title is required");
      
      const payload = {
        title: values.title,
        description: values.description,
        start_time: new Date(values.start_time).toISOString(),
        end_time: new Date(values.end_time).toISOString(),
        meta_info: values.meta_info,
      };

      if (event) {
        const { error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", event.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("events")
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(
        event ? "Event updated successfully" : "Event added successfully"
      );
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(event ? "Failed to update event" : "Failed to add event");
      console.error(error);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Add Event"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Event description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="meta_info.location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Event location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meta_info.maxParticipants"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Max Participants</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Maximum number of participants"
                      {...field}
                      value={value || ""}
                      onChange={(e) => onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{event ? "Update" : "Add"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
