import { useState } from "react";
import { Lock, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!next.trim() || !confirm.trim()) {
      toast({ title: "All fields are required.", variant: "destructive" }); return;
    }
    if (next.length < 8) {
      toast({ title: "Password must be at least 8 characters.", variant: "destructive" }); return;
    }
    if (next !== confirm) {
      toast({ title: "Passwords do not match.", variant: "destructive" }); return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: next });
    setSaving(false);
    if (error) {
      toast({ title: "Failed to update password", description: error.message, variant: "destructive" }); return;
    }
    setDone(true);
    setCurrent(""); setNext(""); setConfirm("");
    toast({ title: "Password updated successfully." });
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <PortalLayout>
      <div className="space-y-8 max-w-lg">
        <PageHeader eyebrow="Account" title="Settings" subtitle="Manage your account security and preferences." />

        <Card className="shadow-soft border border-border/60">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b border-border/50">
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-display text-base font-light text-foreground tracking-display">Change Password</h3>
            </div>

            {done ? (
              <div className="flex items-center gap-3 py-4">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <p className="text-sm text-foreground">Password updated successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  { label: "Current Password", value: current, setter: setCurrent, show: showCurrent, toggle: setShowCurrent },
                  { label: "New Password", value: next, setter: setNext, show: showNext, toggle: setShowNext },
                  { label: "Confirm New Password", value: confirm, setter: setConfirm, show: showNext, toggle: setShowNext },
                ].map((f, i) => (
                  <div key={i}>
                    <label className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">{f.label}</label>
                    <div className="relative mt-1.5">
                      <input
                        type={f.show ? "text" : "password"}
                        value={f.value}
                        onChange={(e) => f.setter(e.target.value)}
                        className="w-full border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => f.toggle(!f.show)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {f.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60">
                  Minimum 8 characters
                </p>
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  {saving ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default Settings;
