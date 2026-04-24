import { useState } from "react";
import { Loader2, Search, FileText } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const FindDocument = () => {
  const [ban, setBan] = useState("");
  const [refNumber, setRefNumber] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!ban.trim() || !refNumber.trim()) return;
    setSearching(true);
    setSearched(true);
    const { data } = await supabase.from("documents")
      .select("id, title, document_type, reference_number, ban, status, created_at")
      .eq("status", "completed").eq("ban", ban.trim())
      .ilike("reference_number", `%${refNumber.trim()}%`)
      .order("created_at", { ascending: false });
    setResults(data || []);
    setSearching(false);
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="Document Registry" title="Find a Document" subtitle="Look up completed documents using both BAN and reference number for security." />

        <Card className="shadow-card">
          <CardContent className="p-4 md:p-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" value={ban} onChange={(e) => setBan(e.target.value)}
                  placeholder="BAN (e.g. 12345)"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                <input type="text" value={refNumber} onChange={(e) => setRefNumber(e.target.value)}
                  placeholder="Reference number (e.g. REM-ABC123)"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <Button type="submit" disabled={searching || !ban.trim() || !refNumber.trim()} className="w-full">
                {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Search
              </Button>
              <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60 text-center">Both BAN and reference number are required</p>
            </form>
          </CardContent>
        </Card>

        {!searched ? (
          <Card className="shadow-card">
            <CardContent className="p-10 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-light text-foreground tracking-display mb-1">Enter BAN & Reference Number</h3>
              <p className="text-sm text-muted-foreground">Provide both to search the document registry.</p>
            </CardContent>
          </Card>
        ) : results.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-10 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-light text-foreground tracking-display mb-1">No documents found</h3>
              <p className="text-sm text-muted-foreground">No completed documents matched BAN "{ban}" and reference "{refNumber}".</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground/60">{results.length} document{results.length !== 1 ? "s" : ""} found</p>
            {results.map((doc) => (
              <Card key={doc.id} className="shadow-card">
                <CardContent className="p-4 flex items-center gap-4">
                  <FileText className="h-8 w-8 text-accent shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base font-light text-card-foreground tracking-display leading-snug truncate">{doc.title}</h3>
                    <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground mt-1">
                      {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
                      {doc.ban && ` · BAN: ${doc.ban}`}
                      {doc.reference_number && ` · Ref: ${doc.reference_number}`}
                    </p>
                  </div>
                  <Badge variant="default" className="capitalize flex-shrink-0">Completed</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default FindDocument;
