import { useState, useEffect } from "react";
import { CheckCheck, Bell } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Notification } from "@/types/portal";

const RemunerationNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        setNotifications(data || []);
        setLoading(false);
      });
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = async () => {
    if (!user) return;
    const ids = notifications.filter((n) => !n.read).map((n) => n.id);
    if (!ids.length) return;
    await supabase.from("notifications").update({ read: true }).in("id", ids);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <PortalLayout>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Inbox"
          title="Notifications"
          subtitle={unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.` : "You're all caught up."}
          action={unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllRead} className="text-[11px] tracking-eyebrow uppercase font-semibold gap-1.5">
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          ) : undefined}
        />

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <Card className="shadow-soft border-0">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="shadow-elegant border-0">
            <CardContent className="p-16 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                <Bell className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-light text-foreground tracking-display mb-2">
                All caught up.
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                You'll be notified when documents are processed, approved, or payments confirmed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Unread section */}
            {notifications.some((n) => !n.read) && (
              <div className="space-y-2">
                <p className="text-[11px] tracking-eyebrow uppercase text-accent font-semibold px-1 mb-3">
                  Unread · {unreadCount}
                </p>
                {notifications.filter((n) => !n.read).map((n) => (
                  <Card
                    key={n.id}
                    className="shadow-soft border border-accent/30 bg-accent/5 cursor-pointer card-hover"
                    onClick={() => markAsRead(n.id)}
                  >
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="h-2.5 w-2.5 rounded-full bg-accent shrink-0 mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-base font-light text-card-foreground tracking-display leading-snug">{n.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                        <p className="text-[11px] tracking-eyebrow uppercase text-muted-foreground/60 font-semibold mt-2">
                          {new Date(n.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                          {" · "}
                          {new Date(n.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Read section */}
            {notifications.some((n) => n.read) && (
              <div className="space-y-2">
                {notifications.some((n) => !n.read) && (
                  <p className="text-[11px] tracking-eyebrow uppercase text-muted-foreground font-semibold px-1 mt-6 mb-3">
                    Earlier
                  </p>
                )}
                {notifications.filter((n) => n.read).map((n) => (
                  <Card key={n.id} className="shadow-soft border border-border/50 bg-background card-hover">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="h-2.5 w-2.5 rounded-full bg-border shrink-0 mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-base font-light text-muted-foreground tracking-display leading-snug">{n.title}</h4>
                        <p className="text-sm text-muted-foreground/70 mt-1 leading-relaxed">{n.message}</p>
                        <p className="text-[11px] tracking-eyebrow uppercase text-muted-foreground/40 font-semibold mt-2">
                          {new Date(n.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                          {" · "}
                          {new Date(n.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <CheckCheck className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default RemunerationNotifications;
