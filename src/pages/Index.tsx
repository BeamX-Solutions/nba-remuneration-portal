import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import WhyUse from "@/components/landing/WhyUse";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard/home" replace />;

  return (
    <div className="min-h-screen bg-background" style={{ fontSize: "13px" }}>
      <Nav />
      <Hero />
      <About />
      <Features />
      <HowItWorks />
      <WhyUse />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
