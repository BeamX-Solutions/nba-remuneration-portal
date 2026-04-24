import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
    <h1 className="font-heading text-6xl font-bold text-primary mb-4">404</h1>
    <p className="text-xl text-foreground font-semibold mb-2">Page not found</p>
    <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
    <Button asChild><Link to="/">Go Home</Link></Button>
  </div>
);

export default NotFound;
