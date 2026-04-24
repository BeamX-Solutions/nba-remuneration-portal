import { FileText, CreditCard, Home, FolderOpen, Search, BookMarked, Scale } from "lucide-react";

export const sidebarItems = [
  { label: "Home", href: "/dashboard/home", icon: <Home className="h-4 w-4" /> },
  { label: "Prepare a Document", href: "/dashboard/prepare", icon: <FileText className="h-4 w-4" /> },
  { label: "My Documents", href: "/dashboard/documents", icon: <FolderOpen className="h-4 w-4" /> },
  { label: "Payment History", href: "/dashboard/payments", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Find a Document", href: "/dashboard/search", icon: <Search className="h-4 w-4" /> },
  { label: "Resources", href: "/resources", icon: <BookMarked className="h-4 w-4" /> },
  { label: "Guidelines", href: "/dashboard/guidelines", icon: <Scale className="h-4 w-4" /> },
];
