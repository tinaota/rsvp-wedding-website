import type { RsvpData } from "@/components/rsvp/types";

/**
 * A reply that has been through `parse()`: same shape the client builds, but
 * with the one field the client leaves nullable narrowed. The route used to
 * keep its own copy of the whole interface and it drifted; this derives from
 * the client type so it cannot.
 */
export type RsvpSubmission = RsvpData & {
  attending: "accepts" | "declines";
};
