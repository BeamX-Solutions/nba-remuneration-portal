import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, FileText, Bell, LogOut, Menu, Megaphone, BookMarked, CheckSquare, BarChart2, ScrollText, UserCog } from "lucide-react";
import nbaLogo from "@/assets/nba-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const sidebarItems = [
  { label: "Dashboard",          href: "/admin",                   icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Members",            href: "/admin/members",           icon: <Users className="h-4 w-4" /> },
  { label: "Documents",          href: "/admin/documents",         icon: <FileText className="h-4 w-4" /> },
  { label: "Approval Queue",     href: "/admin/approval-queue",    icon: <CheckSquare className="h-4 w-4" /> },
  { label: "Reporting",          href: "/admin/reporting",         icon: <BarChart2 className="h-4 w-4" /> },
  { label: "Announcements",      href: "/admin/announcements",     icon: <Megaphone className="h-4 w-4" /> },
  { label: "Resources",          href: "/admin/resources",         icon: <BookMarked className="h-4 w-4" /> },
  { label: "Send Notification",  href: "/admin/notify",            icon: <Bell className="h-4 w-4" /> },
  { label: "Audit Logs",         href: "/admin/audit-logs",        icon: <ScrollText className="h-4 w-4" /> },
  { label: "Admin Roles",        href: "/admin/roles",             icon: <UserCog className="h-4 w-4" /> },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-primary-foreground/20">
        <div className="flex items-center gap-2 mb-1">
          <img src={nbaLogo} alt="NBA Logo" className="h-7 w-7 object-contain" />
          <h2 className="font-display text-xl font-light text-accent tracking-display">Admin Panel</h2>
        </div>
        <p className="text-xs text-primary-foreground/60 truncate">{user?.email}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-[11px] tracking-eyebrow uppercase font-semibold transition-colors",
              location.pathname === item.href
                ? "bg-accent text-primary"
                : "text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-primary-foreground/20">
        <Button
          variant="ghost" size="sm"
          className="w-full justify-start text-primary-foreground/75 hover:text-primary-foreground hover:bg-primary-foreground/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-64 flex-col bg-primary text-primary-foreground flex-shrink-0">
        <SidebarContent />
      </aside>
      <main className="flex-1 bg-parchment overflow-auto min-w-0">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground sticky top-0 z-40">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center justify-center h-9 w-9 rounded-sm border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:border-primary-foreground/35 transition-colors flex-shrink-0">
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-primary text-primary-foreground border-r border-primary-foreground/20 flex flex-col">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <img src={nbaLogo} alt="NBA Logo" className="h-6 w-6 object-contain" />
            <span className="font-display font-light text-base text-accent tracking-display">Admin Panel</span>
          </div>
        </div>
        <div className="p-4 md:p-8 animate-fade-in">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
