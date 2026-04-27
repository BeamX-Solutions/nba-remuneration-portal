import { Scale, ShieldCheck, BookOpen } from "lucide-react";
import { ORDER_TITLE } from "@/lib/constants";
import PortalLayout from "@/components/PortalLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

const highlights = [
  {
    icon: <Scale className="h-7 w-7 text-accent" />,
    title: "Remuneration Order 2023 Compliance",
    body: "Every document generated through this portal is structured to comply with the Legal Practitioners Remuneration (For Business, Legal Service and Representation) Order, 2023, ensuring legal practitioners meet their statutory obligations.",
  },
  {
    icon: <ShieldCheck className="h-7 w-7 text-accent" />,
    title: "NBA Reference Number",
    body: "Every document processed through the portal is assigned a unique reference number, enabling easy tracking and verification of remuneration compliance.",
  },
  {
    icon: <BookOpen className="h-7 w-7 text-accent" />,
    title: "AI-Powered Document Drafting",
    body: "Lawyers can generate compliant document drafts instantly using the AI-powered smart form, or upload their own precedents for automatic reformatting and compliance.",
  },
];

const RemunerationAbout = () => (
  <PortalLayout>
    <div className="space-y-8">
      <PageHeader eyebrow="Portal Info" title="About the Remuneration Portal" subtitle="The official NBA Remuneration Portal for legal document preparation and remuneration compliance." />

      <Card className="shadow-card border-t-4 border-t-accent">
        <CardContent className="p-6 space-y-3">
          <h2 className="font-display text-2xl font-light text-foreground tracking-display">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            The NBA Remuneration Portal was established by the NBA Remuneration Committee to bring
            structure, transparency and accountability to legal document preparation and remuneration compliance
            across Nigeria. The portal enables every legal practitioner to generate court-ready, compliant legal
            documents from any location, quickly, accurately and in accordance with the law.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The portal is powered by the <strong>{ORDER_TITLE}</strong> and is the
            authoritative tool for ensuring that property transaction documents, powers of attorney, mortgages and
            other instruments are properly rated and structured in accordance with the law.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {highlights.map((h) => (
          <Card key={h.title} className="shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="p-5 space-y-3">
              {h.icon}
              <h3 className="font-display text-lg font-light text-card-foreground tracking-display">{h.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{h.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          <h2 className="font-display text-2xl font-light text-foreground tracking-display mb-4">Contact the Remuneration Committee</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Portal</p>
              <p>www.nbabranchremuneration.org.ng</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Email</p>
              <p>remuneration@nba.org.ng</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Address</p>
              <p>NBA Secretariat,<br />Nigeria</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </PortalLayout>
);

export default RemunerationAbout;
