import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Info = () => {
  const { data: documents } = useQuery({
    queryKey: ["legal-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_documents")
        .select("*")
        .eq("is_published", true)
        .order("version", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const privacyPolicy = documents?.find((doc) => doc.type === "privacy");
  const terms = documents?.find((doc) => doc.type === "terms");

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Legal Information</h1>
      
      <Tabs defaultValue="privacy" className="max-w-3xl">
        <TabsList>
          <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
          <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="privacy">
          <div className="prose max-w-none dark:prose-invert">
            {privacyPolicy ? (
              <div dangerouslySetInnerHTML={{ __html: privacyPolicy.content }} />
            ) : (
              <p>Privacy policy is not available at the moment.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="terms">
          <div className="prose max-w-none dark:prose-invert">
            {terms ? (
              <div dangerouslySetInnerHTML={{ __html: terms.content }} />
            ) : (
              <p>Terms and conditions are not available at the moment.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Info;