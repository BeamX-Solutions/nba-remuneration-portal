import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, AlertCircle, FileText, Download } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DOC_TYPE_LABELS, calcDocFee } from "@/lib/constants";

const parseFee = (formData: Record<string, string> | null | undefined, docType: string): number =>
  calcDocFee(formData, docType) ?? 0;

const fmt = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const AdminReporting = () => {
  const [docs, setDocs] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: docData } = await supabase
        .from("documents")
        .select("id, user_id, document_type, status, approval_status, form_data, created_at");
      const allDocs = docData || [];
      setDocs(allDocs);

      const userIds = [...new Set(allDocs.map((d) => d.user_id))];
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id, branch")
          .in("user_id", userIds);
        const map: Record<string, any> = {};
        (profileData || []).forEach((p) => { map[p.user_id] = p; });
        setProfiles(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const completed = docs.filter((d) => d.status === "completed");
  const outstanding = docs.filter((d) => d.status !== "completed" && d.approval_status === "submitted");

  const totalProcessed = completed.reduce((sum, d) => sum + parseFee(d.form_data, d.document_type), 0);
  const totalOutstanding = outstanding.reduce((sum, d) => sum + parseFee(d.form_data, d.document_type), 0);

  // By document type
  const byType: Record<string, { count: number; fees: number }> = {};
  docs.forEach((d) => {
    const t = d.document_type || "unknown";
    if (!byType[t]) byType[t] = { count: 0, fees: 0 };
    byType[t].count++;
    if (d.status === "completed") byType[t].fees += parseFee(d.form_data, d.document_type);
  });

  // By branch (completed only)
  const byBranch: Record<string, { count: number; fees: number }> = {};
  completed.forEach((d) => {
    const branch = profiles[d.user_id]?.branch || "Unknown";
    if (!byBranch[branch]) byBranch[branch] = { count: 0, fees: 0 };
    byBranch[branch].count++;
    byBranch[branch].fees += parseFee(d.form_data, d.document_type);
  });

  // Monthly trend (completed only, most recent first)
  const monthlyMap: Record<string, number> = {};
  completed.forEach((d) => {
    const key = new Date(d.created_at).toLocaleDateString("en-NG", { month: "short", year: "numeric" });
    monthlyMap[key] = (monthlyMap[key] || 0) + parseFee(d.form_data, d.document_type);
  });
  const monthlyEntries = Object.entries(monthlyMap).slice(-12).reverse();

  const handleExportCSV = () => {
    const rows = [
      ["Document Type", "Total Documents", "Fees Processed (₦)"],
      ...Object.entries(byType).map(([type, { count, fees }]) => [
        DOC_TYPE_LABELS[type] || type,
        String(count),
        fees.toFixed(2),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `reporting-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Admin Panel"
          title="Financial Reporting"
          subtitle="Aggregate overview of remuneration fees and document activity."
          action={
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          }
        />

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Total Processed</p>
                <p className="font-display text-xl font-light text-foreground mt-0.5">{fmt(totalProcessed)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Outstanding</p>
                <p className="font-display text-xl font-light text-foreground mt-0.5">{fmt(totalOutstanding)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Total Documents</p>
                <p className="font-display text-xl font-light text-foreground mt-0.5">{docs.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Completed</p>
                <p className="font-display text-xl font-light text-foreground mt-0.5">{completed.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* By document type */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-display text-base font-light tracking-display text-foreground">Breakdown by Document Type</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Document Type</th>
                    <th className="text-right px-5 py-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Total Docs</th>
                    <th className="text-right px-5 py-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Fees Processed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Object.entries(byType)
                    .sort((a, b) => b[1].fees - a[1].fees)
                    .map(([type, { count, fees }]) => (
                      <tr key={type} className="hover:bg-muted/20">
                        <td className="px-5 py-3 text-foreground">{DOC_TYPE_LABELS[type] || type}</td>
                        <td className="px-5 py-3 text-muted-foreground text-right">{count}</td>
                        <td className="px-5 py-3 font-medium text-foreground text-right">{fmt(fees)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* By branch */}
        {Object.keys(byBranch).length > 0 && (
          <Card className="shadow-card">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-display text-base font-light tracking-display text-foreground">Revenue by Branch</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-5 py-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Branch</th>
                      <th className="text-right px-5 py-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Completed Docs</th>
                      <th className="text-right px-5 py-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Fees Processed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {Object.entries(byBranch)
                      .sort((a, b) => b[1].fees - a[1].fees)
                      .map(([branch, { count, fees }]) => (
                        <tr key={branch} className="hover:bg-muted/20">
                          <td className="px-5 py-3 text-foreground">{branch}</td>
                          <td className="px-5 py-3 text-muted-foreground text-right">{count}</td>
                          <td className="px-5 py-3 font-medium text-foreground text-right">{fmt(fees)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly trend */}
        {monthlyEntries.length > 0 && (
          <Card className="shadow-card">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-display text-base font-light tracking-display text-foreground">Monthly Trend — Processed Fees</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[300px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-5 py-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Month</th>
                      <th className="text-right px-5 py-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Fees Processed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {monthlyEntries.map(([month, fees]) => (
                      <tr key={month} className="hover:bg-muted/20">
                        <td className="px-5 py-3 text-foreground">{month}</td>
                        <td className="px-5 py-3 font-medium text-foreground text-right">{fmt(fees)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReporting;
