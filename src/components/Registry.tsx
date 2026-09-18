"use client";

import { useEffect, useRef } from "react";

/**
 * The gift registry link. Leaving this an empty string makes the section show
 * "Details to follow" instead of a dead button, so a guest never meets a link
 * that goes nowhere.
 *
 * Kept exactly as David Jones issued it, double slash and all — that form
 * resolves, and rewriting a retailer's registry URL is not worth the risk.
 */
const REGISTRY_URL =
  "https://www.davidjones.com//default.aspx?Z=giftregistry&action=view&id=ADFFEFB5-0A92-4657-8268-87118D389ADC&order=0";

/** Shown on the button and read out to screen readers. */
const REGISTRY_LABEL = "View our registry";

export default function Registry() {
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
      id="registry"
      ref={sectionRef}
      className="section-reveal"
      style={{ padding: "clamp(64px, 9vw, 128px) 0" }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-20 text-center">
        <p
          className="uppercase tracking-widest"
          style={{
            fontSize: "var(--text-eyebrow)",
            color: "var(--color-gold-ink)",
            letterSpacing: "0.14em",
            marginBottom: 12,
          }}
        >
          Registry
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
          Your presence is the gift
        </h2>

        <p
          className="mt-3 mx-auto leading-relaxed"
          style={{
            fontSize: "var(--text-body)",
            color: "var(--color-ink-muted)",
            maxWidth: "52ch",
          }}
        >
          Having you with us on the evening is more than enough. For those who
          have asked, we have a small registry at David Jones.
        </p>

        <div
          aria-hidden="true"
          style={{
            width: 40,
            height: 1,
            backgroundColor: "var(--color-gold-leaf)",
            margin: "28px auto",
          }}
        />

        {REGISTRY_URL ? (
          <a
            href={REGISTRY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-press inline-flex items-center gap-2"
            style={{
              padding: "16px 40px",
              minHeight: 48,
              backgroundColor: "var(--color-burgundy)",
              color: "var(--color-burgundy-ink)",
              fontSize: "var(--text-eyebrow)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              borderRadius: "var(--radius-full)",
              transition:
                "background-color var(--dur-fast) var(--ease-standard)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--color-burgundy-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-burgundy)";
            }}
          >
            {REGISTRY_LABEL}
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : (
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "var(--text-body)",
              color: "var(--color-ink-muted)",
            }}
          >
            Details to follow.
          </p>
        )}
      </div>
    </section>
  );
}
