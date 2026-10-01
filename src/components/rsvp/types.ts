export type Attending = "accepts" | "declines" | null;

export type YesNo = boolean | null;

export interface ExtraAdult {
  name: string;
  /** "and guest" — the name is being confirmed later. */
  tbc: boolean;
}

export interface Child {
  name: string;
  /** Kept as a string: it comes straight from a number input. */
  age: string;
}

/** What the kitchen needs to know, collected only when the guest says yes. */
export interface Dietary {
  allergies: string[];
  diets: string[];
  /** Filled in when "Other" is ticked. */
  other: string;
}

/** Offered as tick boxes; anything outside these goes in `other`. */
export const ALLERGY_OPTIONS = [
  "Peanuts",
  "Tree nuts",
  "Shellfish",
  "Fish",
  "Eggs",
  "Dairy",
  "Gluten",
  "Soy",
  "Sesame",
] as const;

export const DIET_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Halal",
  "Kosher",
  "No pork",
] as const;

export const EMPTY_DIETARY: Dietary = { allergies: [], diets: [], other: "" };

export interface Logistics {
  overnight: boolean;
  parking: boolean;
  transport: boolean;
}

/** Where the guest lives, which decides what address we ask for. */
export type Residence = "australia" | "overseas" | null;

/** An Australian postal address, in Australia Post field order. */
export interface Address {
  /** Street number and name, e.g. "12 Smith Street". */
  line1: string;
  /** Unit, apartment or level. Optional. */
  line2: string;
  suburb: string;
  /** One of AU_STATES' codes, or "" until chosen. */
  state: string;
  postcode: string;
}

export const EMPTY_ADDRESS: Address = {
  line1: "",
  line2: "",
  suburb: "",
  state: "",
  postcode: "",
};

export const AU_STATES = [
  { code: "ACT", name: "Australian Capital Territory" },
  { code: "NSW", name: "New South Wales" },
  { code: "NT", name: "Northern Territory" },
  { code: "QLD", name: "Queensland" },
  { code: "SA", name: "South Australia" },
  { code: "TAS", name: "Tasmania" },
  { code: "VIC", name: "Victoria" },
  { code: "WA", name: "Western Australia" },
] as const;

/**
 * Australia Post's usual postcode ranges per state. Used only for a gentle
 * "please double-check" hint, never to reject an address: border towns and
 * Jervis Bay sit outside their state's range.
 */
const POSTCODE_RANGES: Record<string, [number, number][]> = {
  NSW: [[1000, 2599], [2619, 2899], [2921, 2999]],
  ACT: [[200, 299], [2600, 2618], [2900, 2920]],
  VIC: [[3000, 3999], [8000, 8999]],
  QLD: [[4000, 4999], [9000, 9999]],
  SA: [[5000, 5999]],
  WA: [[6000, 6999]],
  TAS: [[7000, 7999]],
  NT: [[800, 999]],
};

/** The state a 4-digit postcode usually belongs to, or null if unknown. */
export function postcodeState(postcode: string): string | null {
  if (!/^\d{4}$/.test(postcode)) return null;
  const n = Number(postcode);
  for (const [state, ranges] of Object.entries(POSTCODE_RANGES)) {
    if (ranges.some(([lo, hi]) => n >= lo && n <= hi)) return state;
  }
  return null;
}

export interface RsvpData {
  fullName: string;
  mobile: string;
  email: string;
  attending: Attending;
  /** Adults attending besides the primary guest. */
  extraAdults: ExtraAdult[];
  /** Children attending. */
  children: Child[];
  hasDietaryNeeds: YesNo;
  /** Only meaningful while `hasDietaryNeeds` is true. */
  dietary: Dietary;
  travellingOutOfTown: YesNo;
  logistics: Logistics;
  /** Free-text note sent with an acceptance. */
  message: string;
  /** Free-text note sent with a decline. */
  blessing: string;
  /** Asked of everyone, so a thank-you card can follow the day. */
  residence: Residence;
  /** Only meaningful while `residence` is "australia". */
  address: Address;
  /** Only meaningful while `residence` is "overseas". */
  country: string;
  /**
   * Honeypot. Deliberately not called "website", "company" or anything else a
   * browser or password manager recognises: a guest's autofill filled the old
   * field and their reply was thrown away. A filled value now only flags the
   * row, never discards it.
   */
  hp?: string;
}

export const EMPTY_RSVP: RsvpData = {
  fullName: "",
  mobile: "",
  email: "",
  attending: null,
  extraAdults: [],
  children: [],
  hasDietaryNeeds: null,
  dietary: { allergies: [], diets: [], other: "" },
  travellingOutOfTown: null,
  logistics: { overnight: false, parking: false, transport: false },
  message: "",
  blessing: "",
  residence: null,
  address: { ...EMPTY_ADDRESS },
  country: "",
  hp: "",
};

/** Replies close at the end of 12 October 2026, Melbourne time. */
export const RSVP_DEADLINE = new Date("2026-10-12T23:59:59+11:00");

export const RSVP_DEADLINE_LABEL = "12 October 2026";

/** One readable line for the review screen and the submitted payload. */
export function dietarySummary(data: RsvpData): string {
  if (data.hasDietaryNeeds !== true) {
    return data.hasDietaryNeeds === false ? "None" : "Not answered";
  }
  const parts = [...data.dietary.allergies, ...data.dietary.diets];
  if (data.dietary.other.trim()) parts.push(data.dietary.other.trim());
  return parts.length ? parts.join(", ") : "Yes — details to follow";
}

export function partySize(data: RsvpData): number {
  return 1 + data.extraAdults.length + data.children.length;
}

/**
 * The postal address as envelope lines, Australia Post style: unit and street
 * on one line, then SUBURB STATE POSTCODE with the suburb in capitals. Shared
 * by the review screen and both emails so all three always agree.
 */
export function addressLines(
  data: Pick<RsvpData, "residence" | "address" | "country">,
): string[] {
  if (data.residence === "overseas") {
    const country = data.country.trim();
    return [country ? `Overseas — ${country}` : "Overseas"];
  }
  if (data.residence !== "australia") return [];
  const a = data.address;
  const street = [a.line2.trim(), a.line1.trim()].filter(Boolean).join(", ");
  const locality = [a.suburb.trim().toUpperCase(), a.state, a.postcode.trim()]
    .filter(Boolean)
    .join(" ");
  return [street, locality].filter(Boolean);
}
