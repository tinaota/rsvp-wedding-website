"use client";

import { useEffect, useRef } from "react";

const SWATCHES = [
  { name: "Formal Black", hex: "#1a1a1a" },
  { name: "Deep Burgundy", hex: "#5A0F24" },
  { name: "Midnight Navy", hex: "#1b2a4a" },
  { name: "Chocolate Brown", hex: "#4a2c17" },
  { name: "Warm Ivory", hex: "#f5f0e0" },
  { name: "Muted Taupe", hex: "#9b8b7a" },
] as const;

export default function Attire() {
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
      id="attire"
      ref={sectionRef}
      className="section-reveal"
      style={{
        backgroundColor: "var(--color-card)",
        padding: "clamp(64px, 9vw, 128px) 0",
      }}
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
            Dress Code
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
            Formal Attire
          </h2>
          <p
            className="mt-3 mx-auto"
            style={{
              fontSize: "var(--text-body)",
              color: "var(--color-ink-muted)",
              maxWidth: "52ch",
            }}
          >
            Guests are warmly invited to dress within the following palette to
            complement the evening&rsquo;s aesthetic.
          </p>
        </div>

        <ul
          className="swatch-grid grid gap-5 mb-10"
          style={{ listStyle: "none", margin: "0 0 2.5rem", padding: 0 }}
        >
          {SWATCHES.map((swatch) => (
            <li key={swatch.name} className="flex flex-col items-center gap-3">
              <span
                aria-hidden="true"
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: swatch.hex,
                  border: "2px solid var(--color-border-strong)",
                  borderRadius: "var(--radius-sm, 4px)",
                  flexShrink: 0,
                }}
              />
              <p
                className="text-center"
                style={{
                  fontSize: "var(--text-small)",
                  color: "var(--color-ink)",
                }}
              >
                {swatch.name}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
