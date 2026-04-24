import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import SplashScreen from "@/components/SplashScreen";

import Index from "./pages/Index.tsx";
import DashboardRedirect from "./pages/DashboardRedirect.tsx";
import NotFound from "./pages/NotFound.tsx";

// Auth pages
import SignIn from "./pages/auth/SignIn.tsx";
import SignUp from "./pages/auth/SignUp.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";
import CompleteProfile from "./pages/auth/CompleteProfile.tsx";

// Remuneration pages
import RemunerationDashboard from "./pages/remuneration/RemunerationDashboard.tsx";
import PrepareDocument from "./pages/remuneration/PrepareDocument.tsx";
import MyDocuments from "./pages/remuneration/MyDocuments.tsx";
import PaymentHistory from "./pages/remuneration/PaymentHistory.tsx";
import FindDocument from "./pages/remuneration/FindDocument.tsx";
import RemunerationNotifications from "./pages/remuneration/RemunerationNotifications.tsx";
import RemunerationAbout from "./pages/remuneration/RemunerationAbout.tsx";
import Resources from "./pages/Resources.tsx";
import Guidelines from "./pages/remuneration/Guidelines.tsx";
import Profile from "./pages/remuneration/Profile.tsx";
import Settings from "./pages/remuneration/Settings.tsx";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminRemunerationMembers from "./pages/admin/AdminRemunerationMembers.tsx";
import AdminDocuments from "./pages/admin/AdminDocuments.tsx";
import AdminApprovalQueue from "./pages/admin/AdminApprovalQueue.tsx";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements.tsx";
import AdminNotify from "./pages/admin/AdminNotify.tsx";
import AdminResources from "./pages/admin/AdminResources.tsx";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <SplashScreen>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />

              {/* Auth routes */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />

              {/* Remuneration portal */}
              <Route path="/dashboard/home" element={<ProtectedRoute><RemunerationDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/prepare" element={<ProtectedRoute><PrepareDocument /></ProtectedRoute>} />
              <Route path="/dashboard/documents" element={<ProtectedRoute><MyDocuments /></ProtectedRoute>} />
              <Route path="/dashboard/payments" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
              <Route path="/dashboard/search" element={<ProtectedRoute><FindDocument /></ProtectedRoute>} />
              <Route path="/dashboard/notifications" element={<ProtectedRoute><RemunerationNotifications /></ProtectedRoute>} />
              <Route path="/dashboard/about" element={<ProtectedRoute><RemunerationAbout /></ProtectedRoute>} />
              <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
              <Route path="/dashboard/guidelines" element={<ProtectedRoute><Guidelines /></ProtectedRoute>} />
              <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/members" element={<AdminRoute><AdminRemunerationMembers /></AdminRoute>} />
              <Route path="/admin/documents" element={<AdminRoute><AdminDocuments /></AdminRoute>} />
              <Route path="/admin/approval-queue" element={<AdminRoute><AdminApprovalQueue /></AdminRoute>} />
              <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
              <Route path="/admin/notify" element={<AdminRoute><AdminNotify /></AdminRoute>} />
              <Route path="/admin/resources" element={<AdminRoute><AdminResources /></AdminRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </SplashScreen>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
