import { useState, useEffect, useRef } from "react";
import { Search, FileText, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const DOC_TYPE_LABELS: Record<string, string> = {
  deed_of_assignment: "Deed of Assignment",
  deed_of_gift: "Deed of Gift",
  mortgage_deed: "Mortgage Deed",
  power_of_attorney: "Power of Attorney",
  contract_of_sale: "Contract of Sale",
  tenancy_agreement: "Tenancy Agreement",
  precedent: "Precedent",
};

const HeaderSearch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim() || !user) { setResults([]); setOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("documents")
        .select("id, title, document_type, reference_number, status, created_at")
        .eq("user_id", user.id)
        .or(`title.ilike.%${query}%,reference_number.ilike.%${query}%,document_type.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(5);
      setResults(data || []);
      setOpen(true);
      setLoading(false);
    }, 300);
  }, [query, user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setQuery(""); } };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("mousedown", handleClick); document.removeEventListener("keydown", handleKey); };
  }, []);

  const handleSelect = () => {
    setOpen(false);
    setQuery("");
    navigate("/dashboard/documents");
  };

  return (
    <div className="relative flex-1 max-w-md mx-auto hidden md:block" ref={containerRef}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/50 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (results.length > 0) setOpen(true); }}
        placeholder="Search documents..."
        className="w-full h-11 pl-10 pr-9 rounded-sm bg-primary-foreground/10 border border-primary-foreground/20 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:bg-primary-foreground/15 focus:border-primary-foreground/40 transition-all duration-200"
      />
      {query && (
        <button
          onClick={() => { setQuery(""); setOpen(false); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/40 hover:text-primary-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-background border border-border/60 rounded-sm shadow-elegant z-50 overflow-hidden">
          {loading ? (
            <div className="px-4 py-3 flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-center">
              <p className="text-sm text-muted-foreground">No documents found for "{query}"</p>
            </div>
          ) : (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              {results.map((doc) => (
                <button
                  key={doc.id}
                  onClick={handleSelect}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors border-t border-border/40 first:border-0 text-left"
                >
                  <div className="h-8 w-8 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-light text-foreground tracking-display leading-snug truncate">{doc.title}</p>
                    <p className="text-[10px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60 mt-0.5">
                      {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
                      {doc.reference_number && ` · ${doc.reference_number}`}
                    </p>
                  </div>
                  <span className={`text-[10px] tracking-eyebrow uppercase font-semibold shrink-0 mt-1 ${doc.status === "completed" ? "text-green-600" : "text-accent"}`}>
                    {doc.status}
                  </span>
                </button>
              ))}
              <div className="px-4 py-2 border-t border-border/40 bg-muted/20">
                <button onClick={handleSelect} className="text-[11px] tracking-eyebrow uppercase font-semibold text-primary hover:text-accent transition-colors">
                  View all documents →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
