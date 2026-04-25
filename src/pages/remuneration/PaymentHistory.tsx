import { useEffect, useState } from "react";
import { CreditCard, Download, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DOC_TYPE_LABELS } from "@/lib/constants";

const calcFee = (consideration: string | undefined): string | null => {
  if (!consideration) return null;
  const raw = parseFloat(consideration.replace(/,/g, ""));
  if (isNaN(raw) || raw <= 0) return null;
  return (raw * 0.1).toLocaleString("en-NG", { minimumFractionDigits: 2 });
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  completed: {
    label: "Processed",
    icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    className: "bg-green-100 text-green-700 border-green-200",
  },
  submitted: {
    label: "Awaiting Payment",
    icon: <Clock className="h-4 w-4 text-blue-600" />,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  draft: {
    label: "Not Submitted",
    icon: <AlertCircle className="h-4 w-4 text-muted-foreground" />,
    className: "bg-muted text-muted-foreground border-border",
  },
};

const PaymentHistory = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("documents")
      .select("id, title, document_type, status, approval_status, reference_number, form_data, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        setDocuments(data || []);
        setLoading(false);
      });
  }, [user]);

  const totalFeesDue = documents
    .filter((d) => d.status !== "completed")
    .reduce((sum, d) => {
      const raw = parseFloat((d.form_data?.consideration || "").replace(/,/g, ""));
      return sum + (isNaN(raw) ? 0 : raw * 0.1);
    }, 0);

  const totalFeesPaid = documents
    .filter((d) => d.status === "completed")
    .reduce((sum, d) => {
      const raw = parseFloat((d.form_data?.consideration || "").replace(/,/g, ""));
      return sum + (isNaN(raw) ? 0 : raw * 0.1);
    }, 0);

  const handleExportCSV = () => {
    const rows = [
      ["Reference", "Document Type", "Consideration (₦)", "Remuneration Fee (₦)", "Status", "Date"],
      ...documents.map((d) => {
        const consideration = d.form_data?.consideration || "—";
        const fee = calcFee(d.form_data?.consideration) || "—";
        const status = d.status === "completed" ? "Processed" : d.approval_status === "submitted" ? "Awaiting Payment" : "Not Submitted";
        return [
          d.reference_number || d.id.slice(0, 8),
          DOC_TYPE_LABELS[d.document_type] || d.document_type,
          consideration,
          fee,
          status,
          new Date(d.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }),
        ];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Transactions"
          title="Payment History"
          subtitle="Track remuneration fees due and processed for your documents."
          action={
            documents.length > 0 ? (
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            ) : undefined
          }
        />

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
                <CreditCard className="h-10 w-10 text-primary/60" />
              </div>
              <h3 className="font-display text-2xl font-light text-foreground tracking-display mb-2">No transactions yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Prepare and submit a document to see your remuneration fee summary here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="shadow-card">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Total Processed</p>
                    <p className="font-display text-2xl font-light text-foreground mt-0.5">
                      ₦{totalFeesPaid.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Outstanding Fees</p>
                    <p className="font-display text-2xl font-light text-foreground mt-0.5">
                      ₦{totalFeesDue.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notice about payment */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-5 py-4 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Payment gateway coming soon.</span>{" "}
                Complete outstanding payments at the NBA secretariat. Fees are calculated at{" "}
                <span className="font-semibold">10% of the consideration value</span> per the Legal Practitioners' Remuneration Order 2023.
              </p>
            </div>

            {/* Transactions table */}
            <Card className="shadow-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-5 py-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Reference</th>
                        <th className="text-left px-5 py-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Document</th>
                        <th className="text-left px-5 py-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground hidden md:table-cell">Consideration</th>
                        <th className="text-left px-5 py-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Fee (10%)</th>
                        <th className="text-left px-5 py-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Status</th>
                        <th className="text-left px-5 py-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground hidden sm:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {documents.map((doc) => {
                        const fee = calcFee(doc.form_data?.consideration);
                        const consideration = doc.form_data?.consideration;
                        const statusKey = doc.status === "completed" ? "completed" : doc.approval_status === "submitted" ? "submitted" : "draft";
                        const cfg = statusConfig[statusKey];
                        return (
                          <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-5 py-4 text-foreground font-medium">
                              <div className="flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-accent shrink-0" />
                                {doc.reference_number || `#${doc.id.slice(0, 8).toUpperCase()}`}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-muted-foreground max-w-[200px]">
                              <p className="truncate">{DOC_TYPE_LABELS[doc.document_type] || doc.document_type}</p>
                            </td>
                            <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">
                              {consideration ? `₦${consideration}` : <span className="text-muted-foreground/50">—</span>}
                            </td>
                            <td className="px-5 py-4 font-medium text-foreground">
                              {fee ? `₦${fee}` : <span className="text-muted-foreground/50">N/A</span>}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium border ${cfg.className}`}>
                                {cfg.icon}{cfg.label}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell">
                              {new Date(doc.created_at).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PortalLayout>
  );
};

export default PaymentHistory;
