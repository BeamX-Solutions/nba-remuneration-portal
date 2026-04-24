import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Megaphone } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const emptyForm = { title: "", content: "", published: true };

const AdminAnnouncements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    setAnnouncements(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = { title: form.title, content: form.content, published: form.published };
    if (editing) {
      const { error } = await supabase.from("announcements").update(payload).eq("id", editing);
      if (error) { toast({ title: "Failed to save", description: error.message, variant: "destructive" }); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("announcements").insert({ ...payload, created_by: user?.id });
      if (error) { toast({ title: "Failed to save", description: error.message, variant: "destructive" }); setSaving(false); return; }
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setForm({ ...emptyForm });
    toast({ title: editing ? "Announcement updated" : "Announcement published" });
    load();
  };

  const startEdit = (a: any) => {
    setForm({ title: a.title, content: a.content, published: a.published });
    setEditing(a.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) { toast({ title: "Failed to delete", description: error.message, variant: "destructive" }); return; }
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast({ title: "Announcement deleted" });
  };

  const togglePublished = async (a: any) => {
    const { error } = await supabase.from("announcements").update({ published: !a.published }).eq("id", a.id);
    if (error) { toast({ title: "Failed", variant: "destructive" }); return; }
    setAnnouncements((prev) => prev.map((item) => item.id === a.id ? { ...item, published: !a.published } : item));
  };

  const cancel = () => { setShowForm(false); setEditing(null); setForm({ ...emptyForm }); };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin Panel"
          title="Announcements"
          subtitle="Post updates and notices visible on member dashboards."
          action={!showForm ? (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> New Announcement
            </Button>
          ) : undefined}
        />

        {showForm && (
          <Card className="shadow-card border-primary/30">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-display text-xl font-light text-foreground tracking-display">{editing ? "Edit Announcement" : "New Announcement"}</h2>
              <div>
                <label className="text-sm font-medium text-foreground">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Announcement title"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Write the announcement..."
                  rows={4}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm font-medium text-foreground">Publish immediately</span>
                </label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  <Check className="h-4 w-4 mr-1" />{saving ? "Saving..." : editing ? "Update" : "Publish"}
                </Button>
                <Button variant="outline" onClick={cancel}><X className="h-4 w-4 mr-1" />Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No announcements yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <Card key={a.id} className={`shadow-card ${!a.published ? "opacity-60" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-display text-base font-light text-card-foreground tracking-display">{a.title}</h3>
                        <Badge variant={a.published ? "default" : "secondary"}>
                          {a.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{a.content}</p>
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        {new Date(a.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => togglePublished(a)}>
                        {a.published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => startEdit(a)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(a.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
