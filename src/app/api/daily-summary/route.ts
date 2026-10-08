import { NextResponse } from "next/server";
import { buildSummary, isPastWedding, sendSummary } from "@/lib/rsvp/summary";

/**
 * Emails the family the RSVP numbers every morning at 8am Melbourne time.
 *
 * Scheduled in vercel.json at 21:00 UTC, which is 8am AEDT. Daylight saving
 * runs from early October to April, so that holds for every day this sends.
 *
 * `?preview=1` returns the email as text without sending it.
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

  const preview = new URL(request.url).searchParams.get("preview") === "1";

  if (isPastWedding() && !preview) {
    console.log("[daily-summary] after the wedding; nothing sent.");
    return NextResponse.json({ ok: true, sent: false, reason: "after the wedding" });
  }

  try {
    const summary = await buildSummary();
    if (preview) {
      return new NextResponse(`${summary.subject}\n\n${summary.lines.join("\n")}`, {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    const id = await sendSummary(summary);
    console.log(`[daily-summary] sent as ${id}: ${summary.subject}`);
    return NextResponse.json({ ok: true, sent: true, id });
  } catch (err) {
    console.error("[daily-summary] FAILED:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
