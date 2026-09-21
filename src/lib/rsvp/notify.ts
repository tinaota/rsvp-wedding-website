import { Resend } from "resend";
import {
  RSVP_DEADLINE_LABEL,
  dietarySummary,
  partySize,
} from "@/components/rsvp/types";
import type { RsvpSubmission } from "./types";

/**
 * All email work, kept out of the route so it stays a thin
 * validate-store-respond layer.
 *
 * Sending is best effort by design: the reply is already in the database
 * before either of these runs, so a failure is logged loudly and never
 * bounced back to the guest.
 */

const COUPLE = "Herald & Yeukai";
const EVENT = "Saturday, 7 November 2026 · 6:30 PM AEDT · The Langham Melbourne";
const DIRECTIONS =
  "https://www.google.com/maps/dir/?api=1&destination=The+Langham+Melbourne,+1+Southgate+Ave,+Southbank+VIC+3006";
const CONTACT = "yeukaiweddingvowrenewal@gmail.com";

/**
 * Resend's test sender only delivers to the address on the Resend account, so
 * guest confirmations would silently fail for everyone else. This is the one
 * gate that turns them on: set RESEND_FROM to an address on a domain verified
 * in Resend and confirmations start sending, no code change.
 */
export function isVerifiedSender(): boolean {
  const from = process.env.RESEND_FROM;
  if (!from) return false;
  // onboarding@resend.dev is the test sender: it only delivers to the address
  // on the Resend account, so shipping it would attempt — and fail — a
  // confirmation for every guest. Treat it as unverified unless someone has
  // deliberately opted in to preview a confirmation in development.
  if (/@resend\.dev>?\s*$/i.test(from)) {
    return process.env.RESEND_ALLOW_TEST_SENDER === "true";
  }
  return true;
}

function sender(): string {
  return process.env.RESEND_FROM || `${COUPLE} <onboarding@resend.dev>`;
}

function client(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set.");
  return new Resend(key);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain-text lines become a simple HTML body in the site's typography. */
function toHtml(lines: string[]): string {
  const body = lines
    .map((line) =>
      line
        ? `<p style="margin:0 0 10px">${escapeHtml(line)}</p>`
        : `<div style="height:10px"></div>`,
    )
    .join("");
  return (
    `<div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;` +
    `line-height:1.6;color:#2b2622;max-width:38em">${body}</div>`
  );
}

function partyLabel(data: RsvpSubmission): string {
  const adults = 1 + data.extraAdults.length;
  const kids = data.children.length;
  const parts = [`${adults} adult${adults === 1 ? "" : "s"}`];
  if (kids) parts.push(`${kids} ${kids === 1 ? "child" : "children"}`);
  return parts.join(", ");
}

function coupleLines(id: string, data: RsvpSubmission): string[] {
  const lines = [
    `${data.fullName} ${data.attending === "accepts" ? "accepts" : "declines"}.`,
    "",
    `Mobile: ${data.mobile}`,
    `Email: ${data.email}`,
  ];

  if (data.attending === "accepts") {
    lines.push("", `Party: ${partySize(data)} in total (${partyLabel(data)})`);
    for (const adult of data.extraAdults) {
      lines.push(
        `  · ${adult.tbc ? "Guest — name to be confirmed" : adult.name || "(no name given)"}`,
      );
    }
    for (const child of data.children) {
      lines.push(
        `  · ${child.name || "(no name given)"}${child.age ? ` — age ${child.age}` : ""}`,
      );
    }

    lines.push("", `Dietary: ${dietarySummary(data)}`);

    const travel =
      data.travellingOutOfTown === null
        ? "Not answered"
        : data.travellingOutOfTown
          ? "Yes"
          : "No";
    lines.push("", `Travelling from out of town: ${travel}`);
    const wants = [
      data.logistics.overnight ? "Staying overnight at The Langham" : null,
      data.logistics.parking ? "Needs parking validated" : null,
      data.logistics.transport ? "Would like help with transport" : null,
    ].filter(Boolean) as string[];
    lines.push(`Logistics: ${wants.length ? wants.join("; ") : "Nothing asked for"}`);

    if (data.message.trim()) lines.push("", "Message:", data.message.trim());
  } else if (data.blessing.trim()) {
    lines.push("", "Blessing:", data.blessing.trim());
  }

  lines.push("", `Reference: ${id}`);
  return lines;
}

/** Subject carries the answer at a glance, for a phone lock screen. */
function coupleSubject(data: RsvpSubmission): string {
  return data.attending === "accepts"
    ? `RSVP — ${data.fullName} accepts (${partyLabel(data)})`
    : `RSVP — ${data.fullName} declines`;
}

export async function sendCoupleNotification(
  id: string,
  data: RsvpSubmission,
): Promise<void> {
  const to = (process.env.RSVP_NOTIFY_TO || "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  if (!to.length) throw new Error("RSVP_NOTIFY_TO is not set.");

  const lines = coupleLines(id, data);
  const { data: sent, error } = await client().emails.send({
    from: sender(),
    to,
    replyTo: data.email,
    subject: coupleSubject(data),
    text: lines.join("\n"),
    html: toHtml(lines),
  });
  if (error) throw new Error(`Resend rejected the notification: ${error.message}`);
  // The provider id, so an "it never arrived" report can be traced in Resend
  // rather than argued about.
  console.log(`[rsvp] ${id} — notification queued as ${sent?.id} to ${to.join(", ")}`);
}

export async function sendGuestConfirmation(
  data: RsvpSubmission,
): Promise<void> {
  if (!isVerifiedSender()) {
    console.log(
      "[rsvp] guest confirmation skipped — RESEND_FROM is unset, so the test " +
        "sender would only deliver to the Resend account address.",
    );
    return;
  }

  const lines =
    data.attending === "accepts"
      ? [
          `Dear ${data.fullName},`,
          "",
          "Thank you — your reply is in. Here is what you told us:",
          "",
          `Party: ${partySize(data)} (${partyLabel(data)})`,
          `Dietary needs: ${dietarySummary(data)}`,
          "",
          EVENT,
          `Directions: ${DIRECTIONS}`,
          "",
          `Need to change your reply before ${RSVP_DEADLINE_LABEL}? Reply to ` +
            `this email or write to ${CONTACT} and we'll update it for you.`,
          "",
          `With love, ${COUPLE}`,
        ]
      : [
          `Dear ${data.fullName},`,
          "",
          "Thank you for letting us know. You will be missed on the day, and " +
            "we are grateful you took the time to reply.",
          "",
          `If anything changes before ${RSVP_DEADLINE_LABEL}, write to ` +
            `${CONTACT} and we'll update your reply.`,
          "",
          `With love, ${COUPLE}`,
        ];

  const { data: sent, error } = await client().emails.send({
    from: sender(),
    to: data.email,
    subject: `Your RSVP for ${COUPLE}`,
    text: lines.join("\n"),
    html: toHtml(lines),
  });
  if (error) throw new Error(`Resend rejected the confirmation: ${error.message}`);
  console.log(`[rsvp] confirmation queued as ${sent?.id} to ${data.email}`);
}
