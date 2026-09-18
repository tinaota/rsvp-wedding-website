"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import heroPhoto from "@/assets/herald-yeukai.jpg";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  // The staggered entrance plays once per session. The class goes straight onto
  // the DOM node — the CSS is all descendant selectors, so nothing needs to
  // re-render for it.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const key = "hero-entered";
    let seen = false;
    try {
      seen = sessionStorage.getItem(key) === "1";
      if (!seen) sessionStorage.setItem(key, "1");
    } catch {
      /* storage blocked — just play the entrance */
    }

    if (seen) {
      el.classList.add("hero-entered");
      return;
    }
    const t = setTimeout(() => el.classList.add("hero-entered"), 120);
    return () => clearTimeout(t);
  }, []);

  const scrollToStory = () => {
    document.getElementById("story")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="invitation" ref={sectionRef} style={{ scrollMarginTop: 0 }}>
      {/* One photo, two layouts: a 4:3 banner on mobile, the left half of a
          split screen from lg up. Rendering it once keeps the browser from
          preloading an image it will never show. */}
      <div className="hero-layout">
        <div className="hero-photo">
          <Image
            src={heroPhoto}
            alt="Ps Herald and Ps Yeukai Tshwanelo"
            priority
            placeholder="blur"
            sizes="(min-width: 1024px) 50vw, 100vw"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 30%",
            }}
          />
          <div
            aria-hidden="true"
            className="hidden lg:block"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, transparent 50%, rgba(245,240,232,0.12) 100%)",
            }}
          />
        </div>

        {/* Desktop invitation copy */}
        <div
          className="hidden lg:flex"
          style={{
            backgroundColor: "var(--color-background)",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "clamp(40px, 6vw, 96px) clamp(40px, 7vw, 96px)",
          }}
        >
          <div
            data-hero-item="0"
            style={{
              width: 32,
              height: 1,
              backgroundColor: "var(--color-gold-leaf)",
              marginBottom: 20,
            }}
          />
          <p
            data-hero-item="0"
            className="uppercase tracking-widest"
            style={{
              fontSize: "var(--text-eyebrow)",
              color: "var(--color-gold-ink)",
              letterSpacing: "0.14em",
              marginBottom: 8,
            }}
          >
            You are cordially invited
          </p>
          <div
            data-hero-item="1"
            aria-hidden="true"
            style={{
              fontFamily: "var(--font-script)",
              fontSize: "var(--text-monogram)",
              color: "var(--color-gold-leaf)",
              lineHeight: 1,
              marginBlock: "var(--space-4)",
            }}
          >
            H · Y
          </div>
          <h1
            data-hero-item="1"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h1)",
              fontWeight: 400,
              color: "var(--color-ink)",
              lineHeight: 1.15,
              marginBottom: 8,
            }}
          >
            Wedding Vow Renewal
          </h1>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-display)",
              fontWeight: 700,
              color: "var(--color-burgundy)",
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            <span data-hero-word="0">Ps Herald &amp; Ps Yeukai</span> <br />
            <span data-hero-word="1">Tshwanelo</span>
          </p>
          <div data-hero-item="2" style={{ marginBottom: 32 }}>
            <p
              style={{
                fontSize: "var(--text-body)",
                color: "var(--color-ink)",
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
              }}
            >
              Saturday, 7 November 2026
            </p>
            <p
              style={{
                fontSize: "var(--text-small)",
                color: "var(--color-ink-muted)",
                marginTop: 4,
              }}
            >
              6:30 PM AEDT · The Langham Melbourne
            </p>
          </div>

          <a
            data-hero-item="3"
            href="#rsvp"
            className="btn-press"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "16px 40px",
              backgroundColor: "var(--color-burgundy)",
              color: "var(--color-burgundy-ink)",
              fontSize: "var(--text-eyebrow)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              minHeight: 48,
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
            RSVP
          </a>

          <button
            data-hero-item="4"
            type="button"
            onClick={scrollToStory}
            aria-label="Scroll to Our Story"
            className="scroll-cue btn-press"
            style={{
              marginTop: 40,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-gold-leaf)",
              padding: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 4v12M5 11l5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Mobile invitation copy */}
        <div
          className="lg:hidden"
          style={{
            backgroundColor: "var(--color-background)",
            padding: "clamp(32px, 7vw, 64px) clamp(20px, 5vw, 48px)",
            paddingBottom: "calc(clamp(32px, 7vw, 64px) + 80px)",
            textAlign: "center",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              fontFamily: "var(--font-script)",
              fontSize: "var(--text-monogram)",
              color: "var(--color-gold-leaf)",
              lineHeight: 1,
              marginBottom: 12,
            }}
          >
            H · Y
          </div>
          <p
            className="uppercase tracking-widest"
            style={{
              fontSize: "var(--text-eyebrow)",
              color: "var(--color-gold-ink)",
              letterSpacing: "0.14em",
              marginBottom: 16,
            }}
          >
            You are cordially invited
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h1)",
              fontWeight: 400,
              color: "var(--color-ink)",
              lineHeight: 1.15,
              marginBottom: 8,
            }}
          >
            Wedding Vow Renewal
          </h1>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h2)",
              fontWeight: 700,
              color: "var(--color-burgundy)",
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            Ps Herald &amp; Ps Yeukai Tshwanelo
          </p>
          <div
            aria-hidden="true"
            style={{
              width: 40,
              height: 1,
              backgroundColor: "var(--color-gold-leaf)",
              margin: "0 auto 20px",
            }}
          />
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "var(--text-body)",
              color: "var(--color-ink)",
              marginBottom: 6,
            }}
          >
            Saturday, 7 November 2026
          </p>
          <p
            style={{
              fontSize: "var(--text-small)",
              color: "var(--color-ink-muted)",
            }}
          >
            6:30 PM AEDT · The Langham Melbourne
          </p>
        </div>
      </div>
    </section>
  );
}
