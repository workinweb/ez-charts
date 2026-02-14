/**
 * Send email via Resend API.
 * Set RESEND_API_KEY in Convex dashboard. Without it, emails are logged only.
 */
async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ?? "Charts AI <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("[sendEmail] RESEND_API_KEY not set. Would have sent:", {
      to,
      subject,
      text: text.slice(0, 80) + "...",
    });
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html: html ?? text.replace(/\n/g, "<br>"),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[sendEmail] Resend error:", res.status, err);
    throw new Error(`Failed to send email: ${res.status}`);
  }
}

export { sendEmail };
