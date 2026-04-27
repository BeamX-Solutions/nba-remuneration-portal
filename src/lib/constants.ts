export const ORDER_TITLE = "Legal Practitioners Remuneration (For Business, Legal Service and Representation) Order, 2023";

export const DOC_TYPE_LABELS: Record<string, string> = {
  deed_of_assignment:  "Deed of Assignment",
  deed_of_gift:        "Deed of Gift",
  mortgage_deed:       "Mortgage Deed",
  power_of_attorney:   "Power of Attorney",
  contract_of_sale:    "Contract of Sale",
  tenancy_agreement:   "Tenancy Agreement",
  deed_of_lease:       "Deed of Lease",
  deed_of_sub_lease:   "Deed of Sub-Lease",
  deed_of_surrender:   "Deed of Surrender",
  deed_of_release:     "Deed of Release / Discharge of Mortgage",
  deed_of_exchange:    "Deed of Exchange",
  precedent:           "Precedent",
};

// ─────────────────────────────────────────────────────────────
// Scale 4A — Conveyancing and Assignments (Assignee's LP fee)
// Applies to: Deed of Assignment, Deed of Gift, Contract of Sale,
//             Deed of Surrender, Deed of Exchange
// Source: Scale 4, Legal Practitioners Remuneration Order 2023
// ─────────────────────────────────────────────────────────────
export const calcConveyancingFee = (amount: number): number => {
  if (!amount || amount <= 0) return 0;
  if (amount < 50_000_000) return amount * 0.10;
  if (amount <= 100_000_000) return 5_000_000 + (amount - 50_000_000) * 0.05;
  return 7_500_000 + (amount - 100_000_000) * 0.03;
};

// ─────────────────────────────────────────────────────────────
// Scale 4B — Mortgages (Mortgagee's LP fee)
// Applies to: Mortgage Deed, Deed of Release / Discharge
// Source: Scale 4, Legal Practitioners Remuneration Order 2023
// ─────────────────────────────────────────────────────────────
export const calcMortgageFee = (amount: number): number => {
  if (!amount || amount <= 0) return 0;
  if (amount < 50_000_000) return amount * 0.04;
  if (amount <= 100_000_000) return 2_000_000 + (amount - 50_000_000) * 0.03;
  return 4_500_000 + (amount - 100_000_000) * 0.02;
};

// ─────────────────────────────────────────────────────────────
// Scale 4C — Leases and Tenancies (Lessor's / Landlord's LP fee)
// Applies to: Tenancy Agreement, Deed of Lease, Deed of Sub-Lease
// Fee basis: Annual Rental Value
// Source: Scale 4, Legal Practitioners Remuneration Order 2023
// ─────────────────────────────────────────────────────────────
export const calcTenancyFee = (annualRent: number): number => {
  if (!annualRent || annualRent <= 0) return 0;
  if (annualRent < 5_000_000) return annualRent * 0.10;
  if (annualRent <= 10_000_000) return 500_000 + (annualRent - 5_000_000) * 0.05;
  return 750_000 + (annualRent - 10_000_000) * 0.05;
};

const parseAmt = (s: string | undefined): number => {
  const n = parseFloat((s || "").replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
};

// ─────────────────────────────────────────────────────────────
// calcDocFee — returns the Assignee's / Landlord's LP fee (full scale)
// Returns null for Power of Attorney (not a Scale 4 instrument).
// ─────────────────────────────────────────────────────────────
export const calcDocFee = (
  formData: Record<string, string> | null | undefined,
  docType: string
): number | null => {
  if (!formData) return null;

  switch (docType) {
    case "deed_of_assignment":
    case "deed_of_gift":
    case "contract_of_sale":
    case "deed_of_surrender": {
      const fee = calcConveyancingFee(parseAmt(formData.consideration));
      return fee > 0 ? fee : null;
    }
    case "deed_of_exchange": {
      const v1 = parseAmt(formData.first_property_value);
      const v2 = parseAmt(formData.second_property_value);
      const higher = Math.max(v1, v2);
      const fee = calcConveyancingFee(higher);
      return fee > 0 ? fee : null;
    }
    case "mortgage_deed":
    case "deed_of_release": {
      const fee = calcMortgageFee(parseAmt(formData.consideration));
      return fee > 0 ? fee : null;
    }
    case "tenancy_agreement":
    case "deed_of_lease":
    case "deed_of_sub_lease": {
      const fee = calcTenancyFee(parseAmt(formData.consideration));
      return fee > 0 ? fee : null;
    }
    case "power_of_attorney":
      return null;
    default:
      return null;
  }
};
