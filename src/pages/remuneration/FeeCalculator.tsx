import { useState } from "react";
import { Link } from "react-router-dom";
import { Calculator, FileText, ChevronRight, Info } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DOC_TYPE_LABELS,
  ORDER_TITLE,
  calcConveyancingFee,
  calcMortgageFee,
  calcTenancyFee,
} from "@/lib/constants";

type FeeCategory = "conveyancing" | "mortgage" | "tenancy" | "poa" | "none";

const DOC_CATEGORIES: Record<string, FeeCategory> = {
  deed_of_assignment: "conveyancing",
  deed_of_gift:       "conveyancing",
  contract_of_sale:   "conveyancing",
  deed_of_surrender:  "conveyancing",
  deed_of_exchange:   "conveyancing",
  mortgage_deed:      "mortgage",
  deed_of_release:    "mortgage",
  tenancy_agreement:  "tenancy",
  deed_of_lease:      "tenancy",
  deed_of_sub_lease:  "tenancy",
  power_of_attorney:  "poa",
};

const SELECTABLE_TYPES = Object.entries(DOC_TYPE_LABELS).filter(([k]) => k !== "precedent");

const fmt = (n: number) => "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });

const parseInput = (s: string) => {
  const n = parseInt(s.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? 0 : n;
};

const formatInput = (s: string) => {
  const d = s.replace(/[^0-9]/g, "");
  return d ? parseInt(d, 10).toLocaleString("en-NG") : "";
};

const FeeCalculator = () => {
  const [docType, setDocType] = useState("deed_of_assignment");
  const [raw, setRaw] = useState("");
  const [raw2, setRaw2] = useState(""); // second property value for exchange

  const category = DOC_CATEGORIES[docType] ?? "none";
  const isExchange = docType === "deed_of_exchange";
  const amount = parseInput(raw);
  const amount2 = parseInput(raw2);

  const feeAmount = (() => {
    if (category === "conveyancing") {
      const base = isExchange ? Math.max(amount, amount2) : amount;
      return calcConveyancingFee(base);
    }
    if (category === "mortgage") return calcMortgageFee(amount);
    if (category === "tenancy") return calcTenancyFee(amount);
    return 0;
  })();

  const halfFee = feeAmount / 2;
  const hasResult = feeAmount > 0;

  const inputLabel = () => {
    if (category === "tenancy") return "Annual Rental Value (₦)";
    if (category === "mortgage") return docType === "deed_of_release" ? "Original Loan Amount (₦)" : "Loan / Mortgage Amount (₦)";
    if (isExchange) return "First Property Value (₦)";
    return "Consideration / Transaction Value (₦)";
  };

  const scaleLabel = () => {
    if (category === "conveyancing") return "Scale 4A — Conveyancing & Assignments";
    if (category === "mortgage") return "Scale 4B — Mortgages";
    if (category === "tenancy") return "Scale 4C — Leases & Tenancies";
    return "";
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Tools"
          title="Fee Calculator"
          subtitle="Estimate your remuneration fee before preparing a document."
        />

        <Card className="shadow-card">
          <CardContent className="p-6 space-y-6">
            {/* Document type */}
            <div>
              <label className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Document Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {SELECTABLE_TYPES.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setDocType(value); setRaw(""); setRaw2(""); }}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-md border text-sm text-left transition-colors ${
                      docType === value
                        ? "border-primary bg-primary/5 text-primary font-semibold"
                        : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <FileText className={`h-4 w-4 shrink-0 ${docType === value ? "text-primary" : "text-muted-foreground"}`} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* POA notice */}
            {category === "poa" && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Power of Attorney is not a Scale 4 instrument. Remuneration is assessed under paragraph 2 of the Order based on the complexity, time, and value of the subject matter. Please agree the fee with your branch.
                </p>
              </div>
            )}

            {/* Value inputs */}
            {category !== "poa" && category !== "none" && (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">{inputLabel()}</label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₦</span>
                    <input
                      type="text" inputMode="numeric"
                      value={raw}
                      onChange={(e) => setRaw(formatInput(e.target.value))}
                      placeholder="0"
                      className="w-full rounded-md border border-input bg-background pl-7 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                {isExchange && (
                  <div>
                    <label className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Second Property Value (₦)</label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₦</span>
                      <input
                        type="text" inputMode="numeric"
                        value={raw2}
                        onChange={(e) => setRaw2(formatInput(e.target.value))}
                        placeholder="0"
                        className="w-full rounded-md border border-input bg-background pl-7 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">Fee is calculated on the higher of the two property values.</p>
                  </div>
                )}
              </div>
            )}

            {/* Result */}
            {hasResult && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  <span className="text-[11px] tracking-eyebrow uppercase font-semibold text-primary">Estimated Fees — {scaleLabel()}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-background rounded-lg p-4 border border-primary/10">
                    <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground mb-1">Drafting LP (full rate)</p>
                    <p className="font-display text-2xl font-semibold text-primary">{fmt(feeAmount)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Assignee's / Landlord's / Mortgagee's LP</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground mb-1">Reviewing LP (half rate)</p>
                    <p className="font-display text-2xl font-light text-foreground">{fmt(halfFee)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Assignor's / Tenant's / Mortgagor's LP</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground border-t border-primary/15 pt-3">
                  Applicable to: <span className="font-semibold text-foreground">{DOC_TYPE_LABELS[docType]}</span>
                  {" · "}VAT and disbursements are charged separately.
                  {" · "}{ORDER_TITLE}.
                </p>
              </div>
            )}

            {hasResult && (
              <Button asChild className="w-full gap-2">
                <Link to="/dashboard/prepare">
                  Prepare this Document <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Info card */}
        <Card className="shadow-soft border border-border/60">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-3 pb-2 border-b border-border/50">
              <span className="h-px w-6 bg-accent" />
              <h3 className="text-[11px] tracking-eyebrow uppercase font-semibold text-accent">About the Fee Schedule</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The <span className="font-semibold text-foreground">{ORDER_TITLE}</span> prescribes three scales for property transactions. Conveyancing and Assignments use 10% below ₦50M, reducing to 5% and 3% at higher bands. Mortgages start at 4%. Leases and Tenancies are based on annual rental value at 10% below ₦5M annual rent.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The drafting legal practitioner (Assignee's, Landlord's, or Mortgagee's LP) receives the full scale fee. The other party's LP receives half. VAT and disbursements are separate.
            </p>
            <Button variant="outline" size="sm" asChild className="mt-1 gap-1.5">
              <Link to="/dashboard/guidelines">
                <FileText className="h-3.5 w-3.5" /> View Full Guidelines
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default FeeCalculator;
