import Anthropic from "npm:@anthropic-ai/sdk@0.27.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, method, documentType, precedentText } = await req.json();

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    const client = new Anthropic({ apiKey });

    let prompt: string;

    if (method === "precedent") {
      prompt = `You are a Nigerian legal document formatter specialising in the Legal Practitioners' Remuneration Order 2023.

The user has provided an existing precedent document. Your task is to:
1. Reformat it cleanly with proper legal structure
2. Ensure it complies with the Legal Practitioners' Remuneration Order 2023
3. Add a compliance footer referencing the Remuneration Order 2023
4. Preserve all the original parties, terms, and substance

PRECEDENT DOCUMENT:
${precedentText}

Return only the formatted document text. Do not include any preamble or explanation.`;
    } else {
      const DOC_TYPE_LABELS: Record<string, string> = {
        deed_of_assignment: "Deed of Assignment",
        deed_of_gift: "Deed of Gift",
        mortgage_deed: "Mortgage Deed",
        power_of_attorney: "Power of Attorney",
        contract_of_sale: "Contract of Sale",
        tenancy_agreement: "Tenancy Agreement",
      };

      const docLabel = DOC_TYPE_LABELS[documentType] || documentType;

      prompt = `You are a Nigerian legal document drafter specialising in the Legal Practitioners' Remuneration Order 2023.

Draft a professionally worded, legally compliant ${docLabel} using the following details:

${Object.entries(formData as Record<string, string>)
  .filter(([, v]) => v)
  .map(([k, v]) => `${k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}: ${v}`)
  .join("\n")}

Requirements:
- Use proper Nigerian legal document formatting
- Include all standard recitals, operative words, and testimonium
- Include a compliance footer referencing the Legal Practitioners' Remuneration Order 2023
- Use clear headings and numbered clauses where appropriate
- Leave signature lines with blank lines for execution

Return only the document text. Do not include any preamble or explanation.`;
    }

    const message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("generate-document error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
