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
  travellingOutOfTown: null,
  logistics: { overnight: false, parking: false, transport: false },
  message: "",
  blessing: "",
};

/** Replies close at the end of 12 October 2026, Melbourne time. */
export const RSVP_DEADLINE = new Date("2026-10-12T23:59:59+11:00");

export const RSVP_DEADLINE_LABEL = "12 October 2026";

export function partySize(data: RsvpData): number {
  return 1 + data.extraAdults.length + data.children.length;
}
