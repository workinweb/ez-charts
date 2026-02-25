import { Resend } from "resend";

/**
 * Send auth emails via Resend SDK (same as contact form).
 *
 * Required in Convex: RESEND_API_KEY, EMAIL_FROM
 * Resend: Add & verify your domain at https://resend.com/domains, then use
 *   EMAIL_FROM e.g. "EZ Charts <noreply@yourdomain.com>"
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
  const from = process.env.EMAIL_FROM ?? "";

  if (!apiKey) {
    console.warn("[sendEmail] RESEND_API_KEY not set. Would have sent:", {
      to,
      subject,
      text: text.slice(0, 80) + "...",
    });
    return;
  }

  console.log("🚀 ~ sendEmail ~ from:", from);
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    text,
    html: html ?? text.replace(/\n/g, "<br>"),
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/** Wrapper for auth emails with consistent branding. */
function authEmailBody({
  title,
  body,
  buttonText,
  url,
}: {
  title: string;
  body: string;
  buttonText: string;
  url: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f7f8;padding:24px">
  <div style="max-width:420px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.06)">
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#3D4035">${title}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:rgba(61,64,53,0.8)">${body}</p>
    <a href="${url}" style="display:inline-block;padding:12px 24px;background:#6C5DD3;color:#fff;text-decoration:none;font-weight:600;font-size:14px;border-radius:12px">${buttonText}</a>
    <p style="margin:24px 0 0;font-size:13px;color:rgba(61,64,53,0.5)">If you didn't request this, you can ignore this email.</p>
  </div>
</body>
</html>
`.trim();
}

export { sendEmail, authEmailBody };
