import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

/**
 * RSVP submission endpoint.
 *
 * The reply is validated and logged, then acknowledged. Nothing is persisted yet:
 * TODO — swap the `persist` call below for a database write or an email provider.
 * That function is the only place that needs to change.
 */

interface ExtraAdultInput {
  name: string;
  tbc: boolean;
}

interface ChildInput {
  name: string;
  age: string;
}

interface RsvpSubmission {
  fullName: string;
  mobile: string;
  email: string;
  attending: "accepts" | "declines";
  extraAdults: ExtraAdultInput[];
  children: ChildInput[];
  hasDietaryNeeds: boolean | null;
  dietary: { allergies: string[]; diets: string[]; other: string };
  travellingOutOfTown: boolean | null;
  logistics: { overnight: boolean; parking: boolean; transport: boolean };
  message: string;
  blessing: string;
}

const MAX_TEXT = 2000;
/** Enough for every offered option plus a few, not enough to be a payload. */
const MAX_DIETARY_ITEMS = 20;
const MAX_EXTRA_ADULTS = 4;
const MAX_CHILDREN = 5;

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

  return {
    data: {
      fullName,
      mobile,
      email: asString(raw.email),
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
    },
  };
}

async function persist(id: string, data: RsvpSubmission): Promise<void> {
  // TODO: replace with a real store (database insert, email, spreadsheet append…).
  console.log(
    `[rsvp] ${id} — ${data.fullName} ${data.attending} ` +
      `(${1 + data.extraAdults.length} adults, ${data.children.length} ` +
      `${data.children.length === 1 ? "child" : "children"})`,
  );
  console.log(
    JSON.stringify({ id, receivedAt: new Date().toISOString(), ...data }),
  );
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

  const result = parse(body);
  if ("error" in result) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 400 },
    );
  }

  const id = randomUUID();
  await persist(id, result.data);

  return NextResponse.json({ ok: true, id }, { status: 201 });
}
