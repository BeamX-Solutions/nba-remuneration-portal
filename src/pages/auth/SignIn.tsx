import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import nbaLogo from "@/assets/nba-logo.png";
import heroBg from "@/assets/hero-bg.jpg";

const SignIn = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      return;
    }
    navigate("/dashboard");
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const reset = setTimeout(() => setGoogleLoading(false), 10000);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    clearTimeout(reset);
    if (error) {
      setGoogleLoading(false);
      toast({ title: "Google sign in failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-14 overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />

        {/* Top brand */}
        <div className="relative z-10 flex items-center gap-3">
          <img src={nbaLogo} alt="NBA" className="h-11 w-11 object-contain" />
          <div className="leading-tight">
            <p className="font-display text-[17px] font-semibold text-ivory tracking-display">NBA Remuneration</p>
            <p className="text-[11px] tracking-eyebrow uppercase text-ivory/60 font-medium">Legal Document Portal</p>
          </div>
        </div>

        {/* Center copy */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-accent" />
            <span className="text-[11px] tracking-eyebrow uppercase text-accent font-medium">Member Portal</span>
          </div>
          <h2 className="font-display text-5xl xl:text-6xl text-ivory font-light leading-[1.0] tracking-display mb-6">
            Good to have
            <br />
            you{" "}
            <em className="text-gradient-gold font-normal italic">back.</em>
          </h2>
          <p className="text-ivory/70 text-base leading-relaxed max-w-sm">
            Your documents, approvals, and remuneration records are waiting. Sign in to pick up right where you left off.
          </p>
        </div>

        <div className="relative z-10 border-t border-ivory/15 pt-8">
          <p className="text-[11px] tracking-eyebrow uppercase text-ivory/40">Nigerian Bar Association · Est. 1959</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-parchment">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border/50">
          <div className="flex items-center gap-2.5 lg:hidden">
            <img src={nbaLogo} alt="NBA" className="h-8 w-8" />
            <span className="font-display text-sm font-semibold text-primary">NBA Remuneration</span>
          </div>
          <div className="hidden lg:block" />
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-elegant">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px w-8 bg-accent" />
              <span className="text-[11px] tracking-eyebrow uppercase text-accent font-semibold">Member Access</span>
            </div>

            <h1 className="font-display text-4xl font-light text-primary tracking-display leading-[1.05] mb-2">
              Welcome back.
            </h1>
            <p className="text-muted-foreground text-sm mb-8">Sign in to your NBA Remuneration account.</p>

            <div className="h-px bg-accent/30 mb-8" />

            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-sm border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-elegant"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <Link to="/forgot-password" className="text-xs text-accent hover:text-accent/80 transition-elegant">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} required value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full rounded-sm border border-input bg-background px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-elegant"
                  />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold rounded-sm" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center">
                <span className="bg-parchment px-3 text-xs text-muted-foreground tracking-eyebrow uppercase">or continue with</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full flex items-center gap-2 h-11 rounded-sm border-border/70 hover:border-accent/40 transition-elegant" onClick={handleGoogle} disabled={googleLoading}>
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {googleLoading ? "Redirecting..." : "Continue with Google"}
            </Button>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-semibold hover:text-accent transition-elegant">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
