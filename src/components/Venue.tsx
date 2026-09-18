"use client";

import { useEffect, useRef } from "react";

const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=The+Langham+Melbourne,+1+Southgate+Ave,+Southbank+VIC+3006";

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

          <div
            className="hidden lg:flex items-center justify-center"
            style={{
              aspectRatio: "4/3",
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border-hairline)",
              flexDirection: "column",
              gap: 12,
              color: "var(--color-ink-muted)",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="20"
                cy="18"
                r="7"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M20 11 C20 11 12 19 12 24 C12 29 16 33 20 33 C24 33 28 29 28 24 C28 19 20 11 20 11Z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="20" cy="18" r="2.5" fill="currentColor" />
            </svg>
            <p style={{ fontSize: "var(--text-small)" }}>
              1 Southgate Ave, Southbank
            </p>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "var(--text-eyebrow)",
                color: "var(--color-burgundy)",
                textDecoration: "underline",
              }}
            >
              Open in Google Maps
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
