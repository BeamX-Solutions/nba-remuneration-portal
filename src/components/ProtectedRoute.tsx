import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, LogOut } from "lucide-react";
import nbaLogo from "@/assets/nba-logo.png";
import heroBg from "@/assets/hero-bg.jpg";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/components/AdminRoute";

const PendingApproval = () => {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen flex">
      {/* Left panel — matches auth page hero style */}
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
            <span className="text-[11px] tracking-eyebrow uppercase text-accent font-medium">Membership Verification</span>
          </div>
          <h2 className="font-display text-5xl xl:text-6xl text-ivory font-light leading-[1.0] tracking-display mb-6">
            Almost
            <br />
            <em className="text-gradient-gold font-normal italic">there.</em>
          </h2>
          <p className="text-ivory/70 text-base leading-relaxed max-w-sm">
            Your account is under review by the NBA secretariat. Once approved, you will have full access to document preparation, remuneration tracking, and approvals.
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
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px w-8 bg-accent" />
              <span className="text-[11px] tracking-eyebrow uppercase text-accent font-semibold">Account Status</span>
            </div>

            <h1 className="font-display text-4xl font-light text-primary tracking-display leading-[1.05] mb-2">
              Pending approval.
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              Your registration is being reviewed by the NBA secretariat.
            </p>

            <div className="h-px bg-accent/30 mb-8" />

            <div className="space-y-4">
              <div className="bg-background border border-border rounded-lg px-5 py-4 flex items-start gap-3">
                <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-foreground mb-1">Processing Time</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Typical review takes 2–3 business days. You will receive an email once your account is approved.
                  </p>
                </div>
              </div>

              <div className="bg-accent/8 border border-accent/20 rounded-lg px-5 py-4">
                <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-foreground mb-1">What happens next?</p>
                <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                  <li className="flex items-start gap-2"><span className="text-accent mt-0.5">·</span> Admin reviews your registration details</li>
                  <li className="flex items-start gap-2"><span className="text-accent mt-0.5">·</span> You receive an email confirmation</li>
                  <li className="flex items-start gap-2"><span className="text-accent mt-0.5">·</span> Full portal access is granted</li>
                </ul>
              </div>
            </div>

            <Button onClick={signOut} variant="outline" className="w-full mt-8 gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profileComplete, profileStatus } = useAuth();

  if (loading || (user && profileComplete === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;
  if (profileComplete === false) return <Navigate to="/complete-profile" replace />;

  const adminUser = isAdmin(user.email?.toLowerCase() ?? "");
  if (!adminUser && profileStatus === "pending") return <PendingApproval />;

  return <>{children}</>;
};

export default ProtectedRoute;
