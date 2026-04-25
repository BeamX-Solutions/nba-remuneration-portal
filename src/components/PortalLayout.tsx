import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import PortalHeader from "@/components/PortalHeader";
import { useAuth } from "@/contexts/AuthContext";
import { sidebarItems } from "@/lib/sidebarItems";

const PortalLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { profileName, profileBranch, profileAvatar } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const fullName = profileName || "";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User info */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-sidebar-border shrink-0 bg-sidebar-accent flex items-center justify-center">
            {profileAvatar
              ? <img src={profileAvatar} alt="Profile" className="h-full w-full object-cover" />
              : <span className="text-sm font-semibold text-sidebar-foreground/70">
                  {fullName ? fullName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() : "?"}
                </span>}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-sidebar-foreground/40 font-medium">Legal Practitioner</p>
            <h2 className="font-display font-light text-sidebar-foreground text-sm leading-tight truncate">{fullName}</h2>
          </div>
        </div>
        <p className="text-xs text-sidebar-foreground/50">{profileBranch || "NBA Member"}</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-sidebar-border mx-4 mb-4" />

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 py-2.5 text-[11px] tracking-eyebrow uppercase font-semibold rounded-r-md nav-item-hover",
                isActive
                  ? "border-l-[3px] border-sidebar-primary text-sidebar-foreground bg-sidebar-accent pl-[9px] pr-3"
                  : "text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 px-3"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* New Filing button */}
      <div className="p-4 mt-auto">
        <Link
          to="/dashboard/prepare"
          onClick={() => setMobileOpen(false)}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-[11px] tracking-eyebrow uppercase font-semibold hover:bg-sidebar-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Filing
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <PortalHeader sidebarContent={<SidebarContent />} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex flex-1">
        <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <SidebarContent />
        </aside>
        <main className="flex-1 bg-parchment min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
