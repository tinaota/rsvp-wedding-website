import { NextResponse } from "next/server";
import {
  buildSummary,
  describeChanges,
  isPastWedding,
  lastSentStable,
  sendSummary,
  stableSection,
  withChanges,
} from "@/lib/rsvp/summary";

/**
 * Checks the RSVPs every morning at 8am Melbourne time and emails the family
 * only when the guest list has changed since the last email they received.
 *
 * Scheduled in vercel.json at 21:00 UTC, which is 8am AEDT. Daylight saving
 * runs from early October to April, so that holds for every day this runs.
 *
 * `?preview=1` returns what would be sent, with the decision, without sending.
 * `?force=1` sends even if nothing changed.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Unlike the keep-alive, this route must never run unauthenticated: it
  // emails guests' names, and anyone who found the URL could trigger it.
  // Vercel sends this header on scheduled runs once CRON_SECRET is set.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[daily-summary] CRON_SECRET is not set; refusing to send.");
    return NextResponse.json({ ok: false, error: "not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const preview = params.get("preview") === "1";
  const force = params.get("force") === "1";

  if (isPastWedding() && !preview) {
    console.log("[daily-summary] after the wedding; nothing sent.");
    return NextResponse.json({ ok: true, sent: false, reason: "after the wedding" });
  }

  try {
    const base = await buildSummary();
    const now = stableSection(base.lines.join("\n"));

    // If the last email can't be read back, send anyway: a repeated email is
    // a far smaller problem than a change nobody hears about.
    let before: string | null = null;
    try {
      before = await lastSentStable();
    } catch (err) {
      console.error("[daily-summary] could not read the last summary:", err);
    }

    const unchanged = before !== null && before === now;
    const summary = before === null ? base : withChanges(base, describeChanges(before, now));
    const decision = unchanged && !force ? "no change, would not send" : "would send";

    if (preview) {
      return new NextResponse(
        `[${decision}]\n\n${summary.subject}\n\n${summary.lines.join("\n")}`,
        { headers: { "content-type": "text/plain; charset=utf-8" } },
      );
    }

    if (unchanged && !force) {
      console.log("[daily-summary] no change since the last summary; nothing sent.");
      return NextResponse.json({ ok: true, sent: false, reason: "no change" });
    }

    const id = await sendSummary(summary);
    console.log(`[daily-summary] sent as ${id}: ${summary.subject}`);
    return NextResponse.json({ ok: true, sent: true, id });
  } catch (err) {
    console.error("[daily-summary] FAILED:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
