"use client";

import { useEffect, useRef } from "react";

const SCHEDULE = [
  {
    time: "6:30 PM AEDT",
    event: "Guest Arrival",
    note: "Welcome drinks & seating",
  },
  {
    time: "7:00 – 7:30 PM AEDT",
    event: "Vow Renewal Ceremony",
    note: "30 minutes of joy",
  },
  {
    time: "7:30 – 10:30 PM AEDT",
    event: "Reception & Dinner",
    note: "Celebrate, dine, dance",
  },
] as const;

export default function Schedule() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
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
    if (sectionRef.current) observer.observe(sectionRef.current);
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="schedule"
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
            The Evening
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
            The Evening
          </h2>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="lg:hidden">
          <div className="relative pl-8">
            <div
              aria-hidden="true"
              className="timeline-rule absolute left-3 top-2 bottom-2 w-px"
              style={{
                backgroundColor: "var(--color-gold-leaf)",
                transformOrigin: "top center",
              }}
            />
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {SCHEDULE.map((item, i) => (
                <li
                  key={item.event}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  className="timeline-item relative pb-10 last:pb-0"
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <div
                    aria-hidden="true"
                    className="absolute -left-5 top-1.5 w-3 h-3 rounded-full border-2"
                    style={{
                      backgroundColor: "var(--color-burgundy)",
                      borderColor: "var(--color-card)",
                      boxShadow: "0 0 0 2px var(--color-burgundy)",
                    }}
                  />
                  <p
                    className="uppercase tracking-widest mb-1"
                    style={{
                      fontSize: "var(--text-eyebrow)",
                      color: "var(--color-gold-ink)",
                      letterSpacing: "0.14em",
                    }}
                  >
                    {item.time}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-h3)",
                      fontWeight: 600,
                      color: "var(--color-ink)",
                      lineHeight: 1.3,
                    }}
                  >
                    {item.event}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--text-small)",
                      color: "var(--color-ink-muted)",
                      marginTop: 4,
                    }}
                  >
                    {item.note}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Desktop: three linked cards */}
        <ol
          className="hidden lg:grid grid-cols-3 gap-6"
          style={{ listStyle: "none", margin: 0, padding: 0 }}
        >
          {SCHEDULE.map((item, i) => (
            <li
              key={item.event}
              ref={(el) => {
                itemRefs.current[i + SCHEDULE.length] = el;
              }}
              className="timeline-item p-8 relative"
              style={{
                backgroundColor: "var(--color-background)",
                borderTop: "2px solid var(--color-gold-leaf)",
                transitionDelay: `${i * 70}ms`,
              }}
            >
              <p
                className="uppercase tracking-widest mb-3"
                style={{
                  fontSize: "var(--text-eyebrow)",
                  color: "var(--color-gold-ink)",
                  letterSpacing: "0.14em",
                }}
              >
                {item.time}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-h3)",
                  fontWeight: 600,
                  color: "var(--color-ink)",
                  lineHeight: 1.3,
                }}
              >
                {item.event}
              </p>
              <p
                style={{
                  fontSize: "var(--text-small)",
                  color: "var(--color-ink-muted)",
                  marginTop: 8,
                }}
              >
                {item.note}
              </p>
              {i < SCHEDULE.length - 1 && (
                <div
                  aria-hidden="true"
                  className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px"
                  style={{ backgroundColor: "var(--color-gold-leaf)" }}
                />
              )}
            </li>
          ))}
        </ol>

        <p
          className="mt-10 text-center"
          style={{
            fontSize: "var(--text-small)",
            color: "var(--color-ink-muted)",
          }}
        >
          All times are Melbourne time (AEDT).
        </p>
      </div>
    </section>
  );
}
