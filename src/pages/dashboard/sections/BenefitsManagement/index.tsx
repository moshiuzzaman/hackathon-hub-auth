import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VendorManagement from "./VendorManagement";
import BenefitsManagement from "./BenefitsManagement";
import AssignmentManagement from "./AssignmentManagement";

const BenefitsManagementSection = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="vendors">
        <TabsList>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>
        <TabsContent value="vendors" className="space-y-4">
          <VendorManagement />
        </TabsContent>
        <TabsContent value="benefits" className="space-y-4">
          <BenefitsManagement />
        </TabsContent>
        <TabsContent value="assignments" className="space-y-4">
          <AssignmentManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BenefitsManagementSection;