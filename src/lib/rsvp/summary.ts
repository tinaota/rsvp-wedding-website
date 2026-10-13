import { resendClient, toHtml } from "./notify";
import { supabaseAdmin } from "./store";

/**
 * The daily RSVP update emailed to the family each morning.
 *
 * Built straight from the table rather than the SQL views, so the email and
 * the views can't drift apart in how a household is counted.
 */

const FROM = "Tinashe Ota <tinashe@rsvp.tinsheotastudios.com>";
const TO = ["yeukaicota@gmail.com"];
const REPLY_TO = "tinasheota@gmail.com";

const TZ = "Australia/Melbourne";
const RSVP_CLOSES = "2026-10-12";
const WEDDING_DAY = "2026-11-07";

interface Row {
  full_name: string;
  attending: "accepts" | "declines";
  adults_count: number;
  children_count: number;
  extra_adults: { name?: string; tbc?: boolean }[];
  children: { name?: string; age?: string }[];
  has_dietary_needs: boolean | null;
  dietary_summary: string;
  residence: string | null;
  received_at: string;
}

/** YYYY-MM-DD for an instant, as the calendar reads in Melbourne. */
export function melbourneDate(at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

function niceDate(at: Date): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(at);
}

/** Whole days from one YYYY-MM-DD to another. */
function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

/** The cron stops sending after the wedding without anyone switching it off. */
export function isPastWedding(at: Date = new Date()): boolean {
  return melbourneDate(at) > WEDDING_DAY;
}

/**
 * "Valerie Agu + Romeo (12), Paris (10)". A guest marked "name later" and one
 * left blank are both kept, so the names always add up to the headcount.
 */
function householdLine(r: Row): string {
  const people: string[] = [];
  let toFollow = 0;
  let unnamed = 0;
  for (const a of r.extra_adults ?? []) {
    const name = (a.name ?? "").trim();
    if (a.tbc) toFollow++;
    else if (name) people.push(name);
    else unnamed++;
  }
  for (const c of r.children ?? []) {
    const name = (c.name ?? "").trim() || "Child";
    const age = (c.age ?? "").trim();
    people.push(age ? `${name} (${age})` : name);
  }
  if (toFollow) people.push(`${toFollow} guest${toFollow > 1 ? "s" : ""} (name to follow)`);
  if (unnamed) people.push(`${unnamed} guest${unnamed > 1 ? "s" : ""} (name not given)`);
  return [r.full_name.trim(), ...people].join(" + ");
}

export interface Summary {
  subject: string;
  lines: string[];
}

export async function buildSummary(now: Date = new Date()): Promise<Summary> {
  const { data, error } = await supabaseAdmin()
    .from("rsvps")
    .select(
      "full_name, attending, adults_count, children_count, extra_adults, " +
        "children, has_dietary_needs, dietary_summary, residence, received_at",
    )
    .eq("spam_suspected", false)
    .order("received_at");
  if (error) throw new Error(`Could not read replies: ${error.message}`);
  const rows = (data ?? []) as unknown as Row[];

  const coming = rows.filter((r) => r.attending === "accepts");
  const declined = rows.filter((r) => r.attending === "declines");
  const adults = coming.reduce((n, r) => n + r.adults_count, 0);
  const kids = coming.reduce((n, r) => n + r.children_count, 0);
  const total = adults + kids;

  // The cron runs once a day, so "new" means the last 24 hours.
  const since = now.getTime() - 24 * 60 * 60 * 1000;
  const isNew = (r: Row) => Date.parse(r.received_at) >= since;
  const fresh = rows.filter(isNew);

  const today = melbourneDate(now);
  const toClose = daysBetween(today, RSVP_CLOSES);
  const toWedding = daysBetween(today, WEDDING_DAY);

  const lines: string[] = [`RSVP update — ${niceDate(now)}`, ""];

  lines.push(
    `COMING: ${coming.length} households, ${total} guests`,
    `(${adults} adults + ${kids} children)`,
    `Declined: ${declined.length}`,
    "",
  );

  if (fresh.length) {
    lines.push(`NEW SINCE YESTERDAY (${fresh.length})`);
    for (const r of fresh) {
      lines.push(
        r.attending === "accepts"
          ? `• ${householdLine(r)}`
          : `• ${r.full_name.trim()} — can't make it`,
      );
    }
  } else {
    lines.push("No new RSVPs since yesterday.");
  }
  lines.push("");

  lines.push("EVERYONE COMING");
  coming.forEach((r, i) =>
    lines.push(`${i + 1}. ${householdLine(r)}${isNew(r) ? "  (new)" : ""}`),
  );
  lines.push("");

  if (declined.length) {
    lines.push("NOT COMING");
    for (const r of declined) lines.push(`• ${r.full_name.trim()}`);
    lines.push("");
  }

  const dietary = coming.filter((r) => r.has_dietary_needs);
  lines.push("DIETARY NEEDS");
  if (dietary.length) {
    for (const r of dietary) {
      lines.push(`• ${r.full_name.trim()}'s party: ${r.dietary_summary}`);
    }
  } else {
    lines.push("None so far.");
  }
  lines.push("");

  const noAddress = rows.filter((r) => r.residence === null);
  if (noAddress.length) {
    lines.push(`STILL NEED A POSTAL ADDRESS (${noAddress.length})`);
    for (const r of noAddress) lines.push(`• ${r.full_name.trim()}`);
    lines.push("");
  }

  if (toClose > 0) {
    lines.push(`RSVPs close 12 October — ${toClose} day${toClose === 1 ? "" : "s"} to go.`);
  } else if (toClose === 0) {
    lines.push("RSVPs close today.");
  } else {
    lines.push("RSVPs closed on 12 October.");
  }
  if (toWedding > 0) {
    lines.push(`The wedding is in ${toWedding} day${toWedding === 1 ? "" : "s"}.`);
  } else if (toWedding === 0) {
    lines.push("The wedding is today. 💛");
  }
  lines.push(
    "",
    "— checked every morning at 8am; sent only when something has changed",
  );

  const subject =
    `RSVP update — ${coming.length} households, ${total} guests` +
    (fresh.length ? ` (+${fresh.length} new)` : "");

  return { subject, lines };
}

/**
 * The part of a summary that reflects the guest list itself, with everything
 * that changes by the calendar alone removed: the date, the countdowns, the
 * "since yesterday" block and the "(new)" markers. Two summaries with the same
 * stable section describe the same list, so there is nothing to send.
 *
 * Works on the email's plain text, so it applies equally to a summary just
 * built and to one fetched back from Resend.
 */
export function stableSection(text: string): string {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.startsWith("COMING:"));
  const end = lines.findIndex((l) => l.startsWith("RSVPs clos"));
  if (start < 0) return "";
  const out: string[] = [];
  let inSinceBlock = false;
  for (const raw of lines.slice(start, end < 0 ? undefined : end)) {
    if (raw.startsWith("NEW SINCE YESTERDAY")) {
      inSinceBlock = true;
      continue;
    }
    if (inSinceBlock) {
      if (raw.trim() === "") inSinceBlock = false;
      continue;
    }
    if (raw.startsWith("No new RSVPs since yesterday")) continue;
    out.push(raw.replace(/\s+\(new\)$/, "").trimEnd());
  }
  // Collapse blank runs left behind by the removed block.
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Section title, without a trailing count such as "(7)". */
function sectionsOf(stable: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  let current = "";
  for (const line of stable.split("\n")) {
    if (!line.trim()) continue;
    if (/^[A-Z][A-Z ]+(\(\d+\))?$/.test(line.trim())) {
      current = line.replace(/\s*\(\d+\)$/, "").trim();
      map.set(current, []);
    } else if (current) {
      // Numbering shifts whenever someone is added; compare without it.
      map.get(current)!.push(line.replace(/^\d+\.\s+|^•\s+/, "").trim());
    }
  }
  return map;
}

/** Plain-English list of what differs between two stable sections. */
export function describeChanges(before: string, after: string): string[] {
  const a = sectionsOf(before);
  const b = sectionsOf(after);
  const diff = (key: string) => {
    const was = new Set(a.get(key) ?? []);
    const now = new Set(b.get(key) ?? []);
    return {
      added: [...now].filter((x) => !was.has(x)),
      removed: [...was].filter((x) => !now.has(x)),
    };
  };
  const firstName = (line: string) => line.split(" + ")[0];
  const changes: string[] = [];

  const guests = diff("EVERYONE COMING");
  for (const line of guests.added) {
    const replaced = guests.removed.find((r) => firstName(r) === firstName(line));
    changes.push(replaced ? `Updated: ${line}` : `New RSVP: ${line}`);
  }
  for (const line of guests.removed) {
    if (!guests.added.some((x) => firstName(x) === firstName(line))) {
      changes.push(`No longer coming: ${line}`);
    }
  }
  for (const name of diff("NOT COMING").added) changes.push(`Can't make it: ${name}`);
  for (const name of diff("STILL NEED A POSTAL ADDRESS").removed) {
    changes.push(`Address received: ${name}`);
  }
  for (const line of diff("DIETARY NEEDS").added) changes.push(`Dietary: ${line}`);

  // Anything else (a section that appeared or vanished wholesale) still
  // counts, so a change can never be silently dropped.
  if (!changes.length && before !== after) changes.push("The guest list was updated.");
  return changes;
}

/**
 * The stable section of the last summary that actually went out, read back
 * from Resend. Null if it can't be found or read, in which case the caller
 * sends anyway: a duplicate email is better than a missed change.
 */
export async function lastSentStable(): Promise<string | null> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const headers = {
    Authorization: `Bearer ${key}`,
    "User-Agent": "rsvp-wedding-website/1.0",
  };
  const list = await fetch("https://api.resend.com/emails?limit=100", { headers });
  if (!list.ok) return null;
  const body = (await list.json()) as {
    data?: { id: string; to?: string[]; subject?: string }[];
  };
  // Newest first, so the first match is the most recent summary.
  const last = (body.data ?? []).find(
    (e) => (e.to ?? []).includes(TO[0]) && (e.subject ?? "").startsWith("RSVP update"),
  );
  if (!last) return null;
  const one = await fetch(`https://api.resend.com/emails/${last.id}`, { headers });
  if (!one.ok) return null;
  const email = (await one.json()) as { text?: string };
  return email.text ? stableSection(email.text) : null;
}

/** Puts the "what changed" lines at the top, under the date. */
export function withChanges(summary: Summary, changes: string[]): Summary {
  if (!changes.length) return summary;
  const [title, blank, ...rest] = summary.lines;
  return {
    subject: `${summary.subject} · ${changes.length} change${changes.length === 1 ? "" : "s"}`,
    lines: [
      title,
      blank,
      "WHAT'S CHANGED",
      ...changes.map((c) => `• ${c}`),
      "",
      ...rest,
    ],
  };
}

export async function sendSummary(summary: Summary): Promise<string | undefined> {
  const { data, error } = await resendClient().emails.send({
    from: FROM,
    to: TO,
    replyTo: REPLY_TO,
    subject: summary.subject,
    text: summary.lines.join("\n"),
    html: toHtml(summary.lines),
  });
  if (error) throw new Error(`Resend rejected the summary: ${error.message}`);
  return data?.id;
}
