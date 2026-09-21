"use client";

import { useEffect, useRef } from "react";
import { RSVP_DEADLINE_LABEL, dietarySummary, type RsvpData } from "./types";
import { Button, ErrorText, headingStyle } from "./ui";

interface Props {
  data: RsvpData;
  onSubmit: () => void;
  onBack: () => void;
  onGoTo: (step: number) => void;
  submitting: boolean;
  error: string | null;
}

function Row({
  label,
  value,
  step,
  onEdit,
}: {
  label: string;
  value: string;
  step: number;
  onEdit: (step: number) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 16,
        padding: "12px 0",
        borderBottom: "1px solid var(--color-border-hairline)",
      }}
    >
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: "var(--text-eyebrow)",
            color: "var(--color-ink-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 2,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: "var(--text-small)",
            color: "var(--color-ink)",
            whiteSpace: "pre-line",
          }}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onEdit(step)}
        aria-label={`Edit ${label}`}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-burgundy)",
          fontSize: "var(--text-eyebrow)",
          textDecoration: "underline",
          fontFamily: "var(--font-body)",
          padding: "8px 0 8px 8px",
          flexShrink: 0,
          letterSpacing: "0.08em",
        }}
      >
        Edit
      </button>
    </div>
  );
}

export default function StepReview({
  data,
  onSubmit,
  onBack,
  onGoTo,
  submitting,
  error,
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const isAccepts = data.attending === "accepts";
  const totalAdults = 1 + data.extraAdults.length;
  const totalChildren = data.children.length;

  const partyLines = [`${data.fullName} (you)`];
  data.extraAdults.forEach((a, i) => {
    partyLines.push(
      a.tbc ? `Adult ${i + 2} — name to follow` : a.name || `Adult ${i + 2}`,
    );
  });
  data.children.forEach((c, i) => {
    partyLines.push(
      `${c.name || `Child ${i + 1}`}${c.age ? `, age ${c.age}` : ""}`,
    );
  });

  const hasLogistics =
    data.logistics.overnight ||
    data.logistics.parking ||
    data.logistics.transport;

  const partyLabel = `Your party (${totalAdults} adult${totalAdults !== 1 ? "s" : ""}${
    totalChildren
      ? `, ${totalChildren} ${totalChildren === 1 ? "child" : "children"}`
      : ""
  })`;

  return (
    <div>
      <h3
        ref={headingRef}
        tabIndex={-1}
        style={{ ...headingStyle, marginBottom: 8 }}
      >
        Review &amp; send
      </h3>
      <p
        style={{
          fontSize: "var(--text-small)",
          color: "var(--color-ink-muted)",
          marginBottom: 28,
        }}
      >
        Please check everything looks right before sending.
      </p>

      <div
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border-hairline)",
          padding: 24,
          borderRadius: "var(--radius-sm, 4px)",
          marginBottom: 24,
        }}
      >
        <Row label="Name" value={data.fullName} step={1} onEdit={onGoTo} />
        <Row label="Mobile" value={data.mobile} step={1} onEdit={onGoTo} />
        {data.email && (
          <Row label="Email" value={data.email} step={1} onEdit={onGoTo} />
        )}
        <Row
          label="Reply"
          value={isAccepts ? "Joyfully accepts" : "Regretfully declines"}
          step={2}
          onEdit={onGoTo}
        />

        {isAccepts && (
          <>
            <Row
              label={partyLabel}
              value={partyLines.join("\n")}
              step={3}
              onEdit={onGoTo}
            />
            <Row
              label="Dietary needs"
              value={dietarySummary(data)}
              step={3}
              onEdit={onGoTo}
            />
            {hasLogistics && (
              <Row
                label="Logistics"
                value={[
                  data.logistics.overnight && "Overnight at The Langham",
                  data.logistics.parking && "Parking validation",
                  data.logistics.transport && "Transport assistance",
                ]
                  .filter(Boolean)
                  .join("\n")}
                step={3}
                onEdit={onGoTo}
              />
            )}
            {data.message && (
              <Row
                label="Message"
                value={data.message}
                step={3}
                onEdit={onGoTo}
              />
            )}
          </>
        )}

        {!isAccepts && data.blessing && (
          <Row
            label="Blessing"
            value={data.blessing}
            step={3}
            onEdit={onGoTo}
          />
        )}
      </div>

      <p
        style={{
          fontSize: "var(--text-small)",
          color: "var(--color-ink-muted)",
          marginBottom: 24,
          fontStyle: "italic",
        }}
      >
        Need to change your reply before {RSVP_DEADLINE_LABEL}? Email
        yeukaiweddingvowrenewal@gmail.com and we&rsquo;ll update it for you.
      </p>

      {error && (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          style={{ marginBottom: 20 }}
        >
          <ErrorText id="submit-error">{error}</ErrorText>
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <Button variant="secondary" onClick={onBack} flex={1}>
          Back
        </Button>
        <Button onClick={onSubmit} flex={2} busy={submitting}>
          {submitting ? "Sending…" : "Send our reply"}
        </Button>
      </div>
    </div>
  );
}
