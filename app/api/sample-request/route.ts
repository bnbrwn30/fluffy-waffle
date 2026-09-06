import { NextResponse } from "next/server";
import { sampleRequestSchema } from "@/lib/sampleRequest";

/**
 * Accepts a sample enquiry and delivers it.
 *
 * Two channels, tried in order, both optional:
 *   RESEND_API_KEY + CONTACT_TO_EMAIL  — emails the enquiry (no SDK, plain fetch)
 *   SAMPLE_WEBHOOK_URL                 — posts it to Slack/Zapier/a CRM
 *
 * With neither configured the request is still accepted, and the response says
 * `delivered: false` so the browser can fall back to handing the enquiry to
 * WhatsApp rather than silently swallowing it.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = sampleRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  // Honeypot tripped — accept silently so the bot learns nothing.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { website: _omit, ...enquiry } = parsed.data;
  const payload = { ...enquiry, receivedAt: new Date().toISOString() };

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const webhook = process.env.SAMPLE_WEBHOOK_URL;

  if (!apiKey && !webhook) {
    console.warn(
      "[sample-request] No RESEND_API_KEY or SAMPLE_WEBHOOK_URL — enquiry accepted but NOT delivered:",
      payload,
    );
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    if (apiKey && to) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev",
          to: [to],
          // So a reply from the inbox goes straight back to the buyer.
          reply_to: enquiry.email,
          subject: `Sample request — ${enquiry.company} (${enquiry.country})`,
          text: asEmail(enquiry),
        }),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    }

    if (webhook) {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    }
  } catch (err) {
    console.error("[sample-request] delivery failed:", err);
    return NextResponse.json(
      { error: "We couldn't send that. Please message us on WhatsApp." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, delivered: true });
}

/** Plain text rather than HTML: it lands readably in every client. */
function asEmail(e: {
  name: string;
  company: string;
  email: string;
  country: string;
  regions: string[];
  message?: string;
}): string {
  return [
    `Name:     ${e.name}`,
    `Company:  ${e.company}`,
    `Email:    ${e.email}`,
    `Country:  ${e.country}`,
    `Regions:  ${e.regions.join(", ")}`,
    "",
    e.message?.trim() || "(no message)",
  ].join("\n");
}
