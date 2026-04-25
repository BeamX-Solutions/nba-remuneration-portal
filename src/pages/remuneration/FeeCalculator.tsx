import { useState } from "react";
import { Link } from "react-router-dom";
import { Calculator, FileText, ChevronRight } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DOC_TYPE_LABELS } from "@/lib/constants";

const FEE_RATE = 0.1; // 10% per Legal Practitioners' Remuneration Order 2023

const DOC_TYPES_WITH_FEES = Object.entries(DOC_TYPE_LABELS).filter(([k]) => k !== "precedent");

const formatNaira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FeeCalculator = () => {
  const [docType, setDocType] = useState(DOC_TYPES_WITH_FEES[0][0]);
  const [raw, setRaw] = useState("");

  const digits = raw.replace(/[^0-9]/g, "");
  const numericValue = digits ? parseInt(digits, 10) : 0;
  const fee = numericValue * FEE_RATE;

  const handleChange = (v: string) => {
    const d = v.replace(/[^0-9]/g, "");
    setRaw(d ? parseInt(d, 10).toLocaleString("en-NG") : "");
  };

  return (
    <PortalLayout>
      <div className="space-y-6 max-w-2xl">
        <PageHeader
          eyebrow="Tools"
          title="Fee Calculator"
          subtitle="Estimate your remuneration fee before preparing a document."
        />

        <Card className="shadow-card">
          <CardContent className="p-6 space-y-6">
            {/* Document type */}
            <div>
              <label className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">
                Document Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {DOC_TYPES_WITH_FEES.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDocType(value)}
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

            {/* Consideration input */}
            <div>
              <label className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">
                Consideration Value (₦)
              </label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₦</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={raw}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-md border border-input bg-background pl-7 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Enter the total transaction value (e.g. property sale price, loan amount, or annual rent).
              </p>
            </div>

            {/* Result */}
            {numericValue > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calculator className="h-4 w-4 text-primary" />
                  <span className="text-[11px] tracking-eyebrow uppercase font-semibold text-primary">Estimated Fee</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Consideration</p>
                    <p className="font-display text-xl font-light text-foreground">{formatNaira(numericValue)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-muted-foreground">Rate</p>
                    <p className="font-display text-xl font-light text-foreground">10%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] tracking-eyebrow uppercase font-semibold text-primary">Remuneration Fee</p>
                    <p className="font-display text-2xl font-semibold text-primary">{formatNaira(fee)}</p>
                  </div>
                </div>

                <div className="border-t border-primary/15 pt-4 space-y-1.5 text-xs text-muted-foreground">
                  <p>· Applicable document: <span className="font-semibold text-foreground">{DOC_TYPE_LABELS[docType]}</span></p>
                  <p>· Fee is payable to the NBA Branch before the final stamped document is issued.</p>
                  <p>· Calculated at 10% of consideration per the Legal Practitioners' Remuneration Order 2023.</p>
                </div>
              </div>
            )}

            {numericValue > 0 && (
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
              The <span className="font-semibold text-foreground">Legal Practitioners' Remuneration Order 2023</span> prescribes
              the fees payable to legal practitioners for the preparation and execution of specified legal instruments.
              A standard rate of <span className="font-semibold text-foreground">10% of the consideration value</span> applies
              to most conveyancing documents including deeds of assignment, gifts, mortgages, and contracts of sale.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For transactions where no monetary consideration is stated (e.g. Power of Attorney), the fee is
              assessed based on the estimated value of the subject matter. Contact your branch for guidance.
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
