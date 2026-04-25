import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import ProfileDropdown from "@/components/ProfileDropdown";
import HeaderSearch from "@/components/HeaderSearch";
import nbaLogo from "@/assets/nba-logo.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface PortalHeaderProps {
  sidebarContent?: ReactNode;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

const PortalHeader = ({ sidebarContent, mobileOpen = false, setMobileOpen = () => {} }: PortalHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-md">
      <div className="flex h-16 items-center px-6 gap-4">
        {/* Mobile: hamburger */}
        <div className="lg:hidden shrink-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center justify-center h-9 w-9 rounded-sm border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:border-primary-foreground/35 transition-colors">
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
              {sidebarContent}
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo + brand */}
        <Link to="/dashboard/home" className="flex items-center gap-2.5 shrink-0">
          <img src={nbaLogo} alt="NBA" className="h-9 w-9" />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-[17px] font-semibold text-primary-foreground tracking-display">NBA Remuneration</span>
            <span className="text-[11px] tracking-eyebrow uppercase text-primary-foreground/60 font-medium">Legal Document Portal</span>
          </div>
        </Link>

        {/* Search bar */}
        <HeaderSearch />

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              <NotificationBell />
              <Link
                to="/dashboard/about"
                className="hidden sm:block text-[11px] tracking-eyebrow uppercase font-semibold text-primary-foreground/70 hover:text-primary-foreground transition-elegant px-1"
              >
                Support
              </Link>
              <ProfileDropdown />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80" asChild>
                <Link to="/signin">Log In</Link>
              </Button>
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PortalHeader;
