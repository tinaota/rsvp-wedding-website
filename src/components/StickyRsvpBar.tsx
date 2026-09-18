"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mobile-only call to action. It appears once the hero has scrolled away and
 * retreats again while the RSVP section itself is on screen.
 */
export default function StickyRsvpBar() {
  const [visible, setVisible] = useState(false);
  const [animClass, setAnimClass] = useState("");
  const visibleRef = useRef(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const hero = document.getElementById("invitation");
    const rsvp = document.getElementById("rsvp");
    if (!hero || !rsvp) return;

    let heroOut = false;
    let rsvpIn = false;

    const update = () => {
      const shouldShow = heroOut && !rsvpIn;
      if (shouldShow === visibleRef.current) return;

      if (exitTimer.current) {
        clearTimeout(exitTimer.current);
        exitTimer.current = null;
      }

      if (shouldShow) {
        visibleRef.current = true;
        setAnimClass("sticky-bar-enter");
        setVisible(true);
      } else {
        visibleRef.current = false;
        setAnimClass("sticky-bar-exit");
        exitTimer.current = setTimeout(() => setVisible(false), 240);
      }
    };

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroOut = !entry.isIntersecting;
        update();
      },
      { threshold: 0 },
    );
    const rsvpObserver = new IntersectionObserver(
      ([entry]) => {
        rsvpIn = entry.isIntersecting;
        update();
      },
      { threshold: 0.1 },
    );

    heroObserver.observe(hero);
    rsvpObserver.observe(rsvp);

    return () => {
      heroObserver.disconnect();
      rsvpObserver.disconnect();
      if (exitTimer.current) clearTimeout(exitTimer.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 on-burgundy ${animClass}`}
      style={{
        backgroundColor: "var(--color-burgundy)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <a
        href="#rsvp"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(16px, 5vw, 32px)",
          height: 64,
          color: "var(--color-burgundy-ink)",
          textDecoration: "none",
          fontFamily: "var(--font-body)",
        }}
      >
        <span>
          <span
            style={{
              display: "block",
              fontSize: "var(--text-small)",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            RSVP
          </span>
          <span
            style={{
              display: "block",
              fontSize: "var(--text-eyebrow)",
              opacity: 0.8,
            }}
          >
            Respond by 12 October 2026
          </span>
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 10h10M11 6l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  );
}
