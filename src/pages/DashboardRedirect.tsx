import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isAdmin } from "@/components/AdminRoute";

const DashboardRedirect = () => {
  const { user, loading, profileComplete } = useAuth();

  if (loading || (user && profileComplete === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;
  if (profileComplete === false) return <Navigate to="/complete-profile" replace />;

  const email = user.email?.toLowerCase() ?? "";
  if (isAdmin(email) || user.app_metadata?.role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard/home" replace />;
};

export default DashboardRedirect;
