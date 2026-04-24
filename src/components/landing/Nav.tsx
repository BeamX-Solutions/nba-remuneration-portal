import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import nbaLogo from "@/assets/nba-logo.png";

const links = [
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "How it Works", href: "#how" },
];

const Nav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/60 backdrop-blur-md border-b border-border/20 shadow-sm">
      <nav className="container mx-auto flex items-center justify-between h-14 sm:h-20 px-4 sm:px-6">
        {/* Brand */}
        <a href="#" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <img src={nbaLogo} alt="NBA emblem" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
          <div className="leading-tight">
            <p className="font-display text-[15px] sm:text-[20px] font-semibold text-primary tracking-display">NBA Remuneration</p>
            <p className="hidden sm:block text-[10px] tracking-eyebrow uppercase text-muted-foreground font-medium">Legal Document Portal</p>
          </div>
        </a>

        {/* Center links — desktop */}
        <div className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] tracking-eyebrow uppercase font-semibold text-foreground/70 hover:text-primary transition-elegant"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right — desktop/tablet */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            to="/signin"
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-elegant"
          >
            Sign In
          </Link>
          <Button
            variant="default"
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-5 h-9 text-sm"
            asChild
          >
            <Link to="/signup">Register</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex items-center justify-center h-8 w-8 rounded-sm border border-border/60 text-foreground hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="sm:hidden bg-background border-t border-border/40 px-4 py-3 space-y-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-[11px] tracking-eyebrow uppercase font-semibold text-foreground/70 hover:text-primary hover:bg-muted/50 rounded-sm transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 pb-1 border-t border-border/40 flex gap-3">
            <Link
              to="/signin"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center py-2 text-sm font-medium text-foreground/80 border border-border rounded-sm hover:bg-muted transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Nav;
