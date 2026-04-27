import { Scale, Info, FileText, AlertCircle, Users } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { ORDER_TITLE } from "@/lib/constants";

const conveyancingRows = [
  { band: "Property value below ₦50,000,000",            fee: "10% of value" },
  { band: "₦50,000,000 – ₦100,000,000",                 fee: "₦5,000,000 + 5% of amount above ₦50M" },
  { band: "Above ₦100,000,000",                          fee: "₦7,500,000 + 3% of amount above ₦100M" },
];

const mortgageRows = [
  { band: "Mortgage value below ₦50,000,000",            fee: "4% of mortgage value" },
  { band: "₦50,000,000 – ₦100,000,000",                 fee: "₦2,000,000 + 3% of amount above ₦50M" },
  { band: "Above ₦100,000,000",                          fee: "₦4,500,000 + 2% of amount above ₦100M" },
];

const tenancyRows = [
  { band: "Annual rental value below ₦5,000,000",        fee: "10% of annual rent" },
  { band: "₦5,000,000 – ₦10,000,000",                   fee: "₦500,000 + 5% of amount above ₦5M" },
  { band: "Above ₦10,000,000",                           fee: "₦750,000 + 5% of every subsequent amount above ₦10M" },
];

const documentFees = [
  { type: "Deed of Assignment",              scale: "Scale 4A — Conveyancing",  basis: "Consideration / purchase price",   note: "Assignee's LP: full rate · Assignor's LP: half rate" },
  { type: "Deed of Gift",                    scale: "Scale 4A — Conveyancing",  basis: "Market value of property",         note: "Donee's LP: full rate · Donor's LP: half rate" },
  { type: "Contract of Sale",               scale: "Scale 4A — Conveyancing",  basis: "Purchase price",                   note: "Purchaser's LP: full rate · Vendor's LP: half rate" },
  { type: "Deed of Exchange",               scale: "Scale 4A — Conveyancing",  basis: "Higher of the two property values", note: "Both LPs: full rate (each party's LP charged separately)" },
  { type: "Deed of Surrender",              scale: "Scale 4A — Conveyancing",  basis: "Value of unexpired lease interest", note: "Assessed on value of the interest surrendered" },
  { type: "Mortgage Deed",                  scale: "Scale 4B — Mortgages",     basis: "Principal loan amount",            note: "Mortgagee's LP: full rate · Mortgagor's LP: half rate" },
  { type: "Deed of Release / Discharge",    scale: "Scale 4B — Mortgages",     basis: "Original loan amount",             note: "Assessed on the amount being discharged" },
  { type: "Tenancy Agreement",              scale: "Scale 4C — Tenancies",     basis: "Annual rental value",              note: "Landlord's LP: full rate · Tenant's LP: half rate" },
  { type: "Deed of Lease",                  scale: "Scale 4C — Leases",        basis: "Annual rental value",              note: "Lessor's LP: full rate · Lessee's LP: half rate" },
  { type: "Deed of Sub-Lease",              scale: "Scale 4C — Leases",        basis: "Annual rental value",              note: "Sub-Lessor's LP: full rate · Sub-Lessee's LP: half rate" },
  { type: "Power of Attorney",              scale: "Para. 2 — Discretionary",  basis: "Complexity, time, value",          note: "Not a Scale 4 instrument — fee agreed per para. 2 of the Order" },
];

const rules = [
  {
    title: "One LP acting for both parties",
    body: "Where a single legal practitioner acts for both sides of a transaction (e.g. vendor and purchaser, landlord and tenant), they are entitled to a minimum of 10% of the value of the property or consideration as fees.",
  },
  {
    title: "Drafting LP vs reviewing LP",
    body: "Where the agreement is prepared by the Lessor's or Landlord's LP and reviewed by the Lessee's or Tenant's LP, the drafting LP receives 7.5% of the value and the reviewing LP receives 2.5%. For assignments, where the Assignor insists their LP prepares the document, the Assignor's LP receives 2.5% and the Assignee's LP receives 7.5%.",
  },
  {
    title: "Fees and negotiation",
    body: "Fees are not subject to negotiation except as prescribed in the Order. A legal practitioner who intends to charge below the prescribed scale must apply to the Legal Practitioners' Remuneration Committee for approval within 2 days of receiving the instruction and attach an affidavit disclosing the reasons.",
  },
  {
    title: "VAT applies",
    body: "Value Added Tax at the applicable rate is chargeable on all professional fees in addition to the scale fee. This must be clearly stated on all bills rendered to clients.",
  },
  {
    title: "Disbursements are separate",
    body: "The prescribed fees do not include costs and disbursements such as stamp duties, government registration fees, fees paid on searches, auctioneer's or valuer's charges, or any application for Governor's Consent under the Land Use Act.",
  },
  {
    title: "Governor's Consent and registration",
    body: "Applications for Governor's Consent under the Land Use Act and all land registration costs are disbursements chargeable separately from the professional fee. These are passed to the client at cost.",
  },
];

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="px-6 py-5 border-b border-border/60 flex items-center gap-3">
    <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <h2 className="font-display text-xl font-light text-primary tracking-display">{title}</h2>
  </div>
);

const FeeTable = ({ rows }: { rows: { band: string; fee: string }[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-border/60 bg-muted/30">
          <th className="text-left px-6 py-3 text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Transaction Band</th>
          <th className="text-left px-6 py-3 text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Drafting LP Fee</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/40">
        {rows.map((r, i) => (
          <tr key={i} className="hover:bg-muted/20">
            <td className="px-6 py-4 text-sm text-foreground font-medium">{r.band}</td>
            <td className="px-6 py-4">
              <span className="font-display text-base font-light text-accent">{r.fee}</span>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t border-border/60 bg-muted/20">
          <td colSpan={2} className="px-6 py-3 text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">
            Reviewing LP (opposite party) receives half the above rates
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
);

const Guidelines = () => (
  <PortalLayout>
    <div className="space-y-10 max-w-4xl">
      <PageHeader
        eyebrow="Legal Framework"
        title="Remuneration Guidelines"
        subtitle={`Fee schedule and rules under the ${ORDER_TITLE}.`}
      />

      {/* Notice */}
      <div className="flex items-start gap-4 p-5 rounded-sm bg-accent/10 border border-accent/30">
        <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <p className="text-sm text-foreground leading-relaxed">
          This page reflects <strong>{ORDER_TITLE}</strong>, S.I. No. 31 of 2023, gazetted on 5th June 2023. All fees in this portal are calculated in accordance with Scale 4 of the Order.
        </p>
      </div>

      {/* Scale 4A — Conveyancing */}
      <Card className="shadow-soft border border-border/60">
        <SectionHeader icon={<Scale className="h-4 w-4 text-primary" />} title="Scale 4A — Conveyancing & Assignments" />
        <div className="px-6 py-3 bg-muted/10 border-b border-border/40">
          <p className="text-xs text-muted-foreground">Applies to: Deed of Assignment, Deed of Gift, Contract of Sale, Deed of Exchange, Deed of Surrender</p>
        </div>
        <FeeTable rows={conveyancingRows} />
      </Card>

      {/* Scale 4B — Mortgages */}
      <Card className="shadow-soft border border-border/60">
        <SectionHeader icon={<Scale className="h-4 w-4 text-primary" />} title="Scale 4B — Mortgages" />
        <div className="px-6 py-3 bg-muted/10 border-b border-border/40">
          <p className="text-xs text-muted-foreground">Applies to: Mortgage Deed, Deed of Release / Discharge of Mortgage</p>
        </div>
        <FeeTable rows={mortgageRows} />
      </Card>

      {/* Scale 4C — Leases and Tenancies */}
      <Card className="shadow-soft border border-border/60">
        <SectionHeader icon={<Scale className="h-4 w-4 text-primary" />} title="Scale 4C — Leases &amp; Tenancies" />
        <div className="px-6 py-3 bg-muted/10 border-b border-border/40">
          <p className="text-xs text-muted-foreground">Applies to: Tenancy Agreement, Deed of Lease, Deed of Sub-Lease · Fee basis: Annual Rental Value</p>
        </div>
        <FeeTable rows={tenancyRows} />
      </Card>

      {/* Document-type summary */}
      <Card className="shadow-soft border border-border/60">
        <SectionHeader icon={<FileText className="h-4 w-4 text-primary" />} title="Fees by Document Type" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="text-left px-6 py-3 text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Document</th>
                <th className="text-left px-6 py-3 text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground hidden sm:table-cell">Scale</th>
                <th className="text-left px-6 py-3 text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground hidden md:table-cell">Fee Basis</th>
                <th className="text-left px-6 py-3 text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {documentFees.map((r, i) => (
                <tr key={i} className="hover:bg-muted/20">
                  <td className="px-6 py-3 text-sm font-medium text-foreground">{r.type}</td>
                  <td className="px-6 py-3 text-xs text-muted-foreground hidden sm:table-cell">{r.scale}</td>
                  <td className="px-6 py-3 text-xs text-muted-foreground hidden md:table-cell">{r.basis}</td>
                  <td className="px-6 py-3 text-xs text-muted-foreground">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Split-fee rule highlight */}
      <Card className="shadow-soft border border-accent/30 bg-accent/5">
        <CardContent className="p-6 flex items-start gap-4">
          <Users className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-display text-base font-light text-foreground tracking-display">The Half-Fee Rule</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Scale 4 fees shown above are payable to the <strong>drafting legal practitioner</strong> (Assignee's, Mortgagee's, or Landlord's LP). The legal practitioner acting for the other party (Assignor's, Mortgagor's, or Tenant's LP) is entitled to <strong>half</strong> the scale fee. Where one LP acts for both parties, the full 10% minimum applies.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* General rules */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Info className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-display text-xl font-light text-primary tracking-display">General Rules</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((r) => (
            <Card key={r.title} className="shadow-soft border border-border/60">
              <CardContent className="p-5 space-y-2">
                <div className="h-px w-8 bg-accent mb-3" />
                <h3 className="font-display text-base font-light text-foreground tracking-display">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground/60 border-t border-border/40 pt-6">
        Source: {ORDER_TITLE}, S.I. No. 31 of 2023, Federal Republic of Nigeria Official Gazette No. 0102, Vol. 110, 5th June 2023. For disputes or clarifications, contact the Legal Practitioners' Remuneration Committee.
      </p>
    </div>
  </PortalLayout>
);

export default Guidelines;
