import { useState, useEffect, useRef } from "react";
import { User, Save, Loader2, Camera } from "lucide-react";
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
  const { user, profileAvatar, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("id, first_name, middle_name, surname, ban, year_of_call, branch, phone, office_address, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfileId(data.id);
          const { id, avatar_url, ...rest } = data;
          setProfile(Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, v ?? ""])));
          setAvatarUrl(avatar_url ?? null);
        }
        setLoading(false);
      });
  }, [user]);

  // Keep local avatar in sync if it changes from another tab via realtime
  useEffect(() => {
    setAvatarUrl(profileAvatar);
  }, [profileAvatar]);

  const handleChange = (key: string, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum size is 2 MB.", variant: "destructive" });
      return;
    }

    setUploadingAvatar(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploadingAvatar(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    // Bust cache so the new image loads immediately
    const cacheBusted = `${publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("user_id", user.id);

    setUploadingAvatar(false);

    if (updateError) {
      toast({ title: "Failed to save avatar", description: updateError.message, variant: "destructive" });
      return;
    }

    setAvatarUrl(cacheBusted);
    await refreshProfile();
    toast({ title: "Profile photo updated." });
    // Reset input so the same file can be re-selected if needed
    e.target.value = "";
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

  const initials = [profile.first_name, profile.surname]
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";

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
            {/* Avatar + identity card */}
            <Card className="shadow-soft border border-border/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-5">
                  {/* Avatar with upload overlay */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      disabled={uploadingAvatar}
                      className="group relative h-20 w-20 rounded-full overflow-hidden ring-2 ring-border focus:outline-none focus:ring-primary transition-all"
                      aria-label="Change profile photo"
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                          <User className="h-8 w-8 text-primary/60" />
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {uploadingAvatar
                          ? <Loader2 className="h-5 w-5 text-white animate-spin" />
                          : <Camera className="h-5 w-5 text-white" />}
                      </div>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
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
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      disabled={uploadingAvatar}
                      className="text-xs text-primary hover:text-accent transition-colors mt-1.5 font-medium"
                    >
                      {uploadingAvatar ? "Uploading..." : avatarUrl ? "Change photo" : "Upload photo"}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Field groups */}
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
