import { useEffect, useState } from "react";
import { FileText, BookOpen, Scale, Download, ExternalLink, BookMarked } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Legal Compliance": <Scale className="h-5 w-5 text-primary" />,
  "Branch Documents": <FileText className="h-5 w-5 text-primary" />,
  "Practice Guides": <BookOpen className="h-5 w-5 text-primary" />,
  "General": <BookMarked className="h-5 w-5 text-primary" />,
};

const TYPE_STYLES: Record<string, string> = {
  PDF: "bg-primary/10 text-primary",
  Guide: "bg-accent/10 text-accent",
  Link: "bg-muted text-muted-foreground",
};

const Resources = () => {
  const [grouped, setGrouped] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    supabase
      .from("resources")
      .select("*")
      .or("portal.eq.both,portal.eq.remuneration")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        const items = data || [];
        setEmpty(items.length === 0);
        const map: Record<string, any[]> = {};
        items.forEach((r) => {
          if (!map[r.category]) map[r.category] = [];
          map[r.category].push(r);
        });
        setGrouped(map);
        setLoading(false);
      });
  }, []);

  return (
    <PortalLayout>
      <div className="space-y-12">
        <PageHeader
          eyebrow="Library"
          title="Resources"
          subtitle="Official documents, guides, and references for NBA members."
        />

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : empty ? (
          <Card className="shadow-elegant border-0">
            <CardContent className="p-16 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mb-6">
                <BookMarked className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-light text-foreground tracking-display mb-2">
                No resources yet.
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                The committee hasn't uploaded any documents or guides yet. Check back soon.
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <section key={category} className="space-y-5">
              {/* Category header */}
              <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  {CATEGORY_ICONS[category] || <BookMarked className="h-4 w-4 text-primary" />}
                </div>
                <h2 className="font-display text-xl font-light text-primary tracking-display">{category}</h2>
                <span className="ml-auto text-[11px] tracking-eyebrow uppercase text-muted-foreground font-semibold">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="shadow-soft border border-border/60 bg-background group card-hover"
                  >
                    <CardContent className="p-6 flex flex-col h-full gap-4">
                      {/* Top row: icon + type badge */}
                      <div className="flex items-start justify-between">
                        <div className="h-10 w-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 icon-hover">
                          {CATEGORY_ICONS[item.category] || <BookMarked className="h-5 w-5 text-primary" />}
                        </div>
                        <span className={`text-[10px] tracking-eyebrow uppercase font-semibold px-2.5 py-1 rounded-sm ${TYPE_STYLES[item.type] || TYPE_STYLES.Link}`}>
                          {item.type}
                        </span>
                      </div>

                      {/* Title + description */}
                      <div className="flex-1">
                        <h3 className="font-display text-base font-light text-card-foreground tracking-display leading-snug mb-2">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                        )}
                      </div>

                      {/* Divider + action */}
                      <div className="pt-3 border-t border-border/50">
                        {item.file_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="w-full justify-start gap-2 text-[11px] tracking-eyebrow uppercase font-semibold text-primary hover:text-accent hover:bg-accent/5 px-0 transition-elegant"
                          >
                            <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                              {item.type === "Link" ? (
                                <><ExternalLink className="h-3.5 w-3.5" />Open Link</>
                              ) : (
                                <><Download className="h-3.5 w-3.5" />Download {item.type}</>
                              )}
                            </a>
                          </Button>
                        ) : (
                          <p className="text-[11px] tracking-eyebrow uppercase text-muted-foreground/60 font-semibold">
                            Not yet available
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </PortalLayout>
  );
};

export default Resources;
