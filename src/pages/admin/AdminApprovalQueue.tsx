import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import { getPendingDocuments } from "@/lib/documentUtils";
import { useToast } from "@/hooks/use-toast";
import { DocumentApprovalPanel } from "@/components/DocumentApprovalPanel";
import { AlertCircle, FileText, Loader2, RefreshCw } from "lucide-react";

const AdminApprovalQueue = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPendingDocuments();
  }, []);

  const loadPendingDocuments = async () => {
    setLoading(true);
    try {
      const { success, documents: docs, error } = await getPendingDocuments();
      if (success && docs) {
        setDocuments(docs);
      } else {
        toast({ title: "Error", description: error || "Failed to load pending documents", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalChange = () => {
    setSelectedDocId(null);
    loadPendingDocuments();
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin Panel"
          title="Approval Queue"
          subtitle="Review and approve documents submitted by members."
          action={
            <Button variant="outline" size="sm" onClick={loadPendingDocuments} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />Refresh
            </Button>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-display text-xl font-light text-foreground tracking-display mb-1">No Pending Documents</h3>
              <p className="text-sm text-muted-foreground">All documents have been reviewed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className={`shadow-card cursor-pointer transition hover:shadow-md ${selectedDocId === doc.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedDocId(selectedDocId === doc.id ? null : doc.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base line-clamp-1">{doc.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <span className="font-semibold text-foreground">Ref:</span> {doc.reference_number}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2 flex-shrink-0">
                      <AlertCircle className="h-3 w-3 mr-1" />Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60">Submitted By</p>
                      <p className="font-display text-sm font-light text-foreground tracking-display mt-0.5">
                        {[doc.created_by_profile?.first_name, doc.created_by_profile?.surname].filter(Boolean).join(" ") || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60">Submitted On</p>
                      <p className="text-sm text-foreground mt-0.5">{doc.submitted_at ? formatDate(doc.submitted_at) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60">Document Type</p>
                      <p className="text-sm text-foreground mt-0.5 capitalize">{doc.document_type?.replace(/_/g, " ")}</p>
                    </div>
                    <div>
                      <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60">Approval Status</p>
                      <p className="text-sm text-foreground mt-0.5 capitalize">{doc.approval_status}</p>
                    </div>
                  </div>
                  {selectedDocId === doc.id && (
                    <div className="pt-4 border-t mt-4">
                      <DocumentApprovalPanel
                        documentId={doc.id}
                        title={doc.title}
                        status={doc.approval_status}
                        onApprovalChange={handleApprovalChange}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminApprovalQueue;
