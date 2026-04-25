import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  FolderOpen, FileText, ChevronDown, ChevronUp, Copy, Trash2,
  Check, Download, Pencil, X, Send, RotateCcw, History, AlertTriangle, Clock,
} from "lucide-react";
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
import type { PortalDocument } from "@/types/portal";
import {
  submitDocumentForApproval,
  getDocumentVersions,
  restoreDocumentVersion,
} from "@/lib/documentUtils";

const approvalBadge = (status: string) => {
  switch (status) {
    case "submitted": return <Badge className="bg-blue-100 text-blue-700 border-blue-200 capitalize">Pending Review</Badge>;
    case "approved":  return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
    case "rejected":  return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
    default: return null;
  }
};

const MyDocuments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<PortalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDoc, setConfirmDoc] = useState<PortalDocument | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [versionsDocId, setVersionsDocId] = useState<string | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);

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
    if (!confirmDoc || !user) return;
    setDeleting(true);
    const { error: err } = await supabase.from("documents").delete().eq("id", confirmDoc.id).eq("user_id", user.id);
    setDeleting(false);
    setConfirmDoc(null);
    if (err) { toast({ title: "Delete failed", description: err.message, variant: "destructive" }); return; }
    setDocuments((prev) => prev.filter((d) => d.id !== confirmDoc.id));
    if (expanded === confirmDoc.id) setExpanded(null);
    toast({ title: "Document deleted" });
  };

  const startEdit = (doc: any) => { setEditingId(doc.id); setEditContent(doc.content || ""); };
  const cancelEdit = () => { setEditingId(null); setEditContent(""); };

  const saveEdit = async (doc: any) => {
    if (!user) return;
    setSavingEdit(true);
    const { error } = await supabase.from("documents").update({ content: editContent }).eq("id", doc.id).eq("user_id", user.id);
    setSavingEdit(false);
    if (error) { toast({ title: "Failed to save", description: error.message, variant: "destructive" }); return; }
    setDocuments((prev) => prev.map((d) => d.id === doc.id ? { ...d, content: editContent } : d));
    setEditingId(null);
    setEditContent("");
    toast({ title: "Document updated" });
  };

  const handleSubmit = async (doc: any) => {
    if (!user) return;
    setSubmitting(doc.id);
    const { success, error } = await submitDocumentForApproval(doc.id, user.id);
    setSubmitting(null);
    if (!success) { toast({ title: "Failed to submit", description: error, variant: "destructive" }); return; }
    setDocuments((prev) => prev.map((d) => d.id === doc.id ? { ...d, approval_status: "submitted" } : d));
    toast({ title: "Submitted for review", description: "You'll be notified once it's processed." });
  };

  const toggleVersions = async (docId: string) => {
    if (versionsDocId === docId) { setVersionsDocId(null); return; }
    setLoadingVersions(true);
    setVersionsDocId(docId);
    const { versions: v } = await getDocumentVersions(docId);
    setVersions(v || []);
    setLoadingVersions(false);
  };

  const handleRestore = async (docId: string, versionNumber: number) => {
    if (!user) return;
    setRestoringVersion(versionNumber);
    const { success, error } = await restoreDocumentVersion(docId, versionNumber, user.id);
    setRestoringVersion(null);
    if (!success) { toast({ title: "Restore failed", description: error, variant: "destructive" }); return; }
    const { data } = await supabase.from("documents").select("*").eq("id", docId).single();
    if (data) setDocuments((prev) => prev.map((d) => d.id === docId ? data : d));
    setVersionsDocId(null);
    toast({ title: "Version restored successfully" });
  };

  const docTypeLabel = (type: string) =>
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const canSubmit = (doc: any) =>
    doc.status === "draft" && (!doc.approval_status || doc.approval_status === "pending" || doc.approval_status === "rejected");

  return (
    <PortalLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="Document Archive" title="My Documents" subtitle="View, manage, and submit your prepared legal documents." />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <Card className="shadow-card"><CardContent className="p-8 text-center"><p className="text-sm text-destructive">{error}</p></CardContent></Card>
        ) : documents.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <FolderOpen className="h-10 w-10 text-primary/60" />
              </div>
              <h3 className="font-display text-2xl font-light text-foreground tracking-display mb-2">No Documents Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Your workspace is empty. Start drafting new legal documents to manage your portfolio.
              </p>
              <Button asChild className="gap-2">
                <a href="/dashboard/prepare"><FileText className="h-4 w-4" /> Prepare a Document</a>
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
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      <Badge variant={doc.status === "draft" ? "secondary" : "default"} className="capitalize text-xs">
                        {doc.status}
                      </Badge>
                      {approvalBadge(doc.approval_status)}
                      {expanded === doc.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {expanded === doc.id && (
                    <div className="mt-4 border-t pt-4 space-y-4">
                      {doc.reference_number && (
                        <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60">
                          Reference · <span className="text-muted-foreground">{doc.reference_number}</span>
                        </p>
                      )}

                      {/* Rejection panel */}
                      {doc.approval_status === "rejected" && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-red-800">Document Rejected</p>
                            {doc.rejection_reason && (
                              <p className="text-sm text-red-700 mt-1 leading-relaxed">{doc.rejection_reason}</p>
                            )}
                            <p className="text-xs text-red-600/70 mt-1">Correct the document and resubmit for review.</p>
                          </div>
                        </div>
                      )}

                      {/* Submitted notice */}
                      {doc.approval_status === "submitted" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                          <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                          <p className="text-sm text-blue-800">This document is awaiting admin review. You'll be notified when it's processed.</p>
                        </div>
                      )}

                      {/* Approved notice */}
                      {doc.approval_status === "approved" && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                          <p className="text-sm text-green-800">This document has been approved.</p>
                        </div>
                      )}

                      {/* Content viewer / editor */}
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

                      {/* Version history panel */}
                      {versionsDocId === doc.id && (
                        <div className="border border-border rounded-lg overflow-hidden">
                          <div className="bg-muted/40 px-4 py-2.5 flex items-center justify-between border-b border-border">
                            <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-foreground">Version History</p>
                            <button onClick={() => setVersionsDocId(null)} className="text-muted-foreground hover:text-foreground">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          {loadingVersions ? (
                            <div className="flex justify-center py-6">
                              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : versions.length === 0 ? (
                            <p className="text-sm text-muted-foreground p-4 text-center">No versions recorded yet.</p>
                          ) : (
                            <div className="divide-y divide-border max-h-60 overflow-y-auto">
                              {versions.map((v) => (
                                <div key={v.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20">
                                  <div>
                                    <p className="text-sm font-medium text-foreground">Version {v.version_number}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {new Date(v.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                                      {" · "}
                                      {new Date(v.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                  </div>
                                  {v.version_number > 1 && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRestore(doc.id, v.version_number)}
                                      disabled={restoringVersion === v.version_number}
                                    >
                                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                      {restoringVersion === v.version_number ? "Restoring..." : "Restore"}
                                    </Button>
                                  )}
                                  {v.version_number === 1 && (
                                    <span className="text-[11px] tracking-eyebrow uppercase text-muted-foreground font-semibold">Original</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action buttons */}
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
                          <Button size="sm" variant="outline" onClick={() => toggleVersions(doc.id)}>
                            <History className="h-3.5 w-3.5 mr-1" />History
                          </Button>
                          {doc.status === "draft" && (
                            <Button size="sm" variant="outline" onClick={() => startEdit(doc)}>
                              <Pencil className="h-3.5 w-3.5 mr-1" />Edit
                            </Button>
                          )}
                          {canSubmit(doc) && (
                            <Button
                              size="sm"
                              onClick={() => handleSubmit(doc)}
                              disabled={submitting === doc.id}
                              className="gap-1"
                            >
                              <Send className="h-3.5 w-3.5 mr-1" />
                              {submitting === doc.id ? "Submitting..." : doc.approval_status === "rejected" ? "Resubmit" : "Submit for Review"}
                            </Button>
                          )}
                          {doc.status === "draft" && (
                            <Button size="sm" variant="destructive" onClick={() => setConfirmDoc(doc)}>
                              <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
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
