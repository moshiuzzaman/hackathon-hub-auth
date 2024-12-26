import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { DocumentForm } from "./DocumentForm";

interface Document {
  id: string;
  type: "terms" | "privacy";
  version: string;
  content: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

interface DocumentListProps {
  documents: Document[];
  onRefresh: () => void;
}

export const DocumentList = ({ documents, onRefresh }: DocumentListProps) => {
  const [publishingDoc, setPublishingDoc] = useState<Document | null>(null);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  const handlePublish = async () => {
    if (!publishingDoc) return;

    try {
      const { error } = await supabase
        .from("legal_documents")
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .eq("id", publishingDoc.id);

      if (error) throw error;

      toast.success("Document published successfully");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to publish document");
    } finally {
      setPublishingDoc(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="capitalize">{doc.type}</TableCell>
              <TableCell>{doc.version}</TableCell>
              <TableCell>
                {doc.is_published ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Published
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-100">
                    Draft
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {new Date(doc.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingDoc(doc)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {!doc.is_published && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-green-100 hover:bg-green-200"
                      onClick={() => setPublishingDoc(doc)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {documents.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No documents found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!publishingDoc}
        onOpenChange={() => setPublishingDoc(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to publish this document? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish}>
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingDoc && (
        <DocumentForm
          isOpen={true}
          onClose={() => setEditingDoc(null)}
          onSuccess={() => {
            setEditingDoc(null);
            onRefresh();
          }}
          initialData={editingDoc}
        />
      )}
    </>
  );
};