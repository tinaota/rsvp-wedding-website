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
