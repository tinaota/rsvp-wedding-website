import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { sendCoupleNotification, sendGuestConfirmation } from "@/lib/rsvp/notify";
import { markNotified, saveRsvp } from "@/lib/rsvp/store";
import type { RsvpSubmission } from "@/lib/rsvp/types";
import { AU_STATES, EMPTY_ADDRESS } from "@/components/rsvp/types";

/**
 * RSVP submission endpoint.
 *
 * The reply is validated, written to Supabase, then emailed to the couple.
 * The database is the system of record: a storage failure asks the guest to
 * try again, an email failure does not, because the reply is already safe.
 */

// node:crypto and the Supabase client both want the Node runtime, not Edge.
export const runtime = "nodejs";

const MAX_TEXT = 2000;
/** Enough for every offered option plus a few, not enough to be a payload. */
const MAX_DIETARY_ITEMS = 20;
const MAX_EXTRA_ADULTS = 4;
const MAX_CHILDREN = 5;

/** Mirrors the client check in StepDetails.tsx. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function asString(value: unknown, max = 200): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function asTriState(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function parse(body: unknown): { data: RsvpSubmission } | { error: string } {
  if (!body || typeof body !== "object")
    return { error: "Expected a JSON object." };
  const raw = body as Record<string, unknown>;

  const fullName = asString(raw.fullName);
  if (!fullName) return { error: "A name is required." };

  const mobile = asString(raw.mobile, 40);
  if (!mobile) return { error: "A mobile number is required." };

  // Required since replies are confirmed and followed up by email.
  const email = asString(raw.email);
  if (!email) return { error: "An email address is required." };
  if (!EMAIL_RE.test(email)) return { error: "That email address looks wrong." };

  const attending = raw.attending;
  if (attending !== "accepts" && attending !== "declines") {
    return { error: "A reply of 'accepts' or 'declines' is required." };
  }

  const extraAdults = Array.isArray(raw.extraAdults)
    ? raw.extraAdults.slice(0, MAX_EXTRA_ADULTS).map((entry) => {
        const a = (entry ?? {}) as Record<string, unknown>;
        return { name: asString(a.name), tbc: a.tbc === true };
      })
    : [];

  const children = Array.isArray(raw.children)
    ? raw.children.slice(0, MAX_CHILDREN).map((entry) => {
        const c = (entry ?? {}) as Record<string, unknown>;
        return { name: asString(c.name), age: asString(c.age, 3) };
      })
    : [];

  const dietaryRaw = (raw.dietary ?? {}) as Record<string, unknown>;
  const asList = (value: unknown) =>
    Array.isArray(value)
      ? value
          .slice(0, MAX_DIETARY_ITEMS)
          .map((v) => asString(v, 60))
          .filter(Boolean)
      : [];

  const logisticsRaw = (raw.logistics ?? {}) as Record<string, unknown>;

  // Postal address, for a thank-you card. Asked of everyone, and only the
  // branch the guest chose is kept: switching back and forth on the form can
  // leave stale values in the other one.
  //
  // A payload with no `residence` key at all comes from a page loaded before
  // the address question existed. Rejecting it would show "try again" to a
  // guest whose open tab can never succeed, so it is stored with no address
  // and lands in the mailing list as "Address needed", like any early reply.
  // The current form always sends the key, so for it the question is still
  // required.
  const residence =
    raw.residence === undefined ? null : (raw.residence as unknown);
  if (
    residence !== null &&
    residence !== "australia" &&
    residence !== "overseas"
  ) {
    return { error: "Please say whether you live in Australia or overseas." };
  }
  let address = { ...EMPTY_ADDRESS };
  let country = "";
  if (residence === "australia") {
    const a = (raw.address ?? {}) as Record<string, unknown>;
    address = {
      line1: asString(a.line1),
      line2: asString(a.line2),
      suburb: asString(a.suburb, 80),
      state: asString(a.state, 3).toUpperCase(),
      postcode: asString(a.postcode, 4),
    };
    if (!address.line1) return { error: "A street address is required." };
    if (!address.suburb) return { error: "A suburb is required." };
    if (!AU_STATES.some((s) => s.code === address.state)) {
      return { error: "Please choose an Australian state or territory." };
    }
    if (!/^\d{4}$/.test(address.postcode)) {
      return { error: "Postcodes are 4 digits." };
    }
  } else if (residence === "overseas") {
    country = asString(raw.country, 80);
    if (!country) return { error: "A country is required." };
  }

  return {
    data: {
      fullName,
      mobile,
      email,
      attending,
      extraAdults,
      children,
      hasDietaryNeeds: asTriState(raw.hasDietaryNeeds),
      dietary: {
        allergies: asList(dietaryRaw.allergies),
        diets: asList(dietaryRaw.diets),
        other: asString(dietaryRaw.other, MAX_TEXT),
      },
      travellingOutOfTown: asTriState(raw.travellingOutOfTown),
      logistics: {
        overnight: logisticsRaw.overnight === true,
        parking: logisticsRaw.parking === true,
        transport: logisticsRaw.transport === true,
      },
      message: asString(raw.message, MAX_TEXT),
      blessing: asString(raw.blessing, MAX_TEXT),
      residence,
      address,
      country,
    },
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON." },
      { status: 400 },
    );
  }

  // Honeypot. This used to discard the reply outright, until a real guest's
  // browser autofilled the hidden field and their RSVP vanished. Now it only
  // suppresses the emails — the reply is still stored and flagged, because a
  // junk row someone deletes beats a guest who thinks they replied and hasn't.
  const filler = (body as Record<string, unknown> | null)?.hp;
  const spamSuspected = typeof filler === "string" && filler.trim().length > 0;

  const result = parse(body);
  if ("error" in result) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 400 },
    );
  }

  const data = result.data;
  const id = randomUUID();

  // Last-resort recovery path: if both the database and email fail, the reply
  // is still recoverable from the platform logs for as long as they are kept.
  console.log(
    `[rsvp] ${id} — ${data.fullName} ${data.attending} ` +
      `(${1 + data.extraAdults.length} adults, ${data.children.length} ` +
      `${data.children.length === 1 ? "child" : "children"})`,
  );
  console.log(
    JSON.stringify({ id, receivedAt: new Date().toISOString(), ...data }),
  );

  try {
    await saveRsvp(id, data, {
      userAgent: request.headers.get("user-agent"),
      spamSuspected,
    });
  } catch (err) {
    // Nothing remembers this reply, so the guest must be told to try again.
    // RsvpFlow shows its retry message on any non-ok response.
    console.error(`[rsvp] ${id} — could not store the reply:`, err);
    return NextResponse.json(
      { ok: false, error: "We couldn't save your reply." },
      { status: 500 },
    );
  }

  if (spamSuspected) {
    // Stored and flagged. No email, so a bot cannot run up the Resend bill.
    console.warn(`[rsvp] ${id} — honeypot filled; stored, flagged, not emailed`);
    return NextResponse.json({ ok: true, id }, { status: 201 });
  }

  // Everything below is best effort: the reply is safe now.
  try {
    await sendCoupleNotification(id, data);
    await markNotified(id);
  } catch (err) {
    // A null notified_at is the queryable list of replies nobody was told about.
    console.error(`[rsvp] ${id} — could not notify the couple:`, err);
  }

  try {
    await sendGuestConfirmation(data);
  } catch (err) {
    console.error(`[rsvp] ${id} — could not confirm to the guest:`, err);
  }

  return NextResponse.json({ ok: true, id }, { status: 201 });
}
