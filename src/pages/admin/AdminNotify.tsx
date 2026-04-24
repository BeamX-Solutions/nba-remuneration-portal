import { useEffect, useState } from "react";
import { Send, CheckCircle, Users, User } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminNotify = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<any[]>([]);
  const [recipient, setRecipient] = useState<"all" | "single">("all");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    supabase.from("profiles").select("user_id, first_name, surname, email").order("surname")
      .then(({ data, error: err }) => { if (!err) setMembers(data || []); });
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast({ title: "Required", description: "Title and message are required.", variant: "destructive" });
      return;
    }
    if (recipient === "single" && !selectedUserId) {
      toast({ title: "Required", description: "Please select a member.", variant: "destructive" });
      return;
    }
    setSending(true);
    const targets = recipient === "all" ? members.map((m) => m.user_id) : [selectedUserId];
    const notifications = targets.map((uid) => ({
      user_id: uid, title: title.trim(), message: message.trim(), type: "admin_announcement",
    }));
    const { error } = await supabase.from("notifications").insert(notifications);
    setSending(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setSentCount(targets.length);
    setSent(true);
    toast({ title: "Notifications sent!", description: `Sent to ${targets.length} member${targets.length !== 1 ? "s" : ""}.` });
  };

  const reset = () => {
    setTitle(""); setMessage(""); setSelectedUserId(""); setRecipient("all"); setSent(false); setSentCount(0);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <PageHeader eyebrow="Admin Panel" title="Send Notification" subtitle="Send an announcement or message to one or all members." />

        <Card className="shadow-card">
          <CardContent className="p-6">
            {sent ? (
              <div className="flex flex-col items-center text-center py-10 space-y-4">
                <div className="h-16 w-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-display text-2xl font-light text-foreground tracking-display">Notification Sent</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  <span className="font-medium text-foreground">"{title}"</span> was delivered to{" "}
                  <span className="font-medium text-foreground">{sentCount} member{sentCount !== 1 ? "s" : ""}</span>.
                </p>
                <Button variant="outline" onClick={reset} className="mt-2">Send Another</Button>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-6">
                <div>
                  <label className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Send to</label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setRecipient("all")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-sm border text-[11px] tracking-eyebrow uppercase font-semibold transition-colors ${
                        recipient === "all"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-input text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Users className="h-3.5 w-3.5" />All Members ({members.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecipient("single")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-sm border text-[11px] tracking-eyebrow uppercase font-semibold transition-colors ${
                        recipient === "single"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-input text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <User className="h-3.5 w-3.5" />Specific Member
                    </button>
                  </div>
                </div>

                {recipient === "single" && (
                  <div>
                    <label className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">
                      Select Member <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="mt-1.5 w-full rounded-sm border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60"
                    >
                      <option value="">— Choose a member —</option>
                      {members.map((m) => (
                        <option key={m.user_id} value={m.user_id}>
                          {[m.surname, m.first_name].filter(Boolean).join(" ") || m.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">
                    Notification Title <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AGC Notice, Branch Dues Reminder..."
                    className="mt-1.5 w-full rounded-sm border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60"
                  />
                </div>

                <div>
                  <label className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your notification message here..."
                    className="mt-1.5 w-full rounded-sm border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 resize-none"
                  />
                </div>

                <Button type="submit" disabled={sending} className="w-full h-11">
                  {sending
                    ? "Sending..."
                    : <><Send className="h-4 w-4 mr-2" />Send to {recipient === "all" ? `All ${members.length} Members` : "Selected Member"}</>
                  }
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminNotify;
