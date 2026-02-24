import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

/**
 * Sends auth emails (verification, password reset) via Gmail SMTP.
 * Called by Convex - nodemailer cannot run in Convex's bundler.
 *
 * Requires: Authorization: Bearer <SEND_EMAIL_SECRET>
 * Body: { to, subject, text, html? }
 */

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = process.env.SEND_EMAIL_SECRET?.trim();
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    return NextResponse.json(
      { error: "GMAIL_USER or GMAIL_APP_PASSWORD not configured" },
      { status: 503 },
    );
  }

  let body: { to?: string; subject?: string; text?: string; html?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { to, subject, text, html } = body;
  if (!to || !subject || !text) {
    return NextResponse.json(
      { error: "to, subject, and text are required" },
      { status: 400 },
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Charts AI" <${user}>`,
    to,
    subject,
    text,
    html: html ?? text.replace(/\n/g, "<br>"),
  });

  return NextResponse.json({ ok: true });
}
