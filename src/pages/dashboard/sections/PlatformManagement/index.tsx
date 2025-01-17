import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmtpSettings } from "./SmtpSettings";
import { RegistrationSettings } from "./RegistrationSettings";
import LegalDocuments from "../LegalDocuments";
import HomePageSettings from "./sections/HomePageSettings";
import PartnersManagement from "./sections/PartnersManagement";
import ContactSettings from "./sections/ContactSettings";
import ThemeManagement from "./sections/ThemeManagement";
import GithubSettings from "./sections/GithubSettings";

const PlatformManagement = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="registration" className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-8 w-full">
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
          <TabsTrigger value="legal">Legal Documents</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="github">GitHub</TabsTrigger>
        </TabsList>

        <TabsContent value="registration" className="space-y-4">
          <RegistrationSettings />
        </TabsContent>

        <TabsContent value="smtp" className="space-y-4">
          <SmtpSettings />
        </TabsContent>

        <TabsContent value="legal" className="space-y-4">
          <LegalDocuments />
        </TabsContent>

        <TabsContent value="homepage" className="space-y-4">
          <HomePageSettings />
        </TabsContent>

        <TabsContent value="partners" className="space-y-4">
          <PartnersManagement />
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <ContactSettings />
        </TabsContent>

        <TabsContent value="themes" className="space-y-4">
          <ThemeManagement />
        </TabsContent>

        <TabsContent value="github" className="space-y-4">
          <GithubSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformManagement;