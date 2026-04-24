import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",").map((e: string) => e.trim().toLowerCase()).filter(Boolean);

export const isAdmin = (email: string) => !!email && adminEmails.includes(email.toLowerCase());

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;

  const email = user.email?.toLowerCase() ?? "";
  const metaMatch = user.app_metadata?.role === "admin";

  if (!isAdmin(email) && !metaMatch) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AdminRoute;
