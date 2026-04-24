import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MailCheck } from "lucide-react";
import nbaLogo from "@/assets/nba-logo.png";
import heroBg from "@/assets/hero-bg.jpg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { setSent(true); }
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
            <span className="text-[11px] tracking-eyebrow uppercase text-accent font-medium">Nigerian Bar Association · Est. 1959</span>
          </div>
          <h2 className="font-display text-5xl xl:text-6xl text-ivory font-light leading-[1.0] tracking-display mb-6">
            Happens to
            <br />
            the{" "}
            <em className="text-gradient-gold font-normal italic">best of us.</em>
          </h2>
          <p className="text-ivory/70 text-base leading-relaxed max-w-sm">
            We'll get you back in quickly. Enter your email and we'll send a secure link to reset your password right away.
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
            {sent ? (
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-6">
                  <MailCheck className="h-7 w-7 text-accent" />
                </div>
                <h1 className="font-display text-3xl font-light text-primary tracking-display mb-3">Check your inbox.</h1>
                <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                  We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>. It may take a minute to arrive.
                </p>
                <div className="h-px bg-accent/30 mb-8" />
                <Link to="/signin" className="text-primary font-semibold hover:text-accent transition-elegant text-sm">
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <span className="h-px w-8 bg-accent" />
                  <span className="text-[11px] tracking-eyebrow uppercase text-accent font-semibold">Password Reset</span>
                </div>

                <h1 className="font-display text-4xl font-light text-primary tracking-display leading-[1.05] mb-2">
                  Reset your password.
                </h1>
                <p className="text-muted-foreground text-sm mb-8">Enter your email and we'll send you a reset link.</p>

                <div className="h-px bg-accent/30 mb-8" />

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
                    <input
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-sm border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-elegant"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold rounded-sm" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link to="/signin" className="text-primary font-semibold hover:text-accent transition-elegant">Sign In</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
