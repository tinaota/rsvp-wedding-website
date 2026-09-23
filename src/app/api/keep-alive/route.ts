import { NextResponse } from "next/server";
import { pingStore } from "@/lib/rsvp/store";

/**
 * Keeps the Supabase project awake.
 *
 * Free-plan projects are paused after roughly seven days of low database
 * activity. RSVPs arrive in bursts — a wave when invitations go out, then
 * quiet weeks — so the gaps between them are easily long enough to trigger a
 * pause. A paused project rejects writes, which would mean a guest completing
 * the form and being told to try again, with nobody aware anything is wrong.
 *
 * One real query a day is enough to count as activity.
 */

export const runtime = "nodejs";
// Never cached: a cached response would not touch the database, which is the
// entire point of the request.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Vercel sends this header when CRON_SECRET is set on the project. If the
  // secret is not configured the route stays open, which is harmless — the
  // worst an outsider can do is keep the database awake for us.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  try {
    const count = await pingStore();
    console.log(`[keep-alive] ok — ${count} replies stored`);
    return NextResponse.json({ ok: true, replies: count });
  } catch (err) {
    // Worth shouting about: if this fails for a week the project pauses and
    // the next guest to reply cannot.
    console.error("[keep-alive] FAILED — the database did not respond:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
