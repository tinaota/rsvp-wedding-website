"use client";

import { useEffect, useRef } from "react";

const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=The+Langham+Melbourne,+1+Southgate+Ave,+Southbank+VIC+3006";

/** The Langham Melbourne, 1 Southgate Ave — from OpenStreetMap. */
const VENUE = { lat: -37.8205784, lon: 144.9657396 };

/** A block or so either side of the hotel: enough to place it against the Yarra. */
const BBOX = [
  VENUE.lon - 0.006,
  VENUE.lat - 0.003,
  VENUE.lon + 0.006,
  VENUE.lat + 0.003,
].join(",");

const MAP_EMBED_URL =
  `https://www.openstreetmap.org/export/embed.html?bbox=${BBOX}` +
  `&layer=mapnik&marker=${VENUE.lat},${VENUE.lon}`;

/**
 * A locator map, not a tool. The frame is inert — panning it would trap the
 * page scroll on a phone — so the whole thing is a link that hands the guest
 * over to Google Maps, where they can actually get directions.
 */
function VenueMap() {
  return (
    <figure style={{ margin: 0 }}>
      <div
        className="venue-map"
        style={{
          position: "relative",
          aspectRatio: "4/3",
          overflow: "hidden",
          // OSM's land tone is within a hair of our background, so any sliver
          // the scaled frame leaves at an edge simply disappears.
          backgroundColor: "var(--color-background)",
          border: "1px solid var(--color-border-hairline)",
        }}
      >
        <iframe
          src={MAP_EMBED_URL}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          aria-hidden="true"
          tabIndex={-1}
          // The embed draws its own zoom buttons and a "report a problem" bar,
          // which would be dead controls on an inert frame. Scaling the frame
          // up pushes them outside the crop — and unlike sizing the frame
          // larger, it never makes the embed re-lay-out, so nothing can end up
          // half-drawn. Attribution moves to the caption below.
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
            transform: "scale(1.34)",
            transformOrigin: "center",
            pointerEvents: "none",
          }}
        />

        <a
          href={DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="venue-map-link"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
            textDecoration: "none",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              minHeight: 44,
              padding: "10px 20px",
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: "var(--radius-full)",
              color: "var(--color-burgundy)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-eyebrow)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              transition:
                "background-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="10"
                cy="8"
                r="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M10 2.5C10 2.5 4.5 7 4.5 11.5C4.5 15 7 17.5 10 17.5C13 17.5 15.5 15 15.5 11.5C15.5 7 10 2.5 10 2.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            Open in Google Maps
            <span className="sr-only">(opens in a new tab)</span>
          </span>
        </a>
      </div>

      <figcaption
        style={{
          marginTop: 8,
          fontSize: "var(--text-eyebrow)",
          color: "var(--color-ink-muted)",
        }}
      >
        1 Southgate Ave, Southbank · map ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          OpenStreetMap
        </a>{" "}
        contributors
      </figcaption>
    </figure>
  );
}

export default function Venue() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="venue"
      ref={sectionRef}
      className="section-reveal"
      style={{ padding: "clamp(64px, 9vw, 128px) 0" }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-20">
        <div className="mb-12 text-center">
          <p
            className="uppercase tracking-widest"
            style={{
              fontSize: "var(--text-eyebrow)",
              color: "var(--color-gold-ink)",
              letterSpacing: "0.14em",
              marginBottom: 12,
            }}
          >
            Venue
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h2)",
              fontWeight: 600,
              color: "var(--color-ink)",
              lineHeight: 1.15,
            }}
          >
            The Langham Melbourne
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <address
              className="not-italic mb-4"
              style={{
                fontSize: "var(--text-body)",
                color: "var(--color-ink)",
                lineHeight: 1.7,
              }}
            >
              1 Southgate Ave
              <br />
              Southbank VIC 3006
            </address>

            <div
              className="p-5 mb-8 flex gap-4 items-start on-burgundy"
              style={{
                backgroundColor: "var(--color-burgundy)",
                color: "var(--color-burgundy-ink)",
              }}
            >
              <span
                aria-hidden="true"
                style={{ fontSize: "1.25rem", lineHeight: 1, marginTop: 2 }}
              >
                🅿
              </span>
              <div>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: "var(--text-small)",
                    fontFamily: "var(--font-body)",
                    marginBottom: 4,
                  }}
                >
                  Discounted parking is available.
                </p>
                <p style={{ fontSize: "var(--text-small)", opacity: 0.9 }}>
                  Please have your ticket validated at hotel reception.
                </p>
              </div>
            </div>

            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press inline-flex items-center gap-2"
              style={{
                padding: "14px 28px",
                minHeight: 44,
                border: "1.5px solid var(--color-burgundy)",
                color: "var(--color-burgundy)",
                fontSize: "var(--text-small)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                fontFamily: "var(--font-body)",
                transition:
                  "background-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-burgundy)";
                e.currentTarget.style.color = "var(--color-burgundy-ink)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--color-burgundy)";
              }}
            >
              Get Driving Directions
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>

          <VenueMap />
        </div>
      </div>
    </section>
  );
}
