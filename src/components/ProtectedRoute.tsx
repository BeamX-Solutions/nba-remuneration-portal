import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, LogOut } from "lucide-react";
import nbaLogo from "@/assets/nba-logo.png";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/components/AdminRoute";

const PendingApproval = () => {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <img src={nbaLogo} alt="NBA Remuneration Portal" className="h-8 w-8" />
          <span className="font-heading font-bold text-foreground text-sm">NBA Remuneration Portal</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-card border border-border rounded-2xl shadow-card w-full max-w-lg overflow-hidden">
          <div className="h-1 w-full bg-primary" />
          <div className="px-10 py-12 text-center space-y-6">
            <img src={nbaLogo} alt="NBA Remuneration Portal" className="h-14 w-14 mx-auto opacity-80" />
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">Nigerian Bar Association</p>
              <p className="text-sm italic text-muted-foreground">Remuneration Portal</p>
            </div>
            <div className="space-y-3">
              <h1 className="font-heading text-4xl font-bold text-foreground leading-tight">
                Account Pending<br />Approval
              </h1>
              <div className="w-10 h-px bg-accent mx-auto" />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              Your registration is being reviewed. You will receive an email notification once your access is granted.
            </p>
            <div className="bg-muted rounded-lg px-5 py-4 text-left flex items-start gap-3">
              <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground mb-1">Verification Status</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Typical processing time is 2–3 business days.
                </p>
              </div>
            </div>
            <Button onClick={signOut} className="w-full mt-2">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
          <div className="border-t border-border px-10 py-4 text-center">
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
              Legal Compliance &bull; Document Integrity &bull; Professional Standards
            </p>
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
