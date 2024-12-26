import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { DocumentForm } from "./DocumentForm";
import { DocumentList } from "./DocumentList";

const LegalDocuments = () => {
  const [isCreating, setIsCreating] = useState(false);

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ["legal-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Legal Documents
        </CardTitle>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Document
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading documents...</div>
        ) : (
          <>
            <DocumentList documents={documents || []} onRefresh={refetch} />
            <DocumentForm
              isOpen={isCreating}
              onClose={() => setIsCreating(false)}
              onSuccess={() => {
                setIsCreating(false);
                refetch();
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LegalDocuments;