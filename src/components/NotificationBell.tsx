import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

const NotificationBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase.from("notifications").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(8)
      .then(({ data }) => { setNotifications(data || []); setLoading(false); });

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 8));
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

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

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative text-primary-foreground/80 hover:text-primary-foreground p-1 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-primary text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-[4.5rem] sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-96 bg-background border border-border/60 rounded-sm shadow-elegant z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <span className="h-px w-6 bg-accent" />
              <h3 className="font-display text-base font-light text-foreground tracking-display">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] tracking-eyebrow uppercase font-semibold text-accent">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground hover:text-accent transition-elegant flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-elegant">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <p className="font-display text-sm font-light text-foreground tracking-display">All caught up.</p>
                <p className="text-xs text-muted-foreground mt-1">No new notifications.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const isExpanded = expanded === n.id;
                return (
                  <div
                    key={n.id}
                    className={`px-5 py-4 border-b border-border/50 last:border-0 transition-elegant cursor-pointer ${
                      !n.read ? "bg-accent/5 border-l-2 border-l-accent" : "hover:bg-muted/30"
                    }`}
                    onClick={() => {
                      setExpanded(isExpanded ? null : n.id);
                      if (!n.read) markAsRead(n.id);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${n.read ? "bg-border" : "bg-accent"}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`font-display text-sm font-light tracking-display leading-snug ${n.read ? "text-muted-foreground" : "text-foreground"}`}>
                          {n.title}
                        </p>
                        <p className={`text-xs mt-1 leading-relaxed ${isExpanded ? "" : "line-clamp-2"} ${n.read ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
                          {n.message}
                        </p>
                        <p className="text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground/50 mt-1.5">
                          {new Date(n.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                          {" · "}
                          {new Date(n.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {n.read && <CheckCheck className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border/60 bg-muted/20">
            <Link
              to="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="text-[11px] tracking-eyebrow uppercase font-semibold text-primary hover:text-accent transition-elegant"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
