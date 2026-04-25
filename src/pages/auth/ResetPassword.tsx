import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import nbaLogo from "@/assets/nba-logo.png";
import heroBg from "@/assets/hero-bg.jpg";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setReady(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Failed to update password", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/signin", { replace: true }), 3000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-14 overflow-hidden">
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
            <span className="text-[11px] tracking-eyebrow uppercase text-accent font-medium">Account Security</span>
          </div>
          <h2 className="font-display text-5xl xl:text-6xl text-ivory font-light leading-[1.0] tracking-display mb-6">
            New password,
            <br />
            <em className="text-gradient-gold font-normal italic">fresh start.</em>
          </h2>
          <p className="text-ivory/70 text-base leading-relaxed max-w-sm">
            Choose a strong password you haven't used before. Your documents and profile will remain exactly as you left them.
          </p>
        </div>

        <div className="relative z-10 border-t border-ivory/15 pt-8">
          <p className="text-[11px] tracking-eyebrow uppercase text-ivory/40">Nigerian Bar Association · Est. 1959</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-parchment">
        <div className="flex items-center justify-between px-8 py-5 border-b border-border/50">
          <div className="flex items-center gap-2.5 lg:hidden">
            <img src={nbaLogo} alt="NBA" className="h-8 w-8" />
            <span className="font-display text-sm font-semibold text-primary">NBA Remuneration</span>
          </div>
          <div className="hidden lg:block" />
          <Link to="/signin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-elegant">
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">
            {done ? (
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 border border-green-200 flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="h-7 w-7 text-green-600" />
                </div>
                <h1 className="font-display text-3xl font-light text-primary tracking-display mb-3">Password updated.</h1>
                <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                  Your password has been changed successfully. Redirecting you to sign in…
                </p>
                <Link to="/signin" className="text-primary font-semibold hover:text-accent transition-elegant text-sm">
                  Sign In now →
                </Link>
              </div>
            ) : !ready ? (
              <div className="text-center">
                <div className="flex items-center gap-3 mb-8 justify-center">
                  <span className="h-px w-8 bg-accent" />
                  <span className="text-[11px] tracking-eyebrow uppercase text-accent font-semibold">Invalid Link</span>
                </div>
                <h1 className="font-display text-3xl font-light text-primary tracking-display mb-3">Link expired.</h1>
                <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                  This reset link is invalid or has expired. Please request a new one.
                </p>
                <Link to="/forgot-password">
                  <Button className="w-full">Request New Link</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <span className="h-px w-8 bg-accent" />
                  <span className="text-[11px] tracking-eyebrow uppercase text-accent font-semibold">Set New Password</span>
                </div>

                <h1 className="font-display text-4xl font-light text-primary tracking-display leading-[1.05] mb-2">
                  Choose a new password.
                </h1>
                <p className="text-muted-foreground text-sm mb-8">Minimum 8 characters.</p>

                <div className="h-px bg-accent/30 mb-8" />

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full rounded-sm border border-input bg-background px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-elegant"
                      />
                      <button type="button" aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        required minLength={8}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full rounded-sm border border-input bg-background px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-elegant"
                      />
                      <button type="button" aria-label={showConfirm ? "Hide password" : "Show password"}
                        onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold rounded-sm" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
