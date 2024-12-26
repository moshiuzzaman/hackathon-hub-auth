import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TechnologyStacks from "./TechnologyStacks";
import EventScheduler from "./EventScheduler";
import EventGallery from "./EventGallery";

const EventManagement = () => {
  return (
    <Tabs defaultValue="stacks" className="space-y-4">
      <TabsList>
        <TabsTrigger value="stacks">Technology Stacks</TabsTrigger>
        <TabsTrigger value="scheduler">Event Scheduler</TabsTrigger>
        <TabsTrigger value="gallery">Event Gallery</TabsTrigger>
      </TabsList>

      <TabsContent value="stacks" className="space-y-4">
        <TechnologyStacks />
      </TabsContent>

      <TabsContent value="scheduler" className="space-y-4">
        <EventScheduler />
      </TabsContent>

      <TabsContent value="gallery" className="space-y-4">
        <EventGallery />
      </TabsContent>
    </Tabs>
  );
};

export default EventManagement;