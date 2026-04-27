import { useEffect, useState, useRef } from "react";
import { Search, User, Scale, ChevronDown, ChevronUp, Ban, CheckCircle, UserCheck, Download } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { logAudit } from "@/lib/auditLog";
import type { MemberProfile } from "@/types/portal";

const AdminRemunerationMembers = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [filtered, setFiltered] = useState<MemberProfile[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        setMembers(data || []);
        setFiltered(data || []);
        setLoading(false);
      });
  }, []);

  const handleExportCSV = () => {
    const rows = [
      ["Name", "Email", "Enrollment No.", "Branch", "Year of Call", "Phone", "Status", "Joined"],
      ...members.map((m) => [
        [m.surname, m.first_name, m.middle_name].filter(Boolean).join(" ") || "—",
        m.email || "—",
        m.ban || "—",
        m.branch || "—",
        m.year_of_call || "—",
        m.phone || "—",
        m.status || "—",
        new Date(m.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `members-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = value.toLowerCase().trim();
      setFiltered(!q ? members : members.filter((m) =>
        [m.first_name, m.surname, m.email, m.branch, m.phone, m.ban].some((v) => v?.toLowerCase().includes(q))
      ));
    }, 200);
  };

  const approveAccount = async (m: any) => {
    const { error } = await supabase.from("profiles").update({ status: "active" }).eq("id", m.id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    const name = [m.surname, m.first_name].filter(Boolean).join(" ") || "Member";
    if (m.user_id) {
      await supabase.from("notifications").insert({
        user_id: m.user_id,
        title: "Account Approved",
        message: "Your NBA Remuneration Portal account has been approved. You can now access all features.",
        type: "account",
      });
    }
    if (m.email) {
      await supabase.functions.invoke("send-email", {
        body: { type: "account_approved", to: m.email, name },
      });
    }
    if (user) {
      logAudit(user.id, "member_approved", "profile", m.id, { member_email: m.email, member_name: name });
    }
    const updated = members.map((mem) => mem.id === m.id ? { ...mem, status: "active" } : mem);
    setMembers(updated); setFiltered(updated);
    toast({ title: "Account approved", description: `${name} can now access the portal.` });
  };

  const toggleSuspend = async (m: any) => {
    const newStatus = m.status === "suspended" ? "active" : "suspended";
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", m.id);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    const name = [m.surname, m.first_name].filter(Boolean).join(" ") || m.email || "Member";
    if (user) {
      logAudit(user.id, newStatus === "suspended" ? "member_suspended" : "member_reinstated", "profile", m.id, {
        member_email: m.email,
        member_name: name,
      });
    }
    const updated = members.map((mem) => mem.id === m.id ? { ...mem, status: newStatus } : mem);
    setMembers(updated); setFiltered(updated);
    toast({ title: newStatus === "suspended" ? "Member suspended" : "Member reinstated" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin Panel"
          title="Members"
          subtitle={`${members.length} member${members.length !== 1 ? "s" : ""} registered.`}
          action={members.length > 0 ? (
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
                placeholder="Search by name, email, branch..."
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
        ) : error ? (
          <Card className="shadow-card"><CardContent className="p-8 text-center"><p className="text-sm text-destructive">{error}</p></CardContent></Card>
        ) : filtered.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No members found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((m) => (
              <Card key={m.id} className={`shadow-card transition-shadow ${m.status === "suspended" ? "opacity-60" : ""} ${m.status === "pending" ? "border-amber-300" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                      <div>
                        <p className="font-display text-sm font-light text-card-foreground tracking-display">
                          {[m.surname, m.first_name, m.middle_name].filter(Boolean).join(" ") || "-"}
                        </p>
                        <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60">{m.email || "No email"}</p>
                      </div>
                      <div className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60 space-y-0.5">
                        {m.year_of_call && <p>Called {m.year_of_call}</p>}
                        {m.branch && <p>{m.branch}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {m.status === "pending" && <Badge className="bg-amber-100 text-amber-700 border-amber-300">Pending Approval</Badge>}
                        {m.status === "suspended" && <Badge variant="destructive">Suspended</Badge>}
                        <p className="text-xs text-muted-foreground ml-auto">
                          Joined: {new Date(m.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    {expanded === m.id ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                  </div>

                  {expanded === m.id && (
                    <div className="mt-4 border-t pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Branch:</span> {m.branch || "-"}</div>
                        <div><span className="text-muted-foreground">Year of Call:</span> {m.year_of_call || "-"}</div>
                        <div><span className="text-muted-foreground">Phone:</span> {m.phone || "-"}</div>
                        <div><span className="text-muted-foreground">Enrollment No.:</span> {m.ban || "-"}</div>
                        <div><span className="text-muted-foreground">Office:</span> {m.office_address || "-"}</div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {m.status === "pending" ? (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => approveAccount(m)}>
                            <UserCheck className="h-4 w-4 mr-1" />Approve Account
                          </Button>
                        ) : (
                          <Button size="sm" variant={m.status === "suspended" ? "default" : "destructive"} onClick={() => toggleSuspend(m)}>
                            {m.status === "suspended"
                              ? <><CheckCircle className="h-4 w-4 mr-1" />Reinstate</>
                              : <><Ban className="h-4 w-4 mr-1" />Suspend</>}
                          </Button>
                        )}
                      </div>
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

export default AdminRemunerationMembers;
