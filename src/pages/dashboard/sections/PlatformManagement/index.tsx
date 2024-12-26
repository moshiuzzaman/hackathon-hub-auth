import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmtpSettings } from "./SmtpSettings";
import { RegistrationSettings } from "./RegistrationSettings";

const PlatformManagement = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="registration" className="space-y-6">
        <TabsList>
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
        </TabsList>

        <TabsContent value="registration" className="space-y-4">
          <RegistrationSettings />
        </TabsContent>

        <TabsContent value="smtp" className="space-y-4">
          <SmtpSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformManagement;