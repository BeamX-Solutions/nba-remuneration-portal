import Anthropic from "npm:@anthropic-ai/sdk@0.36.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PARTY_LABELS: Record<string, { donor: string; donee: string }> = {
  deed_of_assignment: { donor: "Assignor/Vendor", donee: "Assignee/Purchaser" },
  deed_of_gift:       { donor: "Donor",           donee: "Donee" },
  mortgage_deed:      { donor: "Mortgagor",        donee: "Mortgagee/Lender" },
  power_of_attorney:  { donor: "Donor/Principal",  donee: "Attorney" },
  contract_of_sale:   { donor: "Vendor",           donee: "Purchaser" },
  tenancy_agreement:  { donor: "Landlord",         donee: "Tenant" },
};

function formatData(formData: Record<string, string>, documentType: string): string {
  const labels = PARTY_LABELS[documentType] ?? { donor: "Donor", donee: "Donee" };
  return Object.entries(formData)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => {
      let label: string;
      if (k.startsWith("donor_")) {
        const rest = k.slice(6).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        label = `${labels.donor} ${rest}`;
      } else if (k.startsWith("donee_")) {
        const rest = k.slice(6).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        label = `${labels.donee} ${rest}`;
      } else {
        label = k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      }
      return `${label}: ${v}`;
    })
    .join("\n");
}

function buildPrompt(
  documentType: string,
  formData: Record<string, string>,
  currentDate: string,
  currentYear: number
): string {
  const data = formatData(formData, documentType);

  const DISPUTE = `Dispute resolution escalation ladder: (i) good faith negotiation for 21 days, then (ii) mediation under the Lagos Multi-Door Courthouse rules for 30 days, then (iii) arbitration under the Arbitration and Conciliation Act 2023 if still unresolved`;
  const FOOTER = `Compliance footer confirming the remuneration fee was assessed under the Legal Practitioners' Remuneration Order 2023 and stating the exact naira amount payable`;

  const EXECUTION_FORMAT = `
Use this EXACT format for every signature block — underscores are mandatory, do not omit them:

SIGNED SEALED AND DELIVERED
by the within-named [PARTY LABEL IN CAPS]:
[Party's full name]

Signature:    _________________________________

In the presence of:

Witness Name:    _________________________________
Address:         _________________________________
                 _________________________________
Occupation:      _________________________________
Date:            _____ day of _____________ ${currentYear}

Repeat the block above for every party to the document.`;

  const BASE = `${EXECUTION_FORMAT}

Return only the complete document text. No preamble, no explanation, no markdown. All year references must be ${currentYear}.`;

  switch (documentType) {

    case "deed_of_assignment": return `
You are a Lagos State conveyancing expert drafting a complete, execution-ready DEED OF ASSIGNMENT.

TRANSACTION DETAILS:
${data}

DATE OF EXECUTION: ${currentDate}

MANDATORY REQUIREMENTS — include every item below without exception:

PARTIES
- Use only "Assignor/Vendor" and "Assignee/Purchaser" — never "Donor/Donee"

RECITALS
1. Root of title recital: how the Assignor originally acquired the property, using the root of title instrument type, date, and reference number provided
2. Title document reference recital identifying the instrument number

OPERATIVE PROVISIONS
3. Consideration clause: state the consideration in both figures and words
4. Standalone receipt clause (separate paragraph, for stamp duty purposes): explicit acknowledgment of receipt of the full purchase price
5. Words of assignment: conveyance of ALL the Assignor's right, title, interest, and benefit in and to the property
6. Full property description including address, survey plan number, and beacon numbers where provided

TITLE COVENANTS
7. Covenant for quiet enjoyment by the Assignor
8. Covenant against encumbrances: the property is free from all charges, liens, mortgages, and adverse claims
9. Further assurance covenant: Assignor will execute all additional documents required to perfect the Assignee's title
10. Governor's Consent clause (Land Use Act 1978 s.22): both parties shall apply for consent within 90 days of execution; the Assignee bears all costs and fees
11. Registration obligation clause: Assignee shall register the deed at the Lagos State Lands Registry after consent is obtained, to give the deed public notice effect

STANDARD CLAUSES
12. Attestation clause: both parties confirm they are of full age, of sound mind, and are executing the deed freely and voluntarily without undue influence or duress
13. Stamp duty clause: state Lagos State stamp duty at 7.5% of the consideration, expressed in naira in both figures and words
14. Time of the essence clause: time is of the essence regarding the Governor's Consent and registration obligations
15. Force majeure clause
16. Counterparts clause: this deed may be executed in separate counterparts each of which shall constitute one binding instrument
17. ${DISPUTE}

EXECUTION
18. Proper testimonium clause
19. Separate signature blocks for Assignor and Assignee, each with: full name line, signature line, date line (year must be ${currentYear}), witness name, witness address, and witness occupation
20. ${FOOTER}

${BASE}`;

    case "deed_of_gift": return `
You are a Lagos State conveyancing expert drafting a complete, execution-ready DEED OF GIFT.

TRANSACTION DETAILS:
${data}

DATE OF EXECUTION: ${currentDate}

MANDATORY REQUIREMENTS — include every item below without exception:

PARTIES
- Use only "Donor" and "Donee" correctly

RECITALS
1. Root of title recital: how the Donor originally acquired the property, using the instrument type, date, and reference number provided
2. Title document reference recital
3. Recital of the relationship or goodwill motivating the gift

OPERATIVE PROVISIONS
4. Declaration that the gift is made out of natural love and affection (or goodwill) and that NO monetary consideration passes between the parties, to avoid any stamp duty ambiguity
5. Words of gift and transfer: conveyance of ALL the Donor's right, title, interest, and benefit in and to the property
6. Full property description including address, survey plan, and beacon numbers where provided

TITLE COVENANTS
7. Covenant for quiet enjoyment
8. Covenant against encumbrances
9. Further assurance covenant
10. Governor's Consent clause (Land Use Act 1978 s.22): both parties shall apply within 90 days; Donee bears costs
11. Registration obligation clause

STANDARD CLAUSES
12. Attestation clause: the Donor is of full age, of sound mind, and makes this gift freely, voluntarily, and without any undue influence, coercion, or duress — this language must appear explicitly
13. Stamp duty clause (assessed on open market value; state nominal amount and basis)
14. Time of the essence clause (Governor's Consent and registration)
15. Force majeure clause
16. Counterparts clause
17. ${DISPUTE}

EXECUTION
18. Testimonium clause
19. Signature blocks for both parties with witness details; all dates must use year ${currentYear}
20. ${FOOTER}

${BASE}`;

    case "mortgage_deed": return `
You are a Lagos State conveyancing expert drafting a complete, execution-ready MORTGAGE DEED.

TRANSACTION DETAILS:
${data}

DATE OF EXECUTION: ${currentDate}

MANDATORY REQUIREMENTS — include every item below without exception:

PARTIES
- Use only "Mortgagor" and "Mortgagee/Lender" correctly

RECITALS
1. Root of title recital: how the Mortgagor acquired the property, using the instrument type, date, and reference number provided
2. Title document reference recital
3. Recital of the loan agreement: principal amount, interest rate, and repayment period

OPERATIVE PROVISIONS
4. Mortgage/charge clause: Mortgagor charges the property as continuing security for repayment of the principal and all accrued interest
5. Full property description
6. Covenant to repay: Mortgagor shall repay the principal and interest on the agreed schedule
7. Default and acceleration clause: the full outstanding balance becomes immediately due and payable upon default, after 30 days' written notice
8. Statutory power of sale clause: Mortgagee's power of sale arises on default following demand, subject to the Conveyancing Act
9. Insurance obligation: Mortgagor shall maintain adequate building insurance at replacement value, naming the Mortgagee as co-insured, and provide proof on demand
10. Right of quiet enjoyment: Mortgagor retains possession and quiet enjoyment pending redemption
11. Redemption and discharge: on full repayment of principal and all interest, the Mortgagee shall promptly execute a Deed of Discharge at the Mortgagor's cost
12. Consolidation disclaimer: the Mortgagee shall not consolidate this mortgage with any other mortgage unless expressly agreed

TITLE AND REGISTRATION
13. Governor's Consent clause (Land Use Act 1978 s.22): consent shall be sought within 90 days; the Mortgagee bears filing costs
14. Registration obligation clause

STANDARD CLAUSES
15. Attestation clause (full age, sound mind, free execution)
16. Stamp duty clause: state Lagos State mortgage stamp duty at 0.375% of the loan principal, in naira figures and words
17. Time of the essence clause
18. Force majeure clause
19. Counterparts clause
20. ${DISPUTE}

EXECUTION
21. Testimonium clause
22. Signature blocks for both parties with witness details; all dates must use year ${currentYear}
23. ${FOOTER}

${BASE}`;

    case "power_of_attorney": return `
You are a Nigerian legal expert drafting a complete, execution-ready POWER OF ATTORNEY.

TRANSACTION DETAILS:
${data}

DATE OF EXECUTION: ${currentDate}

MANDATORY REQUIREMENTS — include every item below without exception:

PARTIES
- Use "Donor/Principal" and "Attorney" correctly

RECITALS
1. Recital of the Donor's purpose and the reason for granting the power

OPERATIVE PROVISIONS
2. Appointment clause: clear, unambiguous appointment of the named Attorney as the Donor's lawful attorney
3. Scope of authority: enumerate specifically the acts the Attorney is authorised to perform (use the scope provided in full)
4. Property clause: if property-related, identify the property with full address as provided
5. Duration: if a duration was provided, state it; otherwise state the POA remains valid until revoked in writing by the Donor
6. Ratification clause: the Donor ratifies and confirms all lawful acts done by the Attorney within the scope of this authority

PROTECTIVE PROVISIONS
7. Revocation procedure: the Donor may revoke this POA at any time by written notice served on the Attorney personally or by registered post to their address stated herein; revocation takes effect on actual receipt
8. Third party indemnity: third parties who deal with the Attorney in good faith and without notice of revocation shall be protected and the Donor shall not dispute acts done before notice of revocation was received
9. Attorney's indemnity: the Donor shall indemnify the Attorney against all costs, charges, and expenses reasonably and properly incurred in the execution of this authority
10. Non-delegation: the Attorney shall not delegate this authority to any third party without the Donor's prior written consent
11. Attorney's declaration: the Attorney accepts the appointment and undertakes to act in the Donor's best interests within the scope of this authority

STANDARD CLAUSES
12. Attestation clause: the Donor is of full age, of sound mind, and grants this power freely and voluntarily without any undue influence
13. Stamp duty clause (nominal)
14. Counterparts clause
15. ${DISPUTE}

EXECUTION
16. Testimonium clause
17. Signature blocks for both parties with witness details; all dates must use year ${currentYear}
18. ${FOOTER}

${BASE}`;

    case "contract_of_sale": return `
You are a Lagos State conveyancing expert drafting a complete, execution-ready CONTRACT OF SALE OF LAND/PROPERTY.

TRANSACTION DETAILS:
${data}

DATE OF EXECUTION: ${currentDate}

MANDATORY REQUIREMENTS — include every item below without exception:

PARTIES
- Use only "Vendor" and "Purchaser" correctly

RECITALS
1. Vendor is the beneficial owner of the property and has agreed to sell
2. Title document reference recital where provided

OPERATIVE PROVISIONS
3. Agreement to sell and buy: Vendor agrees to sell and Purchaser agrees to buy the property at the purchase price stated in figures and words
4. Deposit clause: state the deposit amount; if not provided, use 10% of the purchase price payable on execution of this contract
5. Balance of purchase price: payable on or before the completion date
6. Investigation of title: Purchaser has the investigation period stated to investigate title and raise written requisitions; Vendor shall answer all requisitions within 14 days
7. Conditions precedent: Vendor shall demonstrate a good and marketable title to the Purchaser's reasonable satisfaction before the Purchaser is obliged to pay the balance
8. Risk in the property passes to the Purchaser from the date of this contract
9. Vacant possession: Vendor shall deliver vacant possession of the property on completion
10. Completion obligations: on completion, Vendor shall hand over the title documents, signed deed of assignment, and keys

RESCISSION AND DEFAULT
11. Rescission for defective title: if the Vendor cannot demonstrate good title within the investigation period, the Purchaser may rescind and recover the full deposit with interest at the prevailing CBN rate
12. Purchaser's default: if the Purchaser fails to complete by the completion date without lawful excuse, the Vendor may forfeit the deposit and re-sell the property
13. Vendor's default: if the Vendor fails to complete, the Vendor shall return the deposit with interest and the Purchaser may seek specific performance

STANDARD CLAUSES
14. Stamp duty clause: state applicable rate on the purchase price in naira figures and words
15. Time of the essence clause: time is of the essence on the completion date and investigation period
16. Entire agreement clause
17. Counterparts clause
18. ${DISPUTE}

EXECUTION
19. Testimonium clause
20. Signature blocks for both parties with witness details; all dates must use year ${currentYear}
21. ${FOOTER}

${BASE}`;

    case "tenancy_agreement": return `
You are a Nigerian property law expert drafting a complete, execution-ready TENANCY AGREEMENT.

TRANSACTION DETAILS:
${data}

DATE OF EXECUTION: ${currentDate}

MANDATORY REQUIREMENTS — include every item below without exception:

PARTIES
- Use "Landlord" and "Tenant" correctly

RECITALS
1. Landlord is the owner (or authorised manager) of the premises and has agreed to let

OPERATIVE PROVISIONS
2. Demise clause: Landlord lets to Tenant the premises at the stated address for the stated term commencing on the commencement date
3. Annual rent: stated in both figures and words, payable annually (or as agreed) in advance
4. Rent review: Landlord may review the rent at the expiry of each tenancy year on giving not less than 3 months' written notice to the Tenant

TENANT'S OBLIGATIONS
5. Pay rent punctually on the due dates
6. Keep the premises and all fixtures in good and tenantable repair and condition (fair wear and tear excepted)
7. Not to sublet, assign, part with possession, or share occupation of the premises without the prior written consent of the Landlord
8. Not to make any structural alterations, additions, or improvements to the premises without the prior written consent of the Landlord
9. To permit the Landlord or authorised agents to enter and inspect the premises at reasonable times on not less than 48 hours' prior written notice
10. To yield up the premises at the end of the tenancy in the same condition as received, fair wear and tear excepted, together with all keys and access devices

LANDLORD'S OBLIGATIONS
11. Quiet enjoyment: Tenant shall have quiet enjoyment of the premises without disturbance by the Landlord or anyone claiming under the Landlord
12. Structural repairs: Landlord shall carry out all structural and external repairs within a reasonable time of receiving written notice from the Tenant
13. Landlord shall ensure all required consents and approvals for the letting are in place

TERMINATION
14. Notice to quit: either party may determine the tenancy by giving the notice period stated to the other party (minimum: 1 month for monthly tenancy, 3 months for yearly tenancy as required by Lagos State law)
15. Forfeiture clause: Landlord's right to re-enter and determine the tenancy if Tenant fails to remedy any breach within 14 days of written notice, or on insolvency of the Tenant
16. Yielding up clause: on expiry or earlier determination, Tenant shall peaceably yield up the premises in agreed condition with vacant possession

SERVICE OF NOTICES
17. Notices shall be served in writing by: (a) personal delivery, (b) registered post to the addresses stated in this agreement, or (c) email to the email address agreed between the parties; notices by post are deemed served 3 days after posting
18. Service address for Landlord and Tenant notices (use addresses provided)

STANDARD CLAUSES
19. Stamp duty clause (nominal for tenancies not exceeding 7 years)
20. Entire agreement clause: this agreement constitutes the entire agreement between the parties and supersedes all prior discussions
21. Counterparts clause
22. ${DISPUTE}

EXECUTION
23. Testimonium clause
24. Signature blocks for both parties with witness details; all dates must use year ${currentYear}
25. ${FOOTER}

${BASE}`;

    default:
      return `Draft a complete legal document of type "${documentType}" using these details:\n${data}\nDate: ${currentDate}. All years must be ${currentYear}.`;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, method, documentType, precedentText } = await req.json();

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    const client = new Anthropic({ apiKey });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentDate = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    let prompt: string;

    if (method === "precedent") {
      prompt = `You are a Nigerian legal document formatter specialising in the Legal Practitioners' Remuneration Order 2023.

The user has provided an existing precedent document. Reformat it as follows:
1. Apply proper Nigerian legal document structure with numbered clauses
2. Ensure compliance with the Legal Practitioners' Remuneration Order 2023
3. Add a compliance footer referencing the Remuneration Order 2023
4. Preserve all original parties, terms, and substance exactly
5. Correct any year references to use ${currentYear}

PRECEDENT DOCUMENT:
${precedentText}

Return only the formatted document. No preamble or explanation.`;
    } else {
      prompt = buildPrompt(documentType, formData as Record<string, string>, currentDate, currentYear);
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    const message = error?.message ?? "Unknown error";
    console.error("generate-document error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
