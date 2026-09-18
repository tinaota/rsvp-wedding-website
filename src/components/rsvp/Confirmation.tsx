"use client";

import { useEffect, useRef } from "react";
import { RSVP_DEADLINE_LABEL, type RsvpData } from "./types";

const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=The+Langham+Melbourne,+1+Southgate+Ave,+Southbank+VIC+3006";

function googleCalendarUrl(data: RsvpData) {
  const attending =
    `${1 + data.extraAdults.length} adults` +
    (data.children.length ? `, ${data.children.length} children` : "");
  return (
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=Vow+Renewal+%E2%80%94+Herald+%26+Yeukai+Tshwanelo" +
    "&dates=20261107T093000Z%2F20261107T123000Z" +
    "&location=The+Langham+Melbourne%2C+1+Southgate+Ave%2C+Southbank+VIC+3006" +
    `&details=Attending%3A+${encodeURIComponent(attending)}`
  );
}

function downloadIcs() {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Herald & Yeukai Vow Renewal//EN",
    "BEGIN:VEVENT",
    "UID:vow-renewal-2026-herald-yeukai@tshwanelo",
    "DTSTAMP:20260914T000000Z",
    "DTSTART:20261107T093000Z",
    "DTEND:20261107T123000Z",
    "SUMMARY:Vow Renewal — Ps Herald & Ps Yeukai Tshwanelo",
    "LOCATION:The Langham Melbourne\\, 1 Southgate Ave\\, Southbank VIC 3006",
    "DESCRIPTION:Arrival 6:30 PM AEDT · Ceremony 7:00 PM AEDT · Reception 7:30 PM AEDT\\nPlease validate parking at hotel reception.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vow-renewal-tshwanelo.ics";
  a.click();
  URL.revokeObjectURL(url);
}

const outlineButton: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: 52,
  border: "1.5px solid var(--color-burgundy)",
  backgroundColor: "transparent",
  color: "var(--color-burgundy)",
  fontSize: "var(--text-eyebrow)",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  textDecoration: "none",
  fontFamily: "var(--font-body)",
  borderRadius: "var(--radius-full)",
  cursor: "pointer",
  transition:
    "background-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)",
};

function fillOnHover(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.backgroundColor = "var(--color-burgundy)";
  e.currentTarget.style.color = "var(--color-burgundy-ink)";
}
function clearOnLeave(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.style.backgroundColor = "transparent";
  e.currentTarget.style.color = "var(--color-burgundy)";
}

export default function Confirmation({ data }: { data: RsvpData }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isAccepts = data.attending === "accepts";
  const firstName = data.fullName.split(" ")[0] || data.fullName;
  const totalAdults = 1 + data.extraAdults.length;
  const totalChildren = data.children.length;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      id="confirmed"
      style={{
        padding: "clamp(48px, 8vw, 96px) clamp(20px, 5vw, 48px)",
        textAlign: "center",
        backgroundColor: "var(--color-background)",
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke="var(--color-gold-leaf)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="339.3"
            strokeDashoffset="339.3"
            className="seal-draw"
          />
          <circle
            cx="60"
            cy="60"
            r="46"
            stroke="var(--color-gold-leaf)"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="289"
            strokeDashoffset="289"
            className="seal-draw"
            style={{ animationDelay: "200ms" }}
          />
          <text
            x="60"
            y="70"
            textAnchor="middle"
            fill="var(--color-gold-leaf)"
            fontSize="22"
            fontFamily="var(--font-script)"
          >
            H · Y
          </text>
        </svg>
      </div>

      <h2
        ref={headingRef}
        tabIndex={-1}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-h1)",
          fontWeight: 600,
          color: "var(--color-ink)",
          marginBottom: 12,
          outline: "none",
        }}
      >
        Thank you, {firstName}.
      </h2>

      {isAccepts ? (
        <p
          style={{
            fontSize: "var(--text-body)",
            color: "var(--color-ink-muted)",
            maxWidth: "50ch",
            margin: "0 auto 8px",
          }}
        >
          We have you down for{" "}
          <strong style={{ color: "var(--color-ink)" }}>
            {totalAdults} adult{totalAdults !== 1 ? "s" : ""}
            {totalChildren > 0
              ? ` and ${totalChildren} ${totalChildren === 1 ? "child" : "children"}`
              : ""}
          </strong>
          . We can&rsquo;t wait to celebrate with you.
        </p>
      ) : (
        <p
          style={{
            fontSize: "var(--text-body)",
            color: "var(--color-ink-muted)",
            maxWidth: "50ch",
            margin: "0 auto 8px",
          }}
        >
          We&rsquo;re sorry you won&rsquo;t be able to join us, and thank you
          for your kind words. You&rsquo;ll be in our thoughts on the day.
        </p>
      )}

      <div
        aria-hidden="true"
        style={{
          width: 40,
          height: 1,
          backgroundColor: "var(--color-gold-leaf)",
          margin: "24px auto",
        }}
      />

      {isAccepts && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxWidth: 400,
            margin: "0 auto 24px",
          }}
        >
          <a
            href={googleCalendarUrl(data)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-press"
            style={outlineButton}
            onMouseEnter={fillOnHover}
            onMouseLeave={clearOnLeave}
          >
            Add to Google Calendar
            <span className="sr-only">(opens in a new tab)</span>
          </a>

          <button
            type="button"
            onClick={downloadIcs}
            className="btn-press"
            style={outlineButton}
            onMouseEnter={fillOnHover}
            onMouseLeave={clearOnLeave}
          >
            Download .ics (Apple / Outlook)
          </button>

          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "var(--text-small)",
              color: "var(--color-burgundy)",
              textDecoration: "underline",
              fontFamily: "var(--font-body)",
            }}
          >
            Get Driving Directions to The Langham Melbourne
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      )}

      <p
        style={{
          fontSize: "var(--text-small)",
          color: "var(--color-ink-muted)",
          fontStyle: "italic",
          maxWidth: "52ch",
          margin: "0 auto",
        }}
      >
        You can change your reply any time until {RSVP_DEADLINE_LABEL} using the
        link in your confirmation email.
      </p>
    </div>
  );
}
