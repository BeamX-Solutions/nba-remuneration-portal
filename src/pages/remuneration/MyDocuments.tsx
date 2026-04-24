import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FolderOpen, FileText, ChevronDown, ChevronUp, Copy, Trash2, Check, Download, Pencil, X } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exportDocument } from "@/lib/pdfExport";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MyDocuments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDoc, setConfirmDoc] = useState<any | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        setDocuments(data || []);
        setLoading(false);
      });
  }, [user]);

  const handleCopy = (doc: any) => {
    navigator.clipboard.writeText(doc.reference_number || doc.id).then(() => {
      setCopied(doc.id);
      toast({ title: "Copied", description: "Reference number copied." });
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleExport = (doc: any) => {
    exportDocument(doc);
    toast({ title: "Downloading", description: `${doc.title} is being exported as PDF.` });
  };

  const confirmDelete = async () => {
    if (!confirmDoc) return;
    setDeleting(true);
    const { error: err } = await supabase.from("documents").delete().eq("id", confirmDoc.id).eq("user_id", user!.id);
    setDeleting(false);
    setConfirmDoc(null);
    if (err) { toast({ title: "Delete failed", description: err.message, variant: "destructive" }); return; }
    setDocuments((prev) => prev.filter((d) => d.id !== confirmDoc.id));
    if (expanded === confirmDoc.id) setExpanded(null);
    toast({ title: "Document deleted" });
  };

  const startEdit = (doc: any) => {
    setEditingId(doc.id);
    setEditContent(doc.content || "");
  };

  const cancelEdit = () => { setEditingId(null); setEditContent(""); };

  const saveEdit = async (doc: any) => {
    setSavingEdit(true);
    const { error } = await supabase.from("documents").update({ content: editContent }).eq("id", doc.id).eq("user_id", user!.id);
    setSavingEdit(false);
    if (error) { toast({ title: "Failed to save", description: error.message, variant: "destructive" }); return; }
    setDocuments((prev) => prev.map((d) => d.id === doc.id ? { ...d, content: editContent } : d));
    setEditingId(null);
    setEditContent("");
    toast({ title: "Document updated" });
  };

  const docTypeLabel = (type: string) =>
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <PortalLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="Document Archive" title="My Documents" subtitle="View and manage your prepared legal documents." />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : documents.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <FolderOpen className="h-10 w-10 text-primary/60" />
              </div>
              <h3 className="font-display text-2xl font-light text-foreground tracking-display mb-2">No Documents Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Your workspace is currently empty. Start drafting new legal documents or upload existing ones to manage your portfolio efficiently.
              </p>
              <Button asChild className="gap-2">
                <a href="/dashboard/prepare">
                  <FileText className="h-4 w-4" /> Prepare a Document
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="shadow-soft card-hover">
                <CardContent className="p-4">
                  <button
                    className="w-full text-left flex items-start gap-3"
                    onClick={() => setExpanded((p) => p === doc.id ? null : doc.id)}
                  >
                    <FileText className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-base font-light text-card-foreground tracking-display leading-snug">{doc.title}</p>
                      <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground mt-1">{docTypeLabel(doc.document_type)}</p>
                      <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60 mt-0.5">
                        {new Date(doc.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={doc.status === "draft" ? "secondary" : "default"}
                        className="capitalize text-xs"
                      >
                        {doc.status}
                      </Badge>
                      {expanded === doc.id
                        ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {expanded === doc.id && (
                    <div className="mt-4 border-t pt-4 space-y-4">
                      {doc.reference_number && (
                        <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60">
                          Reference · <span className="text-muted-foreground">{doc.reference_number}</span>
                        </p>
                      )}
                      {editingId === doc.id ? (
                        <div className="space-y-2">
                          <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-accent">Editing Draft</p>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={12}
                            className="w-full border border-input bg-background rounded-sm px-3 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 resize-y"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => saveEdit(doc)} disabled={savingEdit}>
                              {savingEdit ? "Saving..." : <><Check className="h-3.5 w-3.5 mr-1" />Save</>}
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit} disabled={savingEdit}>
                              <X className="h-3.5 w-3.5 mr-1" />Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        doc.content && (
                          <div className="bg-muted/40 rounded-lg p-4 max-h-72 overflow-y-auto prose prose-sm max-w-none text-foreground">
                            <ReactMarkdown>{doc.content}</ReactMarkdown>
                          </div>
                        )
                      )}
                      {editingId !== doc.id && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button size="sm" variant="outline" onClick={() => handleCopy(doc)}>
                            {copied === doc.id
                              ? <><Check className="h-3.5 w-3.5 mr-1 text-green-600" />Copied</>
                              : <><Copy className="h-3.5 w-3.5 mr-1" />Copy Reference</>}
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleExport(doc)}>
                            <Download className="h-3.5 w-3.5 mr-1" />Export PDF
                          </Button>
                          {doc.status === "draft" && (
                            <Button size="sm" variant="outline" onClick={() => startEdit(doc)}>
                              <Pencil className="h-3.5 w-3.5 mr-1" />Edit Content
                            </Button>
                          )}
                          {doc.status === "draft" && (
                            <Button size="sm" variant="destructive" onClick={() => setConfirmDoc(doc)}>
                              <Trash2 className="h-3.5 w-3.5 mr-1" />Delete Draft
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!confirmDoc} onOpenChange={(open) => { if (!open) setConfirmDoc(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Draft</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">"{confirmDoc?.title}"</span>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDoc(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export default MyDocuments;
