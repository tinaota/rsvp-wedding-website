"use client";

import { SECTIONS, useActiveSection } from "./sections";

/**
 * A row of markers down the right edge showing where in the evening's story the
 * reader currently is, and jumping to any part of it. Hovering or focusing a
 * marker names the section.
 *
 * Desktop only: on a phone there is no room beside the content, and the sticky
 * RSVP bar already covers the one link that matters there.
 */
export default function SectionRail() {
  const activeId = useActiveSection();

  return (
    <nav className="section-rail" aria-label="Jump to section">
      <ul>
        {SECTIONS.map(({ id, label }) => {
          const isActive = activeId === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={isActive ? "location" : undefined}
                data-active={isActive ? "true" : undefined}
              >
                <span className="rail-label">{label}</span>
                <span className="rail-dot" aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
