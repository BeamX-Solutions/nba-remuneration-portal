import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import BranchSelect from "@/components/BranchSelect";
import nbaLogo from "@/assets/nba-logo.png";
import heroBg from "@/assets/hero-bg.jpg";
import { Loader2 } from "lucide-react";

const fields = [
  { key: "surname",        label: "Surname",                    required: true },
  { key: "first_name",     label: "First Name",                 required: true },
  { key: "middle_name",    label: "Middle Name" },
  { key: "ban",            label: "BAN (Bar Admission Number)", required: true,  placeholder: "e.g. 12345",  locked: true },
  { key: "year_of_call",   label: "Year of Call",               placeholder: "e.g. 2018", locked: true },
  { key: "phone",          label: "Phone Number",               required: true },
  { key: "office_address", label: "Office Address",             fullWidth: true },
];

const CompleteProfile = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lockedFields, setLockedFields] = useState<Set<string>>(new Set());

  const [form, setForm] = useState({
    surname: "", first_name: "", middle_name: "", ban: "",
    year_of_call: "", phone: "", office_address: "", branch: "",
  });

  useEffect(() => {
    if (!user) { navigate("/signin", { replace: true }); return; }
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, surname, middle_name, ban, year_of_call, phone, branch, office_address")
        .eq("user_id", user.id)
        .maybeSingle();
      const meta = user.user_metadata ?? {};
      const locked = new Set<string>();
      setForm({
        first_name:     data?.first_name     || meta.full_name?.split(" ")[0] || meta.first_name || "",
        surname:        data?.surname        || meta.full_name?.split(" ").slice(-1)[0] || meta.surname || "",
        middle_name:    data?.middle_name    || "",
        ban:            data?.ban            || "",
        year_of_call:   data?.year_of_call   || "",
        phone:          data?.phone          || meta.phone || "",
        branch:         data?.branch         || "",
        office_address: data?.office_address || "",
      });
      if (data?.ban)          locked.add("ban");
      if (data?.year_of_call) locked.add("year_of_call");
      setLockedFields(locked);
    };
    load();
  }, [user, navigate]);

  const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").upsert({
      user_id:        user.id,
      email:          user.email,
      surname:        form.surname,
      first_name:     form.first_name,
      middle_name:    form.middle_name    || null,
      ban:            form.ban            || null,
      year_of_call:   form.year_of_call   || null,
      phone:          form.phone,
      office_address: form.office_address || null,
      branch:         form.branch,
    }, { onConflict: "user_id" });
    setLoading(false);
    if (error) {
      toast({ title: "Failed to save profile", description: error.message, variant: "destructive" });
      return;
    }
    await refreshProfile();
    toast({ title: "Profile complete!", description: "Your account is pending approval." });
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-14 overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative z-10 flex items-center gap-3">
          <img src={nbaLogo} alt="NBA" className="h-11 w-11 object-contain" />
          <div className="leading-tight">
            <p className="font-display text-[17px] font-semibold text-ivory tracking-display">NBA Remuneration</p>
            <p className="text-[11px] tracking-eyebrow uppercase text-ivory/60 font-medium">Legal Document Portal</p>
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-accent" />
            <span className="text-[11px] tracking-eyebrow uppercase text-accent font-medium">Member Profile Setup</span>
          </div>
          <h2 className="font-display text-5xl xl:text-6xl text-ivory font-light leading-[1.0] tracking-display mb-6">
            Almost there,<br />
            <em className="text-gradient-gold font-normal italic">counselor.</em>
          </h2>
          <p className="text-ivory/70 text-base leading-relaxed max-w-sm">
            Complete your member profile to activate your account. Your details are verified against the NBA register before access is granted.
          </p>
        </div>
        <div className="relative z-10 border-t border-ivory/15 pt-8">
          <p className="text-[11px] tracking-eyebrow uppercase text-ivory/40">Nigerian Bar Association · Est. 1959</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-parchment overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center px-8 py-5 border-b border-border/50 lg:hidden">
          <div className="flex items-center gap-2.5">
            <img src={nbaLogo} alt="NBA" className="h-8 w-8" />
            <span className="font-display text-sm font-semibold text-primary">NBA Remuneration</span>
          </div>
        </div>

        <div className="flex-1 flex items-start justify-center px-8 py-12">
          <div className="w-full max-w-lg">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px w-8 bg-accent" />
              <span className="text-[11px] tracking-eyebrow uppercase text-accent font-semibold">Member Profile Setup</span>
            </div>
            <h1 className="font-display text-4xl font-light text-primary tracking-display leading-[1.05] mb-2">
              Complete your profile.
            </h1>
            <p className="text-muted-foreground text-sm mb-2">
              Fields marked <span className="text-destructive">*</span> are required.
            </p>
            <p className="text-muted-foreground/70 text-xs mb-8">
              BAN and Year of Call cannot be changed after saving.
            </p>
            <div className="h-px bg-accent/30 mb-8" />

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((f) => {
                  const isLocked = (f as any).locked && lockedFields.has(f.key);
                  return (
                    <div key={f.key} className={(f as any).fullWidth ? "sm:col-span-2" : ""}>
                      <label className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground flex items-center gap-2">
                        {f.label}
                        {f.required && <span className="text-destructive">*</span>}
                        {isLocked && (
                          <span className="text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded-sm">
                            locked
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required={f.required}
                        disabled={isLocked}
                        value={form[f.key as keyof typeof form]}
                        onChange={handleChange(f.key)}
                        placeholder={(f as any).placeholder ?? ""}
                        className="mt-1.5 w-full rounded-sm border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted transition-elegant"
                      />
                    </div>
                  );
                })}

                {/* Branch — full width searchable */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground flex items-center gap-2">
                    NBA Branch <span className="text-destructive">*</span>
                  </label>
                  <BranchSelect
                    value={form.branch}
                    onChange={(v) => setForm((prev) => ({ ...prev, branch: v }))}
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm font-semibold gap-2 mt-2"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Complete Setup"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
