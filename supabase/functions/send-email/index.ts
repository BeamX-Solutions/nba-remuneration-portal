const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  type: "account_approved" | "account_suspended" | "document_completed" | "document_approved" | "document_rejected" | "custom";
  to: string;
  name?: string;
  document_type?: string;
  title?: string;
  reference_number?: string;
  rejection_reason?: string;
  subject?: string;
  body?: string;
}

function buildEmailHtml(payload: EmailPayload): { subject: string; html: string } {
  const greeting = payload.name ? `Dear ${payload.name},` : "Dear Member,";
  const footer = `
    <hr style="margin:32px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="color:#94a3b8;font-size:12px;text-align:center;">
      NBA Remuneration Portal &nbsp;|&nbsp; This is an automated notification.
    </p>`;

  switch (payload.type) {
    case "account_approved":
      return {
        subject: "Your NBA Remuneration Portal Account Has Been Approved",
        html: `<p>${greeting}</p>
          <p>Your NBA Remuneration Portal account has been <strong>approved</strong>. You can now sign in and access all portal features.</p>
          <p><a href="${Deno.env.get("SITE_URL") || "https://yourportal.com"}/signin" style="background:#1a6b3a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Sign In Now</a></p>
          ${footer}`,
      };

    case "account_suspended":
      return {
        subject: "Your NBA Remuneration Portal Account Has Been Suspended",
        html: `<p>${greeting}</p>
          <p>Your NBA Remuneration Portal account has been <strong>suspended</strong>. Please contact the Remuneration Committee for further information.</p>
          ${footer}`,
      };

    case "document_completed":
      return {
        subject: `Document Ready: ${payload.document_type || "Legal Document"}`,
        html: `<p>${greeting}</p>
          <p>Your document <strong>"${payload.title}"</strong> (Reference: <code>${payload.reference_number}</code>) has been reviewed and marked as <strong>completed</strong> by the branch secretariat.</p>
          <p>Please sign in to download your document.</p>
          ${footer}`,
      };

    case "document_approved":
      return {
        subject: `Document Approved: ${payload.title || "Legal Document"}`,
        html: `<p>${greeting}</p>
          <p>Your document <strong>"${payload.title}"</strong> (Reference: <code>${payload.reference_number}</code>) has been <strong>approved</strong>.</p>
          <p>Please sign in to view and download your approved document.</p>
          ${footer}`,
      };

    case "document_rejected":
      return {
        subject: `Document Requires Revision: ${payload.title || "Legal Document"}`,
        html: `<p>${greeting}</p>
          <p>Your document <strong>"${payload.title}"</strong> (Reference: <code>${payload.reference_number}</code>) has been <strong>returned for revision</strong>.</p>
          ${payload.rejection_reason ? `<p><strong>Reason:</strong> ${payload.rejection_reason}</p>` : ""}
          <p>Please sign in to review and make the necessary corrections.</p>
          ${footer}`,
      };

    case "custom":
      return {
        subject: payload.subject || "Message from NBA Remuneration Portal",
        html: `<p>${greeting}</p><p>${payload.body || ""}</p>${footer}`,
      };

    default:
      return { subject: "NBA Remuneration Portal Notification", html: `<p>${greeting}</p>${footer}` };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: EmailPayload = await req.json();
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!resendKey) {
      console.warn("RESEND_API_KEY not set — email not sent");
      return new Response(JSON.stringify({ sent: false, reason: "RESEND_API_KEY not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, html } = buildEmailHtml(payload);
    const fromAddress = Deno.env.get("EMAIL_FROM") || "noreply@nbaremuneration.org.ng";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `NBA Remuneration Portal <${fromAddress}>`,
        to: [payload.to],
        subject,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b;">${html}</div>`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error: ${err}`);
    }

    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("send-email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
