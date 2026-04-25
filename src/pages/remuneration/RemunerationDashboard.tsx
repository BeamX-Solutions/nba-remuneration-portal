import { useEffect, useState } from "react";
import { FileText, FolderOpen, Clock, CheckCircle, Download, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import PortalLayout from "@/components/PortalLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const statusConfig: Record<string, { label: string; className: string }> = {
  approved: { label: "Processed", className: "bg-green-100 text-green-700 border-green-200" },
  submitted: { label: "Pending Audit", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  draft: { label: "Draft", className: "bg-gray-100 text-gray-600 border-gray-200" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-600 border-red-200" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
};

const docTypeLabel = (type: string) =>
  type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const RemunerationDashboard = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [counts, setCounts] = useState({ drafts: 0, pending: 0, approved30d: 0 });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const profileQ = supabase
      .from("profiles")
      .select("first_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const announcementsQ = supabase
      .from("announcements")
      .select("id, title, content, created_at")
      .or("portal.eq.remuneration,portal.eq.both")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3);

    const documentsQ = supabase
      .from("documents")
      .select("id, title, document_type, status, approval_status, approved_at, created_at, reference_number, form_data")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    Promise.all([profileQ, announcementsQ, documentsQ])
      .then(([profile, announcements, documents]) => {
        if (profile.data?.first_name) setFirstName(profile.data.first_name);
        setAnnouncements(announcements.data || []);

        const docs = documents.data || [];
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        setCounts({
          drafts: docs.filter((d) => d.status === "draft").length,
          pending: docs.filter((d) => d.approval_status === "submitted" || d.approval_status === "pending").length,
          approved30d: docs.filter(
            (d) => d.approval_status === "approved" && d.approved_at && new Date(d.approved_at) >= cutoff
          ).length,
        });
        setRecentDocs(docs.slice(0, 5));
      })
      .catch(() => {/* queries failed — loading will clear in finally */})
      .finally(() => setLoading(false));
  }, [user]);

  const getAmount = (doc: any) => {
    const fd = doc.form_data;
    if (!fd) return null;
    const raw = fd.consideration;
    if (!raw) return null;
    return `₦${raw}`;
  };

  return (
    <PortalLayout>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Remuneration Portal"
          title={`Welcome back${firstName ? `, ${firstName}` : ""}`}
          subtitle="Here is your remuneration overview for today."
        />

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center shrink-0">
                <Megaphone className="h-4 w-4 text-accent" />
              </div>
              <span className="text-[11px] tracking-eyebrow uppercase font-semibold text-accent">Announcements</span>
            </div>
            {announcements.map((a) => (
              <Card key={a.id} className="shadow-soft border border-accent/20 border-l-4 border-l-accent">
                <CardContent className="p-5">
                  <h4 className="font-display text-base font-light text-foreground tracking-display leading-snug">{a.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{a.content}</p>
                  <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/50 mt-2">
                    {new Date(a.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Top cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prepare a Document card */}
          <Card className="lg:col-span-2 shadow-card">
            <CardContent className="p-8 flex flex-col gap-6 h-full">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-light text-foreground tracking-display">Prepare a Document</h2>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Start a new remuneration claim, file an expense report, or initiate a fee assessment with our guided process.
                  </p>
                </div>
              </div>
              <div className="mt-auto">
                <Button asChild className="gap-2">
                  <Link to="/dashboard/prepare">Start →</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Documents stats card */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-base font-light text-foreground tracking-display">My Documents</h3>
                <Link to="/dashboard/documents" className="text-xs text-primary font-medium hover:underline">
                  View All
                </Link>
              </div>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-0 divide-y divide-border">
                  <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-2.5">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Drafts</span>
                    </div>
                    <span className="font-display text-2xl font-light text-foreground">{counts.drafts}</span>
                  </div>
                  <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4 text-accent" />
                      <span className="text-sm text-foreground">Pending Review</span>
                    </div>
                    <span className="font-display text-2xl font-light text-accent">{counts.pending}</span>
                  </div>
                  <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-foreground">Approved (30d)</span>
                    </div>
                    <span className="font-display text-2xl font-light text-foreground">{counts.approved30d}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-lg font-light text-foreground tracking-display">Payment History</h3>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-5">Recent transactions and status updates</p>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
              </div>
            ) : recentDocs.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">No transactions recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left pb-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Reference ID</th>
                      <th className="text-left pb-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground hidden sm:table-cell">Date Filed</th>
                      <th className="text-left pb-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Matter Type</th>
                      <th className="text-left pb-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground hidden md:table-cell">Amount</th>
                      <th className="text-left pb-3 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentDocs.map((doc) => {
                      const cfg = statusConfig[doc.approval_status] || statusConfig.draft;
                      return (
                        <tr key={doc.id}>
                          <td className="py-3.5 text-foreground font-medium">
                            #{doc.reference_number || doc.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="py-3.5 text-muted-foreground hidden sm:table-cell">
                            {new Date(doc.created_at).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td className="py-3.5 text-muted-foreground">{docTypeLabel(doc.document_type)}</td>
                          <td className="py-3.5 text-muted-foreground hidden md:table-cell">{getAmount(doc) || "—"}</td>
                          <td className="py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cfg.className}`}>
                              {cfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default RemunerationDashboard;
