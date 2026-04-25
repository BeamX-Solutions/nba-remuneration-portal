import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, ChevronDown, User, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Avatar = ({ src, initials, size }: { src: string | null; initials: string; size: "sm" | "md" }) => {
  const cls = size === "sm"
    ? "h-8 w-8 text-xs font-semibold"
    : "h-9 w-9 text-sm font-semibold";

  return (
    <div className={`${cls} rounded-full overflow-hidden flex items-center justify-center ring-2 ring-primary-foreground/20 bg-primary-foreground/20 shrink-0`}>
      {src
        ? <img src={src} alt="Profile" className="h-full w-full object-cover" />
        : <span className="text-primary-foreground">{initials}</span>}
    </div>
  );
};

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut, profileName, profileAvatar } = useAuth();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate("/");
  };

  if (!user) return null;

  const initials = profileName
    ? profileName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : (user.email?.[0] ?? "?").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
        aria-label="Profile menu"
      >
        <Avatar src={profileAvatar} initials={initials} size="sm" />
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <div className="h-9 w-9 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 ring-1 ring-border">
              {profileAvatar
                ? <img src={profileAvatar} alt="Profile" className="h-full w-full object-cover" />
                : <span className="text-sm font-semibold text-muted-foreground">{initials}</span>}
            </div>
            <div className="min-w-0">
              {profileName && <p className="text-sm font-semibold text-card-foreground truncate">{profileName}</p>}
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="py-1">
            <Link
              to="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-card-foreground hover:bg-muted transition-colors w-full"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              My Profile
            </Link>
            <Link
              to="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-card-foreground hover:bg-muted transition-colors w-full"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Settings
            </Link>
          </div>
          <div className="border-t border-border py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
