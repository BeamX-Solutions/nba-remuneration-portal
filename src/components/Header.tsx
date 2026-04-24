import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import ProfileDropdown from "@/components/ProfileDropdown";
import nbaLogo from "@/assets/nba-logo.png";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className={`sticky top-0 z-50 shadow-sm ${user ? "bg-primary" : "bg-background border-b border-border"}`}>
      <div className="container flex h-16 items-center justify-between">
        <Link to={user ? "/dashboard/home" : "/"} className="flex items-center gap-2.5" aria-label="NBA Remuneration Portal">
          <img src={nbaLogo} alt="NBA Logo" className="h-9 w-9" />
          <div>
            <span className={`font-heading text-sm font-bold tracking-tight block leading-none ${user ? "text-primary-foreground" : "text-foreground"}`}>NBA REMUNERATION</span>
            <span className={`text-[10px] tracking-wide block leading-none mt-0.5 ${user ? "text-primary-foreground/60" : "text-muted-foreground"}`}>Legal Document Portal</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NotificationBell />
              <ProfileDropdown />
            </>
          ) : (
            <>
              <nav className="hidden md:flex items-center gap-7 mr-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/signin"
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Register <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <button
                className="md:hidden text-foreground"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          )}
        </div>
      </div>

      {mobileOpen && !user && (
        <div className="md:hidden bg-background border-t border-border pb-4">
          <nav className="container flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-semibold tracking-widest uppercase text-muted-foreground py-3 border-b border-border/50"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-2 pt-3">
              <Link
                to="/signin"
                className="inline-flex items-center text-sm font-semibold px-4 py-2 rounded-md border border-border text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md"
                onClick={() => setMobileOpen(false)}
              >
                Register <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
