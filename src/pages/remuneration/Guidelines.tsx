import { Scale, Info, FileText, AlertCircle } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

const scaleFees = [
  { range: "First ₦5,000,000", rate: "10%", example: "₦500,000 on a ₦5M transaction" },
  { range: "Next ₦15,000,000 (₦5M – ₦20M)", rate: "5%", example: "₦750,000 on the next ₦15M" },
  { range: "Next ₦30,000,000 (₦20M – ₦50M)", rate: "4%", example: "₦1,200,000 on the next ₦30M" },
  { range: "Next ₦50,000,000 (₦50M – ₦100M)", rate: "3%", example: "₦1,500,000 on the next ₦50M" },
  { range: "Above ₦100,000,000", rate: "2%", example: "₦2,000,000 on every ₦100M above" },
];

const documentFees = [
  { type: "Deed of Assignment", basis: "Scale fee on consideration value", note: "Minimum ₦500,000" },
  { type: "Deed of Gift", basis: "Scale fee on market value of property", note: "Minimum ₦500,000" },
  { type: "Mortgage Deed", basis: "Scale fee on loan/principal amount", note: "Minimum ₦500,000" },
  { type: "Power of Attorney (General)", basis: "Flat fee", note: "₦150,000 – ₦500,000" },
  { type: "Power of Attorney (Specific)", basis: "Flat fee", note: "₦100,000 – ₦300,000" },
  { type: "Contract of Sale", basis: "Scale fee on purchase price", note: "Minimum ₦300,000" },
  { type: "Tenancy Agreement (1–3 years)", basis: "10% of annual rent", note: "Minimum ₦50,000" },
  { type: "Tenancy Agreement (3+ years)", basis: "Scale fee on total rent", note: "Minimum ₦100,000" },
];

const rules = [
  {
    title: "Fees are non-negotiable",
    body: "The Legal Practitioners' Remuneration Order 2023 prescribes minimum fees. No legal practitioner may charge below the stipulated scale fees for any covered transaction.",
  },
  {
    title: "VAT applies",
    body: "Value Added Tax (VAT) at the applicable rate is chargeable on all professional fees in addition to the scale fee. This must be clearly stated on all bills rendered.",
  },
  {
    title: "Disbursements are separate",
    body: "Government charges, stamp duties, registration fees, and search fees are charged separately from professional fees and are passed through to the client at cost.",
  },
  {
    title: "Joint transactions",
    body: "Where a transaction involves multiple legal practitioners, the total fee payable shall not exceed the scale fee. Each practitioner's share is agreed between them.",
  },
];

const Guidelines = () => (
  <PortalLayout>
    <div className="space-y-10 max-w-4xl">
      <PageHeader
        eyebrow="Legal Framework"
        title="Remuneration Guidelines"
        subtitle="Fee schedule and rules under the Legal Practitioners' Remuneration Order 2023."
      />

      {/* Notice banner */}
      <div className="flex items-start gap-4 p-5 rounded-sm bg-accent/10 border border-accent/30">
        <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <p className="text-sm text-foreground leading-relaxed">
          This page reflects the <strong>Legal Practitioners' (Remuneration for Legal Documentation and Other Land Matters) Order 2023</strong> as gazetted by the Federal Government of Nigeria. All documents prepared through this portal are calculated in accordance with these rates.
        </p>
      </div>

      {/* Scale fee table */}
      <Card className="shadow-soft border border-border/60">
        <CardContent className="p-0">
          <div className="px-6 py-5 border-b border-border/60 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Scale className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-display text-xl font-light text-primary tracking-display">Scale Fee Structure</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left px-4 sm:px-6 py-3 text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Transaction Band</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Rate</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground hidden md:table-cell">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {scaleFees.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-elegant">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{row.range}</td>
                    <td className="px-6 py-4">
                      <span className="font-display text-lg font-light text-accent">{row.rate}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">{row.example}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border/60 bg-muted/20">
                  <td colSpan={3} className="px-6 py-3 text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">
                    Minimum fee: ₦500,000 — applies where the calculated scale fee falls below this threshold
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Document-specific fees */}
      <Card className="shadow-soft border border-border/60">
        <CardContent className="p-0">
          <div className="px-6 py-5 border-b border-border/60 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-display text-xl font-light text-primary tracking-display">Fees by Document Type</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left px-6 py-3 text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Document Type</th>
                  <th className="text-left px-6 py-3 text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Fee Basis</th>
                  <th className="text-left px-6 py-3 text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {documentFees.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-elegant">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{row.type}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{row.basis}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rules */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Info className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-display text-xl font-light text-primary tracking-display">General Rules</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((r) => (
            <Card key={r.title} className="shadow-soft border border-border/60 card-hover">
              <CardContent className="p-5 space-y-2">
                <div className="h-px w-8 bg-accent mb-3" />
                <h3 className="font-display text-base font-light text-foreground tracking-display">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-muted-foreground/60 border-t border-border/40 pt-6">
        Source: Legal Practitioners' (Remuneration for Legal Documentation and Other Land Matters) Order 2023, Federal Republic of Nigeria Official Gazette. For disputes or clarifications, contact the NBA Remuneration Committee.
      </p>
    </div>
  </PortalLayout>
);

export default Guidelines;
