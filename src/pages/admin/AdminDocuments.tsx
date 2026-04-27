import { useEffect, useState, useRef } from "react";
import { Search, FileText, ChevronDown, ChevronUp, CheckCircle, Download, CreditCard } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { DOC_TYPE_LABELS } from "@/lib/constants";
import { logAudit } from "@/lib/auditLog";
import type { PortalDocument, MemberProfile } from "@/types/portal";

const PAYMENT_METHODS = [
  { value: "secretariat", label: "Secretariat Counter" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "cash", label: "Cash" },
];

const AdminDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<PortalDocument[]>([]);
  const [filtered, setFiltered] = useState<PortalDocument[]>([]);
  const [profiles, setProfiles] = useState<Record<string, MemberProfile>>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();

  // Payment dialog state
  const [payingDoc, setPayingDoc] = useState<PortalDocument | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("secretariat");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: docs } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
      const docList = docs || [];
      setDocuments(docList); setFiltered(docList);
      const userIds = [...new Set(docList.map((d) => d.user_id))];
      if (userIds.length > 0) {
        const { data: profileData } = await supabase.from("profiles")
          .select("user_id, first_name, surname, email").in("user_id", userIds);
        const map: Record<string, any> = {};
        (profileData || []).forEach((p) => { map[p.user_id] = p; });
        setProfiles(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = value.toLowerCase().trim();
      setFiltered(!q ? documents : documents.filter((d) =>
        [d.title, d.reference_number, d.document_type].some((v) => v?.toLowerCase().includes(q))
      ));
    }, 200);
  };

  const handleExportCSV = () => {
    const rows = [
      ["Reference", "Title", "Document Type", "Member", "Status", "Date"],
      ...documents.map((d) => {
        const profile = profiles[d.user_id];
        const member = [profile?.surname, profile?.first_name].filter(Boolean).join(" ") || profile?.email || "—";
        return [
          d.reference_number || d.id.slice(0, 8),
          d.title,
          DOC_TYPE_LABELS[d.document_type] || d.document_type,
          member,
          d.status,
          new Date(d.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }),
        ];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `documents-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const markCompleted = async (doc: any) => {
    const { error } = await supabase.from("documents").update({ status: "completed" }).eq("id", doc.id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    const profile = profiles[doc.user_id];
    const name = [profile?.surname, profile?.first_name].filter(Boolean).join(" ") || "Member";
    const label = DOC_TYPE_LABELS[doc.document_type] || doc.document_type;
    await supabase.from("notifications").insert({
      user_id: doc.user_id,
      title: `Document Ready: ${label}`,
      message: `Your document "${doc.title}" (Ref: ${doc.reference_number || "N/A"}) has been marked as completed.`,
      type: "document_update",
    });
    if (profile?.email) {
      await supabase.functions.invoke("send-email", {
        body: { type: "document_completed", to: profile.email, name, document_type: label, title: doc.title, reference_number: doc.reference_number || "N/A" },
      });
    }
    if (user) {
      logAudit(user.id, "document_completed", "document", doc.id, {
        document_title: doc.title,
        reference_number: doc.reference_number ?? undefined,
        member_email: profile?.email ?? undefined,
      });
    }
    const updated = documents.map((d) => d.id === doc.id ? { ...d, status: "completed" } : d);
    setDocuments(updated as PortalDocument[]); setFiltered(updated as PortalDocument[]);
    toast({ title: "Document marked as completed", description: "The member has been notified." });
  };

  const openPaymentDialog = (doc: PortalDocument) => {
    const consideration = (doc.form_data as any)?.consideration;
    const prefilledAmount = consideration
      ? (parseFloat(consideration.replace(/,/g, "")) * 0.1).toFixed(2)
      : "";
    setPayingDoc(doc);
    setPayAmount(prefilledAmount);
    setPayMethod("secretariat");
    setPayRef("");
    setPayNotes("");
  };

  const handleRecordPayment = async () => {
    if (!payingDoc || !user) return;
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid payment amount.", variant: "destructive" });
      return;
    }
    setPaying(true);
    const { error } = await (supabase as any).from("payments").insert({
      document_id: payingDoc.id,
      user_id: payingDoc.user_id,
      amount,
      payment_method: payMethod,
      reference: payRef || null,
      notes: payNotes || null,
      recorded_by: user.id,
    });
    if (error) {
      toast({ title: "Failed to record payment", description: error.message, variant: "destructive" });
      setPaying(false);
      return;
    }

    const profile = profiles[payingDoc.user_id];
    logAudit(user.id, "payment_recorded", "document", payingDoc.id, {
      document_title: payingDoc.title,
      amount,
      payment_method: payMethod,
      member_email: profile?.email ?? undefined,
    });

    // Auto-complete the document if it isn't already
    if (payingDoc.status !== "completed") {
      await markCompleted(payingDoc);
    }

    setPaying(false);
    setPayingDoc(null);
    toast({ title: "Payment recorded", description: `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })} recorded successfully.` });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin Panel"
          title="Documents"
          subtitle={`${documents.length} document${documents.length !== 1 ? "s" : ""} prepared.`}
          action={documents.length > 0 ? (
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          ) : undefined}
        />

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <input type="text" value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by title, reference, or document type..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <Button type="button" onClick={() => handleSearchChange(query)}>
                <Search className="h-4 w-4 mr-1" /> Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="shadow-card"><CardContent className="p-8 text-center"><FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No documents found.</p></CardContent></Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((doc) => {
              const profile = profiles[doc.user_id];
              const isExpanded = expanded === doc.id;
              const formData = (doc.form_data as Record<string, any>) || {};
              const showPayment = doc.approval_status === "approved";
              return (
                <Card key={doc.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : doc.id)}>
                      <FileText className="h-8 w-8 text-accent flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-sm font-light text-card-foreground tracking-display truncate">{doc.title}</h3>
                        <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground mt-0.5">
                          {DOC_TYPE_LABELS[doc.document_type] || doc.document_type} · {new Date(doc.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        {doc.reference_number && <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60">Ref: {doc.reference_number}</p>}
                        {profile && <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60">Member: {[profile.surname, profile.first_name].filter(Boolean).join(" ") || profile.email}</p>}
                      </div>
                      <Badge variant={doc.status === "draft" ? "secondary" : "default"} className="capitalize flex-shrink-0">{doc.status}</Badge>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    </div>

                    {isExpanded && (
                      <div className="mt-4 border-t pt-4 space-y-4">
                        {Object.keys(formData).length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {Object.entries(formData).map(([k, v]) => v ? (
                              <div key={k}><span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}:</span> {String(v)}</div>
                            ) : null)}
                          </div>
                        )}
                        {doc.content && (
                          <div className="bg-muted/50 rounded-md p-4 text-sm text-foreground whitespace-pre-wrap max-h-80 overflow-y-auto font-mono">{doc.content}</div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {doc.status === "draft" && (
                            <Button size="sm" onClick={() => markCompleted(doc)}>
                              <CheckCircle className="h-4 w-4 mr-1" />Mark as Completed
                            </Button>
                          )}
                          {showPayment && (
                            <Button size="sm" variant="outline" onClick={() => openPaymentDialog(doc)} className="gap-1.5">
                              <CreditCard className="h-4 w-4" />Record Payment
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Record Payment Dialog */}
      <Dialog open={!!payingDoc} onOpenChange={(open) => { if (!open) setPayingDoc(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              {payingDoc?.title} · {payingDoc?.reference_number || "No ref"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold tracking-eyebrow uppercase text-muted-foreground block mb-1.5">Amount (₦)</label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-eyebrow uppercase text-muted-foreground block mb-1.5">Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold tracking-eyebrow uppercase text-muted-foreground block mb-1.5">Reference / Receipt No. <span className="font-normal">(optional)</span></label>
              <input
                type="text"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="e.g. TXN-001234"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-eyebrow uppercase text-muted-foreground block mb-1.5">Notes <span className="font-normal">(optional)</span></label>
              <textarea
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                rows={2}
                placeholder="Any additional notes..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayingDoc(null)} disabled={paying}>Cancel</Button>
            <Button onClick={handleRecordPayment} disabled={paying}>
              {paying ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminDocuments;
