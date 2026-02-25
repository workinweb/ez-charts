import { Resend } from "resend";
import { NextResponse } from "next/server";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "weworkinweb@gmail.com";
const EMAIL_FROM = process.env.EMAIL_FROM ?? "";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[Contact] RESEND_API_KEY not set. Add it to .env.local");
      return NextResponse.json(
        {
          error:
            "Contact form is not configured. Please set RESEND_API_KEY in your environment.",
        },
        { status: 503 },
      );
    }

    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required." },
        { status: 400 },
      );
    }

    const safeName = escapeHtml(String(name).slice(0, 200));
    const safeEmail = escapeHtml(String(email).slice(0, 200));
    const safeSubject = escapeHtml(String(subject).slice(0, 200));
    const safeMessage = escapeHtml(String(message).slice(0, 10000)).replace(
      /\n/g,
      "<br>",
    );

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
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
    });

    if (error) {
      console.error("[Contact] Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Contact] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
