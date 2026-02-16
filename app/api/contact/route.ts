import { NextResponse } from "next/server";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? process.env.EMAIL_FROM ?? "support@example.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required." },
        { status: 400 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[Contact] RESEND_API_KEY not set. Would have sent:", {
        from: email,
        subject: `[Contact] ${subject}`,
      });
      return NextResponse.json({ ok: true });
    }

    const safeName = escapeHtml(String(name));
    const safeEmail = escapeHtml(String(email));
    const safeSubject = escapeHtml(String(subject));
    const safeMessage = escapeHtml(String(message)).replace(/\n/g, "<br>");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "EZ Charts <onboarding@resend.dev>",
        to: [CONTACT_EMAIL],
        replyTo: email,
        subject: `[Contact] ${subject}`,
        html: `
          <p><strong>From:</strong> ${safeName} &lt;${safeEmail}&gt;</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <hr />
          <p>${safeMessage}</p>
        `,
        text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Contact] Resend error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
