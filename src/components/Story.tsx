"use client";

import { useEffect, useRef } from "react";

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targets = [sectionRef.current, cardRef.current];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    targets.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="story"
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
            Our Story
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
            Two becoming one
          </h2>
        </div>

        <div
          className="grid gap-12 items-start"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
          }}
        >
          <div
            ref={cardRef}
            className="section-reveal section-reveal-delay p-8"
            style={{
              backgroundColor: "var(--color-card)",
              borderTop: "1px solid var(--color-gold-leaf)",
            }}
          >
            <p
              className="uppercase tracking-widest mb-4"
              style={{
                fontSize: "var(--text-eyebrow)",
                color: "var(--color-gold-ink)",
                letterSpacing: "0.14em",
              }}
            >
              Ecclesiastes 4:9, 12
            </p>
            <blockquote
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "var(--text-h3)",
                color: "var(--color-ink)",
                lineHeight: 1.7,
                maxWidth: "66ch",
              }}
            >
              &ldquo;Two are better than one, because they have a good return
              for their labour… A cord of three strands is not quickly
              broken.&rdquo;
            </blockquote>
            <p
              className="mt-6 leading-relaxed"
              style={{
                fontSize: "var(--text-small)",
                color: "var(--color-ink-muted)",
                maxWidth: "66ch",
              }}
            >
              Herald and Yeukai have walked together in faith, love, and
              purpose. This evening is a celebration of that unbroken cord — and
              an invitation for those who have journeyed with them to witness
              the renewal of their sacred vows.
            </p>
          </div>

          <div>
            <p
              className="leading-relaxed"
              style={{
                fontSize: "var(--text-body)",
                color: "var(--color-ink-muted)",
                maxWidth: "66ch",
              }}
            >
              Fifteen years of marriage, community, and grace. Two lives
              intertwined not by chance but by calling — built on scripture,
              strengthened by service, and grounded in a love that has grown
              through every season. Tonight, before those who matter most, they
              renew the promises that have shaped everything since.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
