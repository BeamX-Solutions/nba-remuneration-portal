import { useEffect, useState } from "react";
import { Users, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [members, documents, pending, completed] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("documents").select("id", { count: "exact", head: true }),
          supabase.from("documents").select("id", { count: "exact", head: true }).eq("status", "draft"),
          supabase.from("documents").select("id", { count: "exact", head: true }).eq("status", "completed"),
        ]);
        setStats({
          totalMembers: members.count || 0,
          totalDocuments: documents.count || 0,
          pendingDocuments: pending.count || 0,
          completedDocuments: completed.count || 0,
        });
        const { data: recent } = await supabase.from("documents")
          .select("id, title, document_type, created_at, status")
          .order("created_at", { ascending: false }).limit(5);
        setRecentDocuments(recent || []);
        setLoading(false);
      } catch {
        setError("Failed to load dashboard data.");
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { label: "Total Members", value: stats.totalMembers, icon: <Users className="h-6 w-6 text-primary" />, href: "/admin/members" },
    { label: "Total Documents", value: stats.totalDocuments, icon: <FileText className="h-6 w-6 text-accent" />, href: "/admin/documents" },
    { label: "Draft Docs", value: stats.pendingDocuments, icon: <Clock className="h-6 w-6 text-yellow-600" />, href: "/admin/documents" },
    { label: "Completed Docs", value: stats.completedDocuments, icon: <CheckCircle className="h-6 w-6 text-green-600" />, href: "/admin/documents" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <PageHeader eyebrow="Admin Panel" title="Admin Dashboard" subtitle="Overview of the Remuneration Portal activity." />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <Card className="shadow-card"><CardContent className="p-8 text-center"><p className="text-sm text-destructive">{error}</p></CardContent></Card>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((s) => (
                <Link key={s.label} to={s.href}>
                  <Card className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                      {s.icon}
                      <p className="font-display text-3xl font-light text-foreground">{s.value ?? 0}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {recentDocuments.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-2xl font-light text-foreground tracking-display">Recent Documents</h2>
                  <Link to="/admin/documents" className="text-sm text-primary hover:underline">View all →</Link>
                </div>
                <div className="space-y-2">
                  {recentDocuments.map((doc) => (
                    <Card key={doc.id} className="shadow-card">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-display text-sm font-light text-card-foreground tracking-display">{doc.title || doc.document_type}</p>
                          <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60 mt-0.5">
                            {new Date(doc.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                          doc.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>{doc.status}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
