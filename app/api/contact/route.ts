import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "weworkinweb@gmail.com";
const GMAIL_USER = process.env.GMAIL_USER ?? "weworkinweb@gmail.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  try {
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!pass) {
      console.warn("[Contact] GMAIL_APP_PASSWORD not set. Add it to .env.local");
      return NextResponse.json(
        {
          error:
            "Contact form is not configured. Please set GMAIL_APP_PASSWORD in your environment.",
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

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: GMAIL_USER, pass },
    });

    await transporter.sendMail({
      from: `"Charts AI" <${GMAIL_USER}>`,
      to: CONTACT_EMAIL,
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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Contact] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
