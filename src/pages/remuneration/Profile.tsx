import { useState, useEffect } from "react";
import { User, Save, Loader2 } from "lucide-react";
import BranchSelect from "@/components/BranchSelect";
import PortalLayout from "@/components/PortalLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FIELD_GROUPS = [
  {
    title: "Personal Information",
    fields: [
      { key: "first_name", label: "First Name", required: true },
      { key: "middle_name", label: "Middle Name" },
      { key: "surname", label: "Surname", required: true },
    ],
  },
  {
    title: "Bar Details",
    fields: [
      { key: "ban", label: "Bar Association Number (BAN)", readonly: true },
      { key: "year_of_call", label: "Year of Call", readonly: true },
      { key: "branch", label: "NBA Branch" },
    ],
  },
  {
    title: "Contact",
    fields: [
      { key: "phone", label: "Phone Number" },
      { key: "office_address", label: "Office Address", multiline: true },
    ],
  },
];

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("id, first_name, middle_name, surname, ban, year_of_call, branch, phone, office_address")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfileId(data.id);
          const { id, ...rest } = data;
          setProfile(Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, v ?? ""])));
        }
        setLoading(false);
      });
  }, [user]);

  const handleChange = (key: string, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user || !profileId) return;
    if (!profile.first_name?.trim() || !profile.surname?.trim()) {
      toast({ title: "First name and surname are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", profileId);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
      return;
    }
    await refreshProfile();
    toast({ title: "Profile updated successfully." });
  };

  return (
    <PortalLayout>
      <div className="space-y-8 max-w-2xl">
        <PageHeader
          eyebrow="Account"
          title="My Profile"
          subtitle="Manage your personal and professional information."
          action={
            <Button onClick={handleSave} disabled={saving || loading} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Email — read only */}
            <Card className="shadow-soft border border-border/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-light text-foreground tracking-display">
                      {[profile.first_name, profile.surname].filter(Boolean).join(" ") || "Your Name"}
                    </p>
                    <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60 mt-0.5">
                      {user?.email}
                    </p>
                    <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60">
                      {profile.branch || "NBA Member"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {FIELD_GROUPS.map((group) => (
              <Card key={group.title} className="shadow-soft border border-border/60">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                    <span className="h-px w-6 bg-accent" />
                    <h3 className="text-[11px] tracking-eyebrow uppercase font-semibold text-accent">{group.title}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.fields.map((field) => (
                      <div key={field.key} className={(field as any).multiline ? "md:col-span-2" : ""}>
                        <label className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </label>
                        {(field as any).readonly ? (
                          <div className="mt-1.5 w-full border border-border/40 bg-muted/40 px-3 py-2 rounded-sm text-sm text-muted-foreground select-none">
                            {profile[field.key] || <span className="text-muted-foreground/50 italic">Not set</span>}
                          </div>
                        ) : field.key === "branch" ? (
                          <BranchSelect
                            value={profile.branch || ""}
                            onChange={(v) => handleChange("branch", v)}
                            className="mt-1.5"
                          />
                        ) : (field as any).multiline ? (
                          <textarea
                            value={profile[field.key] || ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            rows={3}
                            className="mt-1.5 w-full border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={profile[field.key] || ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            className="mt-1.5 w-full border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default Profile;
