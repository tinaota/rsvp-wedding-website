import { createClient } from "@supabase/supabase-js";
import { dietarySummary } from "@/components/rsvp/types";
import type { RsvpSubmission } from "./types";

/**
 * The durable record of every reply.
 *
 * Email is the notification; this is the system of record. If a write here
 * fails the guest is asked to try again, because nothing else will remember
 * what they told us.
 */

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Built lazily rather than at module load: a missing env var should fail the
 * one request that needed it, not the whole build.
 */
function client() {
  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set.",
    );
  }
  return createClient(url, serviceRoleKey, {
    // No browser here, so there is no session to persist or refresh.
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isConfigured(): boolean {
  return Boolean(url && serviceRoleKey);
}

/** Inserts the reply. Throws on failure so the route can answer with a 500. */
export async function saveRsvp(
  id: string,
  data: RsvpSubmission,
  meta: { userAgent?: string | null; spamSuspected?: boolean },
): Promise<void> {
  const { error } = await client()
    .from("rsvps")
    .insert({
      id,
      full_name: data.fullName,
      mobile: data.mobile,
      email: data.email,
      attending: data.attending,
      extra_adults: data.extraAdults,
      children: data.children,
      has_dietary_needs: data.hasDietaryNeeds,
      dietary_allergies: data.dietary.allergies,
      dietary_diets: data.dietary.diets,
      dietary_other: data.dietary.other,
      // Same helper the review screen used, so the row reads back exactly as
      // the guest approved it.
      dietary_summary: dietarySummary(data),
      travelling_out_of_town: data.travellingOutOfTown,
      overnight: data.logistics.overnight,
      parking: data.logistics.parking,
      transport: data.logistics.transport,
      message: data.message,
      blessing: data.blessing,
      user_agent: meta.userAgent ?? null,
      spam_suspected: meta.spamSuspected ?? false,
    });

  if (error) throw new Error(`Supabase insert failed: ${error.message}`);
}

/**
 * Best effort. The reply is already safe by the time this runs, so a failure
 * here is logged and swallowed rather than surfaced to the guest.
 */
export async function markNotified(id: string): Promise<void> {
  try {
    const { error } = await client()
      .from("rsvps")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error(`[rsvp] ${id} — could not set notified_at:`, err);
  }
}

/**
 * A real read against the table, used by the keep-alive cron to count as
 * database activity on the free plan. Returns the number of replies stored,
 * which also makes the cron's log line a useful running total.
 */
export async function pingStore(): Promise<number> {
  const { count, error } = await client()
    .from("rsvps")
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(`Supabase ping failed: ${error.message}`);
  return count ?? 0;
}
