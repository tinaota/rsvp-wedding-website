"use client";

import { useEffect, useState } from "react";

/**
 * Every anchored section, in page order. The header nav, the mobile menu and
 * the right-hand rail all read from this, so their labels cannot drift apart.
 */
export const SECTIONS = [
  { id: "invitation", label: "Invitation" },
  { id: "story", label: "Our Story" },
  { id: "schedule", label: "The Evening" },
  { id: "venue", label: "Venue" },
  { id: "attire", label: "Attire" },
  { id: "rsvp", label: "RSVP" },
] as const;

/** The nav lists skip the hero — the monogram is already a link back to it. */
export const NAV_SECTIONS = SECTIONS.filter((s) => s.id !== "invitation");

/**
 * Which section the reader is currently in. The margins bias the answer
 * towards whatever sits just under the sticky header rather than whatever
 * happens to be tallest on screen.
 */
export function useActiveSection() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const elements = SECTIONS.map(({ id }) =>
      document.getElementById(id),
    ).filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return activeId;
}
